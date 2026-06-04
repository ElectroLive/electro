import type { Metadata } from "next";
import { Inter, Archivo } from "next/font/google";
import "./globals.css";

// UI/body — Inter as a free stand-in for Neue Haas Grotesk (Karim's secondary)
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Display/headlines — Archivo Black as a free stand-in for Titling Gothic Pro
// (Karim's primary "blocky, strong, bold" display face). Weight 900 = Archivo Black.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
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
      className={`${inter.variable} ${archivo.variable} h-full antialiased`}
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
