import { ShieldCheck } from "lucide-react";
import { WaitlistForm } from "@/components/waitlist-form";

const steps = [
  {
    title: "Connect",
    body: "Securely link Spotify and Apple Music. No new account, no password — just a one-tap sign-in.",
  },
  {
    title: "Match",
    body: "We match every track by ISRC and smart fuzzy search — even remasters, live takes and features.",
  },
  {
    title: "Transfer",
    body: "Your playlist lands on the other service in seconds, in the right order, ready to play.",
  },
];

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      {/* Brand glow — electric-blue → teal, soft, behind everything */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 flex justify-center"
      >
        <div
          className="h-[32rem] w-[32rem] rounded-full opacity-25 blur-3xl"
          style={{
            backgroundImage: "linear-gradient(110deg, #2F6BFF, #21E6C1)",
          }}
        />
      </div>

      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
        <span className="inline-flex items-center gap-2.5 text-lg font-semibold tracking-tight">
          {/* App-icon tile (Midnight preset: Ink tile + Snow E) per brand README */}
          <span className="flex h-9 w-9 items-center justify-center rounded-[22%] bg-electro-ink shadow-[0_8px_24px_rgba(0,0,0,0.35)] ring-1 ring-white/10">
            <span
              aria-hidden
              className="electro-mark electro-e text-electro-snow"
              style={{ width: 14, height: 18 }}
            />
          </span>
          <span>Electro</span>
        </span>
        <span className="text-sm text-muted-foreground">Spotify ↔ Apple Music</span>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center px-6 pb-20 pt-10 text-center sm:pt-16">
        <span className="mb-5 inline-flex items-center rounded-full border border-white/10 bg-white/[0.02] px-3 py-1 text-xs font-medium text-muted-foreground">
          Early access — launching soon
        </span>

        <h1 className="text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
          Move your playlists between Spotify and Apple Music in{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: "linear-gradient(110deg, #2F6BFF, #21E6C1)",
            }}
          >
            30 seconds
          </span>
          .
        </h1>

        <p className="mt-5 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
          Switching services shouldn&apos;t mean losing your music. Electro matches every
          track — accurately — and moves whole playlists in one tap. No signup, and your
          first transfer is free.
        </p>

        <div className="mt-8 w-full max-w-md">
          <WaitlistForm />
          <p className="mt-3 text-xs text-muted-foreground">
            No spam — just one email when we launch.
          </p>
        </div>

        <section className="mt-20 w-full" aria-labelledby="how-it-works">
          <h2 id="how-it-works" className="sr-only">
            How it works
          </h2>
          <ol className="grid gap-4 text-left sm:grid-cols-3">
            {steps.map((step, i) => (
              <li
                key={step.title}
                className="rounded-xl border border-white/[0.08] bg-card p-5"
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-electro-blue/15 text-sm font-semibold text-electro-blue">
                  {i + 1}
                </span>
                <h3 className="mt-3 font-medium">{step.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <p className="mt-10 inline-flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="size-4" aria-hidden />
          We never store your music data.
        </p>
      </main>

      <footer className="mx-auto w-full max-w-5xl px-6 py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Electro · Spotify and Apple Music are trademarks of
        their respective owners.
      </footer>
    </div>
  );
}
