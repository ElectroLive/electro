"use client";

import { useCallback, useRef } from "react";

interface PlayOptions {
  waveform?: OscillatorType;
  /** Per-note peak gain (0–1). Chords scale this down internally so they don't clip. */
  volume?: number;
  /** Total note length in seconds, including release. */
  duration?: number;
}

/**
 * Returns a `play(frequencies, opts?)` function that synthesizes a brief note
 * (or a chord, if an array of frequencies is passed) via the Web Audio API.
 *
 * Centralizes all the cross-cutting concerns:
 *   • Lazy AudioContext (allocated on first call, not on mount)
 *   • Respects `prefers-reduced-motion` (proxy for "minimize sensory effects")
 *   • Respects user mute pref stored in localStorage under "sound-muted"
 *   • Per-note envelope to avoid clicks at attack/release
 *   • Chord-aware volume scaling so summed notes don't distort
 */
export function useHoverSynth() {
  const ctxRef = useRef<AudioContext | null>(null);

  return useCallback(
    (frequencies: number | number[], opts: PlayOptions = {}) => {
      try {
        if (typeof window === "undefined") return;

        // User-controlled mute
        if (window.localStorage?.getItem("sound-muted") === "1") return;

        // Accessibility: skip if user has reduced-motion on
        if (
          window.matchMedia &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ) {
          return;
        }

        if (!ctxRef.current) {
          const Ctor =
            window.AudioContext ||
            (
              window as unknown as {
                webkitAudioContext?: typeof AudioContext;
              }
            ).webkitAudioContext;
          if (!Ctor) return;
          ctxRef.current = new Ctor();
        }
        const ctx = ctxRef.current;
        if (ctx.state === "suspended") void ctx.resume();

        const freqs = Array.isArray(frequencies) ? frequencies : [frequencies];
        const waveform: OscillatorType = opts.waveform ?? "triangle";
        const volume = opts.volume ?? 0.12;
        const duration = opts.duration ?? 0.4;

        // Chord-aware per-note gain: total amplitude across N notes shouldn't clip.
        const perNoteGain = freqs.length > 1 ? volume * (0.75 / freqs.length ** 0.5) : volume;

        const now = ctx.currentTime;
        freqs.forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = waveform;
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(perNoteGain, now + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
          osc.connect(gain).connect(ctx.destination);
          osc.start(now);
          osc.stop(now + duration + 0.02);
        });
      } catch {
        // AudioContext can fail on locked-down browsers / privacy modes.
        // Silently skip — visual interactions still work.
      }
    },
    [],
  );
}
