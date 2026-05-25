import { Zap, ShieldCheck } from "lucide-react";
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
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 flex justify-center"
      >
        <div className="h-[28rem] w-[28rem] rounded-full bg-gradient-to-tr from-violet-500/30 to-fuchsia-500/30 blur-3xl" />
      </div>

      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
        <span className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight">
          <Zap className="size-5 text-violet-600" aria-hidden />
          Electro
        </span>
        <span className="text-sm text-muted-foreground">Spotify ↔ Apple Music</span>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center px-6 pb-20 pt-10 text-center sm:pt-16">
        <span className="mb-5 inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
          Early access — launching soon
        </span>

        <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Move your playlists between Spotify and Apple Music in{" "}
          <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
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
              <li key={step.title} className="rounded-xl border bg-card/50 p-5">
                <span className="flex size-8 items-center justify-center rounded-full bg-violet-600/10 text-sm font-semibold text-violet-700 dark:text-violet-300">
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
