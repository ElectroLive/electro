import type { Metadata } from "next";
import "./globals.css";

// No webfont import — using the OS system font stack (apple.com's approach).
// On Apple devices `-apple-system` resolves to San Francisco (Apple's own UI
// font). On Windows it falls back to Segoe UI; on Android to Roboto; on
// Linux to the system default. Stack is configured in globals.css under
// the `--font-sans` token.

export const metadata: Metadata = {
  title: "Electro — Move playlists between Spotify & Apple Music",
  description:
    "Move your playlists between Spotify and Apple Music in 30 seconds. Accurate, ISRC-based track matching. No signup. Join the early-access list.",
};

// Inline before-paint script: defaults to dark mode (per user request).
// Only stays in light if the user explicitly toggled to light (persisted in
// localStorage). Runs synchronously in <head> to avoid a flash of wrong theme.
const THEME_INIT_SCRIPT = `(function(){try{if(localStorage.getItem('theme')!=='light'){document.documentElement.classList.add('dark')}}catch(e){document.documentElement.classList.add('dark')}})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
