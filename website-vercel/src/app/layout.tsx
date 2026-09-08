import type { Metadata } from "next";
import { Lora, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Token Tracker — Exact Local AI Token & Cost Telemetry",
  description:
    "Local-first token and cost tracking for agentic coding workflows. Monitor Claude Code, Antigravity, Cursor, and Cline with exact project-level attribution. 100% offline.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${lora.variable} ${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#f0eee6] text-[#141413] antialiased">
        {/*
        THESIS: Token Tracker is an offline telemetry workstation for agentic AI workflows, refusing generic SaaS dark-mode templates in favor of a tactile editorial parchment aesthetic that treats token consumption like ledger accounting.
        OWN-WORLD: Ivory Medium (#f0eee6) canvas, Ivory Light (#faf9f5) and Manilla (#f5e3c7) flat elevation, Stone (#cccbc8) hairlines, Slate Dark (#141413) typography, Lora serif alongside Geist Sans, bottom-only 8px button radiuses, 24px card corners, and a single restrained Emerald (#10b981) primary CTA.
        STORY: The developer immediately sees their AI spending attributed to exact local directories and sessions, understands the 100% offline privacy model, and downloads the portable binary with zero cloud lock-in.
        FIRST VIEWPORT: Two-column hero with 61px bold Geist Sans thesis on the left, 20px Lora editorial explanation on the right, paired with 68px Lora display title, resting on an Ivory Medium canvas with flat Manilla/Ivory cards and a single bottom-radius Emerald download CTA.
        FORM: Editorial parchment ledger / Anthropic-inspired literary publication aesthetic with precision engineering typography.
        FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
        */}
        <Navbar />
        <main className="flex-1 w-full flex flex-col items-center">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
