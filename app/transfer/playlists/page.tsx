"use client";

// Screen 4 — the user's Spotify playlists. Fetches the trimmed payload from
// /api/playlists (a Route Handler so it can refresh + persist tokens), then
// renders a mobile-first list with cover art, name, and track count. Selecting
// a playlist to transfer is wired up in a later milestone.

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface PlaylistSummary {
  id: string;
  name: string;
  imageUrl: string | null;
  trackCount: number;
  owner: string | null;
  collaborative: boolean;
  isPublic: boolean | null;
  spotifyUrl: string | null;
}

interface PlaylistsResponse {
  user: { id: string; displayName: string | null };
  playlists: PlaylistSummary[];
}

type State =
  | { status: "loading" }
  | { status: "not_connected" }
  | { status: "error"; message: string }
  | { status: "ready"; data: PlaylistsResponse };

export default function PlaylistsPage() {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/playlists");
        if (res.status === 401) {
          if (!cancelled) setState({ status: "not_connected" });
          return;
        }
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          if (!cancelled) {
            setState({
              status: "error",
              message:
                typeof body?.error === "string"
                  ? body.error
                  : "Could not load your playlists.",
            });
          }
          return;
        }
        const data = (await res.json()) as PlaylistsResponse;
        if (!cancelled) setState({ status: "ready", data });
      } catch {
        if (!cancelled) {
          setState({
            status: "error",
            message: "Could not reach the server. Please try again.",
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="mx-auto w-full max-w-md px-5 py-8">
      <header className="mb-6">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Step 2 of 2
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Your Spotify playlists</h1>
        {state.status === "ready" && (
          <p className="mt-1 text-sm text-muted-foreground">
            Connected as{" "}
            <span className="text-foreground">
              {state.data.user.displayName ?? state.data.user.id}
            </span>
            {" · "}
            <a
              href="/api/auth/spotify/logout"
              className="underline underline-offset-2 hover:text-foreground"
            >
              Disconnect
            </a>
          </p>
        )}
      </header>

      {state.status === "loading" && <PlaylistSkeleton />}

      {state.status === "not_connected" && (
        <EmptyState
          title="You're not connected yet"
          body="Connect your Spotify account to see your playlists here."
          actionHref="/transfer/connect-source"
          actionLabel="Connect Spotify"
        />
      )}

      {state.status === "error" && (
        <EmptyState
          title="Something went wrong"
          body={state.message}
          actionHref="/transfer/playlists"
          actionLabel="Try again"
        />
      )}

      {state.status === "ready" &&
        (state.data.playlists.length === 0 ? (
          <EmptyState
            title="No playlists found"
            body="We didn't find any playlists on your Spotify account."
            actionHref="/transfer/connect-source"
            actionLabel="Reconnect"
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {state.data.playlists.map((playlist) => (
              <li key={playlist.id}>
                <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                  <PlaylistCover url={playlist.imageUrl} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{playlist.name}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {playlist.trackCount}{" "}
                      {playlist.trackCount === 1 ? "track" : "tracks"}
                      {playlist.owner ? ` · ${playlist.owner}` : ""}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ))}
    </main>
  );
}

function PlaylistCover({ url }: { url: string | null }) {
  if (!url) {
    return (
      <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- remote Spotify CDN art; plain <img> avoids next/image remote-domain config
    <img
      src={url}
      alt=""
      width={48}
      height={48}
      className="size-12 shrink-0 rounded-md object-cover"
    />
  );
}

function PlaylistSkeleton() {
  return (
    <ul className="flex flex-col gap-2" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <li
          key={i}
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
        >
          <div className="size-12 shrink-0 animate-pulse rounded-md bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function EmptyState({
  title,
  body,
  actionHref,
  actionLabel,
}: {
  title: string;
  body: string;
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card px-5 py-10 text-center">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
        {body}
      </p>
      <a
        href={actionHref}
        className={cn(buttonVariants({ size: "lg" }), "mt-6 h-11 px-5")}
      >
        {actionLabel}
      </a>
    </div>
  );
}
