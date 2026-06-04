import { ShieldCheck, ArrowUpRight } from "lucide-react";
import { SoundTile } from "@/components/sound-tile";
import { SoundToggle } from "@/components/sound-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { WaitlistForm } from "@/components/waitlist-form";

// Per-tile palette — three brand jewel tones for a glassmorphism treatment.
// Sapphire (Electric Blue), Emerald (Teal), Amethyst (Violet). All cool family,
// no magenta (Violet is distinctly purple). Glass tile tints to ~60% of these
// on hover so the color reads as "tinted glass" rather than a solid color block.
// `note` is the Hz to synthesize on hover — ascending C major triad so hovering
// CONNECT → MATCH → TRANSFER plays C–E–G.
const steps = [
  {
    n: "01",
    title: "Connect",
    body: "Securely link Spotify and Apple Music. No new account, no password — just a one-tap sign-in.",
    bg: "#2F6BFF", // Electric Blue / sapphire (brand)
    fg: "#FFFFFF",
    note: 523.25, // C5
  },
  {
    n: "02",
    title: "Match",
    body: "We match every track by ISRC and smart fuzzy search — even remasters, live takes and features.",
    bg: "#21E6C1", // Teal / emerald-cyan (brand)
    fg: "#0B0B0C",
    note: 659.25, // E5
  },
  {
    n: "03",
    title: "Transfer",
    body: "Your playlist lands on the other service in seconds, in the right order, ready to play.",
    bg: "#8B5CF6", // Violet / amethyst (brand) — purple, not pink-magenta
    fg: "#FFFFFF",
    note: 783.99, // G5
  },
];

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      {/* Plasma background — three blue-only blobs ranging from deep midnight to
          bright sky-blue. Lower opacities on light mode (faint wash), higher on
          dark (more vibrant, with the deep blob doing the heavy lifting). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        {/* Deep midnight blue — top-left */}
        <div
          className="absolute -top-1/4 left-[8%] h-[40rem] w-[40rem] rounded-full opacity-[0.20] blur-[140px] dark:opacity-[0.42]"
          style={{ backgroundColor: "#172554" }}
        />
        {/* Electric Blue (brand) — top-right */}
        <div className="absolute -top-[10%] right-[5%] h-[32rem] w-[32rem] rounded-full bg-electro-blue opacity-[0.16] blur-[140px] dark:opacity-[0.28]" />
        {/* Bright sky-blue — center-low */}
        <div
          className="absolute top-1/3 left-1/3 h-[36rem] w-[36rem] rounded-full opacity-[0.16] blur-[140px] dark:opacity-[0.30]"
          style={{ backgroundColor: "#38BDF8" }}
        />
      </div>

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <span
          role="img"
          aria-label="Electro"
          className="electro-mark electro-wordmark inline-block h-5 text-electro-ink dark:text-electro-snow"
        />
        <div className="flex items-center gap-3 sm:gap-5">
          <span className="hidden text-[11px] uppercase tracking-[0.22em] text-muted-foreground sm:inline">
            Spotify ↔ Apple Music
          </span>
          <SoundToggle />
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 pb-16">
        {/* Editorial hero — centered: tag, headline, subcopy, form all stacked. */}
        <section className="pt-8 text-center sm:pt-14">
          <span className="inline-flex items-center text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            <span className="mr-3 inline-block size-1.5 rounded-full bg-electro-blue" />
            Early access — launching soon
          </span>

          <h1 className="mx-auto mt-6 max-w-4xl text-balance text-3xl font-light leading-[1.15] tracking-tight sm:text-4xl md:text-5xl lg:text-5xl">
            Move your playlists between Spotify and Apple Music in{" "}
            <span className="electro-laser-text text-4xl font-bold sm:text-5xl md:text-6xl lg:text-6xl">
              30 seconds
            </span>
            .
          </h1>

          <p className="mx-auto mt-8 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
            Switching services shouldn&apos;t mean losing your music. Electro matches every
            track — accurately — and moves whole playlists in one tap. No signup, and your
            first transfer is free.
          </p>

          <div className="mx-auto mt-8 w-full max-w-md">
            <WaitlistForm />
            <p className="mt-3 text-xs text-muted-foreground">
              No spam — just one email when we launch.
            </p>
          </div>
        </section>

        {/* Editorial tile grid — 3 steps. Default pale-dark, color-pops on hover. */}
        <section className="mt-10 sm:mt-14" aria-labelledby="how-it-works">
          <h2
            id="how-it-works"
            className="mb-6 text-[11px] uppercase tracking-[0.22em] text-muted-foreground"
          >
            How it works
          </h2>
          <ol className="grid gap-3 md:grid-cols-3">
            {steps.map((step) => (
              <SoundTile
                key={step.title}
                frequency={step.note}
                className="group relative isolate overflow-hidden rounded-2xl border border-black/[0.08] bg-black/[0.03] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-black/[0.18] hover:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.25)] dark:border-white/[0.12] dark:bg-white/[0.05] dark:hover:border-white/[0.2] dark:hover:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.5)]"
                style={
                  {
                    "--hover-bg": step.bg,
                    "--hover-fg": step.fg,
                  } as React.CSSProperties
                }
              >
                {/* Tinted-glass color overlay (60% opacity keeps the glass feel) */}
                <span
                  aria-hidden
                  className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-60"
                  style={{ backgroundColor: step.bg }}
                />

                {/* Specular highlight at top edge — glass shine */}
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
                />

                {/* Card content (z-10 to sit above the tint overlay) */}
                <div className="relative z-10 flex h-full flex-col p-6 transition-colors duration-500 group-hover:[color:var(--hover-fg)]">
                  <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground transition-colors duration-500 group-hover:text-[color:var(--hover-fg)] group-hover:opacity-80">
                    {step.n}
                  </span>

                  <h3 className="mt-4 font-display text-3xl font-black uppercase leading-none tracking-tight transition-transform duration-500 group-hover:-translate-y-0.5 sm:text-4xl">
                    {step.title}
                  </h3>

                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground transition-colors duration-500 group-hover:text-[color:var(--hover-fg)] group-hover:opacity-90">
                    {step.body}
                  </p>

                  {/* "Explore" CTA — hidden by default, reveals on hover */}
                  <span className="mt-auto pt-6 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    Explore
                    <ArrowUpRight className="size-3.5" aria-hidden />
                  </span>
                </div>
              </SoundTile>
            ))}
          </ol>
        </section>

        <p className="mt-16 inline-flex items-center gap-2 self-center text-xs uppercase tracking-[0.18em] text-muted-foreground">
          <ShieldCheck className="size-3.5" aria-hidden />
          We never store your music data
        </p>
      </main>

      <footer className="mx-auto w-full max-w-6xl px-6 py-8 text-center text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60">
        © {new Date().getFullYear()} Electro · Spotify and Apple Music are trademarks of
        their respective owners
      </footer>
    </div>
  );
}
