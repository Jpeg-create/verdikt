import type { Metadata } from "next";
import type { ReactNode } from "react";
import { IBM_Plex_Mono, Source_Serif_4, Space_Grotesk } from "next/font/google";
import { Web3Provider } from "../components/providers/Web3Provider";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-source-serif",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Verdikt — AI-Verified Outcome Oracle",
  description:
    "Verdikt renders evidence-backed, dispute-windowed verdicts for X Layer Exchange OS outcome markets.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${sourceSerif.variable} ${ibmPlexMono.variable}`}
    >
      <body>
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}
