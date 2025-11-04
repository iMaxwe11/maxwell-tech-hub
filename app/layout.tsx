import "./globals.css";
import Link from "next/link";
import { ThemePicker } from "@/components/ThemePicker";
import { ChatWidget } from "@/components/ChatWidget";

export const metadata = {
  title: "Maxwell Tech Hub",
  description: "Interactive portfolio and tool lab.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <div className="max-w-6xl mx-auto px-5">
          <nav className="flex items-center justify-between py-6">
            <Link href="/" className="font-semibold tracking-wide">Maxwell<span className="text-accent">_Hub</span></Link>
            <div className="flex items-center gap-4">
              <Link className="link" href="/tools">Tools</Link>
              <Link className="link" href="/terminal">Terminal</Link>
              <Link className="link" href="/security">Security</Link>
              <Link className="link" href="/contact">Contact</Link>
              <ThemePicker />
            </div>
          </nav>
          {children}
          <footer className="py-10 text-sm text-white/60">© {new Date().getFullYear()} Maxwell. Built with care.</footer>
        </div>
        <ChatWidget />
      </body>
    </html>
  );
}
