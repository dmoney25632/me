import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { me } from "@/content";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: `${me.name} — ${me.title}`,
    template: `%s · ${me.name}`,
  },
  description: me.tagline,
  keywords: [
    "Dayton Runyan",
    "founder",
    "SaaS",
    "Future 42",
    "VAL",
    "BYU",
    "portfolio",
    "projects",
  ],
  authors: [{ name: me.name }],
  creator: me.name,
  openGraph: {
    type: "website",
    locale: "en_US",
    title: `${me.name} — ${me.title}`,
    description: me.tagline,
    siteName: me.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `${me.name} — ${me.title}`,
    description: me.tagline,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#121a3a",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="h-full">{children}</body>
    </html>
  );
}
