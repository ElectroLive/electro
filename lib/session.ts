// Cookie-based session for Spotify OAuth. No database in v1 — tokens live only
// in httpOnly, Secure, SameSite=Lax cookies (per the security principles in
// CLAUDE.md). httpOnly keeps tokens out of reach of client-side JS; SameSite=Lax
// still lets the cookie ride along on the top-level OAuth redirect back from
// Spotify (Strict would drop it on that cross-site navigation and break login).

import type { NextRequest, NextResponse } from "next/server";
import type { SpotifySession } from "@/lib/spotify";

const SESSION_COOKIE = "electro_spotify";
const STATE_COOKIE = "electro_spotify_oauth_state";

const isProd = process.env.NODE_ENV === "production";

const baseCookieOptions = {
  httpOnly: true,
  secure: isProd, // localhost is http in dev, so only require https in prod
  sameSite: "lax" as const,
  path: "/",
};

// The session cookie lasts as long as a refresh token stays useful; the access
// token inside expires hourly and is refreshed on demand.
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const STATE_MAX_AGE = 60 * 10; // 10 minutes — enough to finish the consent screen

export function readSpotifySession(
  request: NextRequest,
): SpotifySession | null {
  const raw = request.cookies.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<SpotifySession>;
    if (
      typeof parsed.accessToken === "string" &&
      typeof parsed.refreshToken === "string" &&
      typeof parsed.expiresAt === "number"
    ) {
      return parsed as SpotifySession;
    }
  } catch {
    // Malformed cookie → treat as "not connected".
  }
  return null;
}

export function writeSpotifySession(
  response: NextResponse,
  session: SpotifySession,
): void {
  response.cookies.set(SESSION_COOKIE, JSON.stringify(session), {
    ...baseCookieOptions,
    maxAge: SESSION_MAX_AGE,
  });
}

export function clearSpotifySession(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE, "", { ...baseCookieOptions, maxAge: 0 });
}

export function writeOAuthState(response: NextResponse, state: string): void {
  response.cookies.set(STATE_COOKIE, state, {
    ...baseCookieOptions,
    maxAge: STATE_MAX_AGE,
  });
}

export function readOAuthState(request: NextRequest): string | null {
  return request.cookies.get(STATE_COOKIE)?.value ?? null;
}

export function clearOAuthState(response: NextResponse): void {
  response.cookies.set(STATE_COOKIE, "", { ...baseCookieOptions, maxAge: 0 });
}
