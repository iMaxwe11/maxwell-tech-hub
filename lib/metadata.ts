import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

const baseKeywords = [
  "Maxwell Nixon",
  "IT Systems",
  "DevOps",
  "Full-Stack Developer",
  "Cloud Infrastructure",
  "Next.js",
  "React",
  "TypeScript",
  "Portfolio",
];

export function getOgImageUrl(title: string, tag: string) {
  const params = new URLSearchParams({ title, tag });
  return `${siteConfig.url}/api/og?${params.toString()}`;
}

export function createPageMetadata({
  title,
  description,
  path,
  keywords = [],
  tag = "Portfolio",
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  tag?: string;
}): Metadata {
  const canonical = new URL(path, siteConfig.url).toString();
  const image = getOgImageUrl(title, tag);

  return {
    title,
    description,
    keywords: [...baseKeywords, ...keywords],
    alternates: {
      canonical,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: canonical,
      siteName: siteConfig.name,
      title,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${title} preview`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export const rootMetadata: Metadata = {
  title: {
    default: `${siteConfig.name} | IT Systems & DevOps Portfolio`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: baseKeywords,
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  applicationName: `${siteConfig.name} | Tech Hub`,
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: siteConfig.url,
  },
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} | IT Systems & DevOps Portfolio`,
    description: siteConfig.description,
    images: [
      {
        url: getOgImageUrl(siteConfig.name, "Portfolio"),
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} portfolio preview`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | IT Systems & DevOps Portfolio`,
    description: siteConfig.description,
    images: [getOgImageUrl(siteConfig.name, "Portfolio")],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};
