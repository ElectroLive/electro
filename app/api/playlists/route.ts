// Returns the connected user's Spotify playlists as a trimmed JSON payload.
// If the access token is expired it's refreshed first and the new token is
// persisted back to the session cookie on the response.

import { NextResponse, type NextRequest } from "next/server";
import {
  fetchCurrentUser,
  fetchUserPlaylists,
  refreshAccessToken,
  SpotifyApiError,
  type SpotifySession,
} from "@/lib/spotify";
import {
  readSpotifySession,
  writeSpotifySession,
  clearSpotifySession,
} from "@/lib/session";

export async function GET(request: NextRequest) {
  const session = readSpotifySession(request);
  if (!session) {
    return NextResponse.json({ error: "not_connected" }, { status: 401 });
  }

  let active: SpotifySession = session;
  let refreshed = false;

  if (Date.now() >= session.expiresAt) {
    try {
      active = await refreshAccessToken(session.refreshToken);
      refreshed = true;
    } catch (err) {
      console.error("[playlists] token refresh failed", err);
      // Refresh token is dead — clear the session so the user reconnects.
      const response = NextResponse.json(
        { error: "not_connected" },
        { status: 401 },
      );
      clearSpotifySession(response);
      return response;
    }
  }

  try {
    const [user, playlists] = await Promise.all([
      fetchCurrentUser(active.accessToken),
      fetchUserPlaylists(active.accessToken),
    ]);

    const response = NextResponse.json({ user, playlists });
    if (refreshed) writeSpotifySession(response, active);
    return response;
  } catch (err) {
    if (err instanceof SpotifyApiError && err.status === 401) {
      // Access token rejected unexpectedly — clear so the user can reconnect.
      const response = NextResponse.json(
        { error: "not_connected" },
        { status: 401 },
      );
      clearSpotifySession(response);
      return response;
    }
    console.error("[playlists] failed to load playlists", err);
    return NextResponse.json(
      { error: "Could not load your playlists. Please try again." },
      { status: 502 },
    );
  }
}
