import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Projects — Maxwell Nixon",
  description:
    "Every experience, repo, and deployed system — live dashboards, open-source labs, and professional infrastructure work by Maxwell Nixon.",
  openGraph: {
    title: "Projects — Maxwell Nixon",
    description:
      "Live experiences, open-source labs, and professional infrastructure work.",
    url: `${siteConfig.url}/projects`,
    siteName: siteConfig.name,
    type: "website",
  },
  alternates: { canonical: `${siteConfig.url}/projects` },
};

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
