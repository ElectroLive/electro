"use client";

import { useHoverSynth } from "@/lib/use-hover-synth";

interface SoundTileProps {
  /** Frequency in Hz to play on hover (e.g. 523.25 for C5). */
  frequency: number;
  waveform?: OscillatorType;
  volume?: number;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

/**
 * Tile (<li>) wrapper that plays a brief synthesized note on mouseenter.
 * Mute + reduced-motion handling lives in useHoverSynth.
 */
export function SoundTile({
  frequency,
  waveform,
  volume,
  duration,
  className,
  style,
  children,
}: SoundTileProps) {
  const play = useHoverSynth();

  return (
    <li
      className={className}
      style={style}
      onMouseEnter={() => play(frequency, { waveform, volume, duration })}
    >
      {children}
    </li>
  );
}
