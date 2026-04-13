import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Contact",
  description: "Reach out to Maxwell Nixon for collaborations, freelance work, infrastructure consulting, or full-stack builds.",
  path: "/contact",
  tag: "Contact",
  keywords: ["contact Maxwell Nixon", "hire developer", "IT consulting", "freelance developer"],
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
