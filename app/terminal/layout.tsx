import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terminal · Maxwell Nixon",
  description:
    "An interactive CLI-style navigator for Maxwell Nixon's portfolio. Type commands to explore projects, skills, and contact info.",
  openGraph: {
    title: "Terminal · Maxwell Nixon",
    description: "Interactive command-line navigator for maxwellnixon.com",
  },
};

export default function TerminalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
