import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Service Status Monitor | Maxwell Nixon",
  description: "Real-time monitoring dashboard for 24+ popular services — cloud, social, streaming, gaming, and AI platforms.",
};

export default function StatusLayout({ children }: { children: React.ReactNode }) {
  return children;
}
