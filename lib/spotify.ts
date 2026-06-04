// Spotify Web API client + OAuth helpers.
//
// Auth model: OAuth 2.0 Authorization Code flow with a *server-side* token
// exchange — the client secret stays on the server and never reaches the
// browser. A random `state` value (set as a cookie, see lib/session.ts) guards
// the callback against CSRF.
//
// Scopes are read-only for this milestone (listing playlists). The Liked Songs
// scope (user-library-read) and the playlist-modify scopes are added in the
// later Liked-Songs and transfer milestones — keep this list minimal so the
// consent screen only asks for what we actually use.

export const SPOTIFY_SCOPES = [
  "playlist-read-private",
  "playlist-read-collaborative",
] as const;

const AUTHORIZE_ENDPOINT = "https://accounts.spotify.com/authorize";
const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const API_BASE = "https://api.spotify.com/v1";

const DEFAULT_REDIRECT_URI = "http://localhost:3000/api/auth/spotify/callback";

// Thrown when the Spotify credentials aren't set in the environment, so callers
// can show a helpful "configure Spotify" message instead of a stack trace.
export class SpotifyConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SpotifyConfigError";
  }
}

// Thrown for non-2xx responses from Spotify, carrying the HTTP status so callers
// can react (e.g. clear the session on 401).
export class SpotifyApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "SpotifyApiError";
    this.status = status;
  }
}

interface SpotifyConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

// Reads Spotify credentials from the environment. Empty/unset values are treated
// as "not configured" and raise SpotifyConfigError.
export function getSpotifyConfig(): SpotifyConfig {
  const clientId = process.env.SPOTIFY_CLIENT_ID?.trim();
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET?.trim();
  const redirectUri =
    process.env.SPOTIFY_REDIRECT_URI?.trim() || DEFAULT_REDIRECT_URI;

  if (!clientId || !clientSecret) {
    throw new SpotifyConfigError(
      "Spotify credentials are not set. Add SPOTIFY_CLIENT_ID and " +
        "SPOTIFY_CLIENT_SECRET to .env.local (see .env.example), then restart " +
        "the dev server.",
    );
  }

  return { clientId, clientSecret, redirectUri };
}

// Server-only, normalized view of the token set we persist in the session
// cookie. `expiresAt` is epoch milliseconds, already adjusted by a safety margin.
export interface SpotifySession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number; // seconds
  refresh_token?: string; // Spotify omits this on some refreshes
}

// Refresh slightly early so a request never races the token's true expiry.
const EXPIRY_SAFETY_MS = 60_000;

function tokenResponseToSession(
  data: SpotifyTokenResponse,
  fallbackRefreshToken?: string,
): SpotifySession {
  const refreshToken = data.refresh_token ?? fallbackRefreshToken;
  if (!refreshToken) {
    throw new SpotifyApiError(500, "Spotify did not return a refresh token.");
  }
  return {
    accessToken: data.access_token,
    refreshToken,
    expiresAt: Date.now() + data.expires_in * 1000 - EXPIRY_SAFETY_MS,
  };
}

function basicAuthHeader(clientId: string, clientSecret: string): string {
  const encoded = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  return `Basic ${encoded}`;
}

// Builds the Spotify authorize URL the user is redirected to. `state` is an
// opaque random value also stored in a cookie and re-checked on callback.
export function buildAuthorizeUrl(state: string): string {
  const { clientId, redirectUri } = getSpotifyConfig();
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope: SPOTIFY_SCOPES.join(" "),
    redirect_uri: redirectUri,
    state,
    // Force the consent screen each time so the connect flow is easy to re-test.
    // Set to "false" before public launch for a smoother repeat experience.
    show_dialog: "true",
  });
  return `${AUTHORIZE_ENDPOINT}?${params.toString()}`;
}

// Exchanges the authorization `code` from the callback for access + refresh tokens.
export async function exchangeCodeForTokens(
  code: string,
): Promise<SpotifySession> {
  const { clientId, clientSecret, redirectUri } = getSpotifyConfig();

  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: basicAuthHeader(clientId, clientSecret),
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new SpotifyApiError(
      res.status,
      `Token exchange failed: ${await safeErrorDetail(res)}`,
    );
  }

  return tokenResponseToSession((await res.json()) as SpotifyTokenResponse);
}

// Uses the refresh token to obtain a fresh access token. Spotify may or may not
// return a new refresh token; if it doesn't, we keep the existing one.
export async function refreshAccessToken(
  refreshToken: string,
): Promise<SpotifySession> {
  const { clientId, clientSecret } = getSpotifyConfig();

  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: basicAuthHeader(clientId, clientSecret),
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new SpotifyApiError(
      res.status,
      `Token refresh failed: ${await safeErrorDetail(res)}`,
    );
  }

  return tokenResponseToSession(
    (await res.json()) as SpotifyTokenResponse,
    refreshToken,
  );
}

async function safeErrorDetail(res: Response): Promise<string> {
  try {
    const body = await res.json();
    return (
      body?.error_description ||
      body?.error?.message ||
      body?.error ||
      `HTTP ${res.status}`
    );
  } catch {
    return `HTTP ${res.status}`;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Authenticated GET against the Spotify Web API, with one polite retry on a 429
// rate-limit response (honoring Retry-After, per the API notes in CLAUDE.md).
async function spotifyGet<T>(accessToken: string, pathOrUrl: string): Promise<T> {
  const url = pathOrUrl.startsWith("http") ? pathOrUrl : `${API_BASE}${pathOrUrl}`;

  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });

    if (res.status === 429 && attempt === 0) {
      const retryAfter = Number(res.headers.get("Retry-After") ?? "1");
      await sleep(Math.min(Number.isFinite(retryAfter) ? retryAfter : 1, 5) * 1000);
      continue;
    }

    if (!res.ok) {
      throw new SpotifyApiError(res.status, await safeErrorDetail(res));
    }

    return (await res.json()) as T;
  }

  throw new SpotifyApiError(429, "Spotify is rate-limiting requests. Please try again.");
}

export interface SpotifyUser {
  id: string;
  displayName: string | null;
}

interface SpotifyMeResponse {
  id: string;
  display_name: string | null;
}

// Fetches the connected user's profile — used to confirm "Connected as …".
export async function fetchCurrentUser(
  accessToken: string,
): Promise<SpotifyUser> {
  const data = await spotifyGet<SpotifyMeResponse>(accessToken, "/me");
  return { id: data.id, displayName: data.display_name };
}

// A trimmed, UI-friendly playlist shape. We deliberately return only what the
// UI needs rather than raw Spotify objects — smaller payload, and nothing extra
// leaks to the client.
export interface PlaylistSummary {
  id: string;
  name: string;
  imageUrl: string | null;
  trackCount: number;
  owner: string | null;
  collaborative: boolean;
  isPublic: boolean | null;
  spotifyUrl: string | null;
}

interface SpotifyPlaylistObject {
  id: string;
  name: string;
  images: { url: string }[] | null;
  tracks: { total: number } | null;
  owner: { display_name?: string | null } | null;
  collaborative: boolean;
  public: boolean | null;
  external_urls: { spotify?: string } | null;
}

interface SpotifyPagingObject<T> {
  items: T[];
  next: string | null;
}

const PLAYLIST_PAGE_LIMIT = 50; // Spotify's max page size
const MAX_PLAYLIST_PAGES = 10; // safety cap → up to 500 playlists

// Fetches all of the current user's playlists, following pagination links.
export async function fetchUserPlaylists(
  accessToken: string,
): Promise<PlaylistSummary[]> {
  const playlists: PlaylistSummary[] = [];
  let nextUrl: string | null = `/me/playlists?limit=${PLAYLIST_PAGE_LIMIT}`;
  let pages = 0;

  while (nextUrl && pages < MAX_PLAYLIST_PAGES) {
    const page: SpotifyPagingObject<SpotifyPlaylistObject | null> =
      await spotifyGet(accessToken, nextUrl);

    for (const item of page.items) {
      if (!item) continue; // Spotify can include nulls for unavailable playlists
      playlists.push({
        id: item.id,
        name: item.name,
        imageUrl: item.images?.[0]?.url ?? null,
        trackCount: item.tracks?.total ?? 0,
        owner: item.owner?.display_name ?? null,
        collaborative: item.collaborative,
        isPublic: item.public,
        spotifyUrl: item.external_urls?.spotify ?? null,
      });
    }

    nextUrl = page.next;
    pages++;
  }

  return playlists;
}
