import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-code" });

export const viewport: Viewport = {
  themeColor: "#020204",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "Maxwell Nixon | IT Systems & DevOps Portfolio",
    template: "%s | Maxwell Nixon",
  },
  description:
    "Cloud-savvy IT technician and full-stack developer building automation tools, managing infrastructure, and engineering premium software experiences.",
  keywords: [
    "Maxwell Nixon",
    "IT Systems",
    "DevOps",
    "Full-Stack Developer",
    "Next.js",
    "React",
    "TypeScript",
    "Cloud Infrastructure",
    "Portfolio",
  ],
  authors: [{ name: "Maxwell Nixon" }],
  creator: "Maxwell Nixon",
  metadataBase: new URL("https://maxwellnixon.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://maxwellnixon.com",
    siteName: "Maxwell Nixon",
    title: "Maxwell Nixon | IT Systems & DevOps Portfolio",
    description:
      "Cloud-savvy IT technician and full-stack developer building automation tools, managing infrastructure, and engineering premium software experiences.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Maxwell Nixon | IT Systems & DevOps Portfolio",
    description:
      "Cloud-savvy IT technician and full-stack developer building automation tools, managing infrastructure, and engineering premium software experiences.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}