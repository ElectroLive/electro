"use client";

import { useCallback, useRef } from "react";

interface SoundTileProps {
  /** Frequency in Hz of the note to play on hover (e.g. 523.25 for C5). */
  frequency: number;
  /** Wave shape. "sine" is clean and synthy; "triangle" is slightly warmer. */
  waveform?: OscillatorType;
  /** Peak gain (0–1). Keep low so the note is felt, not announced. */
  volume?: number;
  /** Total note length in seconds, including release. */
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

/**
 * Tile wrapper that plays a brief synthesized note on mouseenter.
 *
 * Uses Web Audio API directly — no audio files, no library.
 * AudioContext is lazily created on the first hover so we don't allocate
 * one on page load (browsers won't let it play before a user gesture
 * anyway — the hover itself counts as the gesture for our purposes).
 */
export function SoundTile({
  frequency,
  waveform = "sine",
  volume = 0.12,
  duration = 0.4,
  className,
  style,
  children,
}: SoundTileProps) {
  const ctxRef = useRef<AudioContext | null>(null);

  const play = useCallback(() => {
    try {
      // Respect "prefers-reduced-motion" as a proxy for "minimize sensory effects"
      // (there's no standard audio-reduction media query yet).
      if (
        typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        return;
      }

      if (!ctxRef.current) {
        const Ctor =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;
        if (!Ctor) return;
        ctxRef.current = new Ctor();
      }
      const ctx = ctxRef.current;
      if (ctx.state === "suspended") {
        void ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = waveform;
      osc.frequency.value = frequency;

      // Envelope: short attack → exponential decay (avoids clicks at start/end).
      const now = ctx.currentTime;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(volume, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + duration + 0.02);
    } catch {
      // AudioContext can fail on locked-down browsers / privacy modes.
      // Silently skip — the visual hover state still works.
    }
  }, [frequency, waveform, volume, duration]);

  return (
    <li className={className} style={style} onMouseEnter={play}>
      {children}
    </li>
  );
}
