"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "sound-muted";

export function SoundToggle() {
  // Pre-mount placeholder to avoid hydration mismatch (the page might be
  // rendered server-side, where localStorage doesn't exist).
  const [mounted, setMounted] = useState(false);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      setMuted(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      // localStorage unavailable — start unmuted
    }
  }, []);

  function toggle() {
    const next = !muted;
    setMuted(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    } catch {
      // Failed to persist — toggle still works for this session.
    }
  }

  return (
    <button
      type="button"
      onClick={mounted ? toggle : undefined}
      aria-label={
        mounted
          ? muted
            ? "Unmute hover sounds"
            : "Mute hover sounds"
          : "Toggle hover sounds"
      }
      aria-pressed={mounted ? muted : undefined}
      className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {mounted &&
        (muted ? (
          <VolumeX className="size-4" aria-hidden />
        ) : (
          <Volume2 className="size-4" aria-hidden />
        ))}
    </button>
  );
}
