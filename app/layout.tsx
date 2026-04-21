import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { GlobalCommandPalette } from "@/components/GlobalCommandPalette";
import { GrokStarfield } from "@/components/GrokStarfield";
import { PageTransition } from "@/components/PageTransition";
import { KonamiCode } from "@/components/KonamiCode";
import { ConsoleGreeting } from "@/components/ConsoleGreeting";
import { CursorSparkle } from "@/components/CursorSparkle";
import { AchievementSystem } from "@/components/AchievementSystem";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { ScrollProgress } from "@/components/ScrollProgress";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";
import { Toast } from "@/components/Toast";
import { rootMetadata } from "@/lib/metadata";
import { siteConfig } from "@/lib/site-config";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-code" });

export const viewport: Viewport = {
  themeColor: "#020204",
  width: "device-width",
  initialScale: 1,
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
        <GlobalCommandPalette />
        <KonamiCode />
        <AchievementSystem />
        <AnalyticsTracker />
        <ConsoleGreeting />
        <CursorSparkle />
        <ScrollProgress />
        <KeyboardShortcuts />
        <Toast />
        <div id="main-content" tabIndex={-1}>
          <PageTransition>{children}</PageTransition>
        </div>
      </body>
    </html>
  );
}
