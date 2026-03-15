import type { Metadata } from "next";
import { Outfit, Syne, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Maxwell Nixon — Engineer · Designer · Builder",
  description:
    "Full-stack architect building at the intersection of code, design, and intelligence systems. Explore tools, experiments, and projects.",
  metadataBase: new URL("https://www.maxwellnixon.com"),
  openGraph: {
    title: "Maxwell Nixon — Engineer · Designer · Builder",
    description:
      "Full-stack architect building at the intersection of code, design, and intelligence systems.",
    url: "https://www.maxwellnixon.com",
    siteName: "Maxwell Nixon",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Maxwell Nixon — Engineer · Designer · Builder",
  },
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
    <html
      lang="en"
      className={`${outfit.variable} ${syne.variable} ${jetbrains.variable}`}
    >
      <body className="bg-[#050505] text-[#e8e8e8] font-[family-name:var(--font-body)]">
        <div className="grain-overlay" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
