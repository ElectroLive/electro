// Step 1 of the Spotify OAuth flow: generate a CSRF `state`, stash it in a
// short-lived cookie, then redirect the user to Spotify's consent screen.

import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import {
  buildAuthorizeUrl,
  getSpotifyConfig,
  SpotifyConfigError,
} from "@/lib/spotify";
import { writeOAuthState } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    getSpotifyConfig(); // throws SpotifyConfigError if creds are missing
  } catch (err) {
    if (err instanceof SpotifyConfigError) {
      const url = new URL("/transfer/connect-source", request.url);
      url.searchParams.set("error", "config");
      return NextResponse.redirect(url);
    }
    throw err;
  }

  const state = randomUUID();
  const response = NextResponse.redirect(buildAuthorizeUrl(state));
  writeOAuthState(response, state);
  return response;
}
