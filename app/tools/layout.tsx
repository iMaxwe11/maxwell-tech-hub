import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Developer Tools",
  description: "A private suite of 27 client-side developer utilities for formatting, encoding, testing, generating, and quick experiments.",
  path: "/tools",
  tag: "Tools",
  keywords: ["developer tools", "JSON formatter", "regex tester", "password checker", "markdown preview"],
});

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
