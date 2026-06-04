import type { Metadata } from "next";
import { Space_Grotesk, Wallpoet } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const wallpoet = Wallpoet({
  variable: "--font-wallpoet",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Electro — Move playlists between Spotify & Apple Music",
  description:
    "Move your playlists between Spotify and Apple Music in 30 seconds. Accurate, ISRC-based track matching. No signup. Join the early-access list.",
};

// Inline before-paint script: reads stored theme or system pref, applies `.dark` class
// to <html> BEFORE first paint so there's no flash of wrong theme on initial load.
const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('theme');var s=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(!t&&s)){document.documentElement.classList.add('dark')}}catch(e){}})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${wallpoet.variable} h-full antialiased`}
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
