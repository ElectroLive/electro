// Clears the Spotify session cookie so the connect flow can be re-run from
// scratch (handy while testing). GET so a plain link works.

import { NextResponse, type NextRequest } from "next/server";
import { clearSpotifySession } from "@/lib/session";

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(
    new URL("/transfer/connect-source", request.url),
  );
  clearSpotifySession(response);
  return response;
}
