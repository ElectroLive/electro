import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

// Only font in use — Space Grotesk per the ELECTRO brand kit. Geometric/technical
// character that complements the stencil ELECTRO wordmark. Used for body, UI,
// hero, and tile titles alike — single cohesive type system.
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

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
      className={`${spaceGrotesk.variable} h-full antialiased`}
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
