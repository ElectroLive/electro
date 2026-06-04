// Step 2 of the Spotify OAuth flow: Spotify redirects back here with a `code`
// (or an `error`). We verify `state` matches the cookie we set (CSRF check),
// exchange the code for tokens server-side, store them in the session cookie,
// and send the user on to their playlists.

import { NextResponse, type NextRequest } from "next/server";
import { exchangeCodeForTokens } from "@/lib/spotify";
import {
  readOAuthState,
  clearOAuthState,
  writeSpotifySession,
} from "@/lib/session";

function redirectToConnect(
  request: NextRequest,
  error: string,
): NextResponse {
  const url = new URL("/transfer/connect-source", request.url);
  url.searchParams.set("error", error);
  const response = NextResponse.redirect(url);
  clearOAuthState(response);
  return response;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const code = params.get("code");
  const state = params.get("state");
  const oauthError = params.get("error"); // e.g. "access_denied" if user cancels

  if (oauthError) {
    return redirectToConnect(
      request,
      oauthError === "access_denied" ? "denied" : "spotify",
    );
  }

  const expectedState = readOAuthState(request);
  if (!state || !expectedState || state !== expectedState) {
    return redirectToConnect(request, "state");
  }

  if (!code) {
    return redirectToConnect(request, "spotify");
  }

  try {
    const session = await exchangeCodeForTokens(code);
    const response = NextResponse.redirect(
      new URL("/transfer/playlists", request.url),
    );
    writeSpotifySession(response, session);
    clearOAuthState(response);
    return response;
  } catch (err) {
    console.error("[spotify/callback] token exchange failed", err);
    return redirectToConnect(request, "exchange");
  }
}
