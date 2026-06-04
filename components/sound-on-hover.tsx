"use client";

import { useHoverSynth } from "@/lib/use-hover-synth";

interface SoundOnHoverProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Single frequency for a note, or array for a chord. */
  frequencies: number | number[];
  waveform?: OscillatorType;
  volume?: number;
  duration?: number;
}

/**
 * Generic wrapper that triggers a synth note/chord on hover. Renders a <div>
 * — wrap around any element (e.g. an <h1>) that should sound on hover.
 */
export function SoundOnHover({
  frequencies,
  waveform,
  volume,
  duration,
  children,
  ...rest
}: SoundOnHoverProps) {
  const play = useHoverSynth();

  return (
    <div
      {...rest}
      onMouseEnter={() => play(frequencies, { waveform, volume, duration })}
    >
      {children}
    </div>
  );
}
