import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GrokStarfield } from "@/components/GrokStarfield";
import { PageTransition } from "@/components/PageTransition";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { ScrollProgress } from "@/components/ScrollProgress";
import { Toast } from "@/components/Toast";
import { DeferredEnhancements } from "@/components/DeferredEnhancements";
import { rootMetadata } from "@/lib/metadata";
import { siteConfig } from "@/lib/site-config";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-code" });

export const viewport: Viewport = {
  themeColor: "#020204",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = rootMetadata;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        name: siteConfig.name,
        url: siteConfig.url,
        email: siteConfig.email,
        sameAs: [
          `https://github.com/${siteConfig.githubUsername}`,
          "https://linkedin.com/in/maxwell-nixon-90351627a",
        ],
        jobTitle: "IT Systems Technician & Full-Stack Developer",
        knowsAbout: [
          "Windows Server",
          "Active Directory",
          "AWS",
          "Azure",
          "Docker",
          "Kubernetes",
          "Next.js",
          "React",
          "TypeScript",
          "Python",
          "FastAPI",
          "DevOps",
          "Cloud Infrastructure",
        ],
        homeLocation: {
          "@type": "Place",
          name: siteConfig.location,
        },
      },
      {
        "@type": "WebSite",
        name: siteConfig.domain,
        url: siteConfig.url,
        description: siteConfig.description,
        inLanguage: "en-US",
        author: {
          "@type": "Person",
          name: siteConfig.name,
          url: siteConfig.url,
        },
      },
    ],
  };

  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <body className={inter.className}>
        <a href="#main-content" className="skip-link">
          Skip to Content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {/* Sitewide starfield backdrop. Mounted once here so it persists across
            client-side route transitions without unmounting/remounting. */}
        <GrokStarfield />
        <DeferredEnhancements />
        <AnalyticsTracker />
        <ScrollProgress />
        <Toast />
        <div id="main-content" tabIndex={-1}>
          <PageTransition>{children}</PageTransition>
        </div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
