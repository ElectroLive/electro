// Screen 3 — Connect source service (Spotify, for this milestone).
// A focused, mobile-first screen whose only job is to kick off the OAuth flow.
// Uses a plain <a> (not next/link) so the click is a full-document navigation:
// that lets the browser follow the route handler's 302 out to Spotify and honor
// the Set-Cookie for the CSRF `state`.

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const ERROR_MESSAGES: Record<string, string> = {
  config:
    "Spotify isn't configured yet. Add your Client ID and Secret to .env.local, then restart the dev server.",
  denied:
    "You cancelled the Spotify connection. No problem — tap below to try again.",
  state:
    "That sign-in attempt expired or didn't match. Please try connecting again.",
  exchange:
    "Something went wrong finishing the Spotify connection. Please try again.",
  spotify: "Spotify returned an error. Please try connecting again.",
};

export default async function ConnectSourcePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const message = error
    ? (ERROR_MESSAGES[error] ?? ERROR_MESSAGES.spotify)
    : null;

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm text-center">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Step 1 of 2
        </p>
        <h1 className="mt-3 text-2xl font-semibold">Connect Spotify</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to Spotify so Electro can see the playlists you want to move.
        </p>

        {message && (
          <div
            role="alert"
            className="mt-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-left text-sm text-destructive"
          >
            {message}
          </div>
        )}

        <a
          href="/api/auth/spotify/login"
          className={cn(
            buttonVariants({ size: "lg" }),
            "mt-8 h-12 w-full text-base",
          )}
        >
          Continue with Spotify
        </a>

        <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
          We never store your music data. Electro only reads your playlists to
          move them — your tokens stay in a secure, session-only cookie and are
          never saved to a database.
        </p>
      </div>
    </main>
  );
}
