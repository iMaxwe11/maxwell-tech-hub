import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Uses",
  description:
    "The hardware, software, and services Maxwell Nixon reaches for daily — editor, web stack, backend, cloud, and the APIs powering this site.",
  path: "/uses",
  keywords: ["uses page", "developer setup", "tech stack", "tooling", "Windows", "Next.js"],
  tag: "Uses",
});

export default function UsesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
