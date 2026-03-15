import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "Maxwell Nixon | Full-Stack Engineer & Designer",
  description: "Full-stack architect building premium software experiences. Real-time data visualization, interactive tools, and dark-luxury interfaces.",
  keywords: ["Maxwell Nixon", "Full Stack Developer", "Software Engineer", "Web Developer", "React", "Next.js", "TypeScript"],
  authors: [{ name: "Maxwell Nixon" }],
  creator: "Maxwell Nixon",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://maxwellnixon.com",
    title: "Maxwell Nixon | Full-Stack Engineer & Designer",
    description: "Full-stack architect crafting premium software experiences",
    siteName: "Maxwell Tech Hub",
  },
  twitter: {
    card: "summary_large_image",
    title: "Maxwell Nixon | Full-Stack Engineer",
    description: "Full-stack architect crafting premium software experiences",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
