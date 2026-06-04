import { WaitlistForm } from "@/components/waitlist-form";

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      {/* subtle brand glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 flex justify-center"
      >
        <div className="h-[32rem] w-[32rem] rounded-full bg-gradient-to-tr from-electro-blue/15 to-electro-teal/15 blur-3xl" />
      </div>

      <header className="mx-auto w-full max-w-5xl px-6 py-6">
        <span
          role="img"
          aria-label="Electro"
          className="electro-mark electro-wordmark inline-block h-6 text-electro-snow"
        />
      </header>

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-6 pb-24 text-center">
        <h1 className="text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
          Move playlists between Spotify and Apple Music in{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(110deg, #2F6BFF, #21E6C1)" }}
          >
            30 seconds
          </span>
          .
        </h1>

        <div className="mt-10 w-full max-w-md">
          <WaitlistForm />
          <p className="mt-3 text-xs text-muted-foreground">
            No spam — one email when we launch.
          </p>
        </div>
      </main>

      <footer className="mx-auto w-full max-w-5xl px-6 py-6 text-center text-xs text-muted-foreground/70">
        © {new Date().getFullYear()} Electro · Spotify and Apple Music are trademarks of
        their respective owners.
      </footer>
    </div>
  );
}
