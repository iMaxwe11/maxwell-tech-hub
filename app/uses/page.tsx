"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

/* ═══════════════════════════════════════════════════════════════
   DATA — edit freely; the page reflects it immediately
   ═══════════════════════════════════════════════════════════════ */

const LAST_UPDATED = "May 2026";

interface UsesItem {
  name: string;
  detail?: string;
  href?: string;
}

interface UsesGroup {
  eyebrow: string;
  title: string;
  items: UsesItem[];
}

const GROUPS: UsesGroup[] = [
  {
    eyebrow: "editor",
    title: "Editor & terminal",
    items: [
      { name: "VS Code", detail: "GitHub Dark Default · JetBrains Mono · Vim mode off (most days)" },
      { name: "Windows Terminal", detail: "PowerShell 7 + Oh My Posh prompt" },
      { name: "Claude Code / Cursor", detail: "AI pair-programming for refactors and bulk edits" },
      { name: "GitHub Desktop + gh CLI", detail: "Desktop for visual diffs, CLI for everything else" },
    ],
  },
  {
    eyebrow: "stack",
    title: "Web stack",
    items: [
      { name: "Next.js 15", detail: "App Router, Turbopack-ready" },
      { name: "TypeScript", detail: "strict mode on every project" },
      { name: "Tailwind CSS", detail: "utility-first, glass-morphism components" },
      { name: "Framer Motion", detail: "page transitions, stagger animations, scroll-driven reveals" },
      { name: "Vercel", detail: "deploys, edge runtime, analytics, speed insights" },
      { name: "pnpm", detail: "package manager — fast, content-addressed store" },
    ],
  },
  {
    eyebrow: "backend",
    title: "Backend & infra",
    items: [
      { name: "Python + FastAPI", detail: "ETL pipelines, internal tools, glue services" },
      { name: "PostgreSQL", detail: "primary data store; SQLite for embedded use cases" },
      { name: "Docker + Docker Compose", detail: "everything runs in a container, including dev environments" },
      { name: "Kubernetes", detail: "for the workloads that justify the complexity" },
      { name: "Windows Server + Active Directory", detail: "day-job IT — domain controllers, GPOs, PXE imaging" },
    ],
  },
  {
    eyebrow: "cloud",
    title: "Cloud & ops",
    items: [
      { name: "AWS", detail: "EC2, S3, Lambda, CloudFront — when scale demands it" },
      { name: "Azure", detail: "M365, Entra ID, hybrid identity for client environments" },
      { name: "Cloudflare", detail: "DNS, R2 storage, edge proxying" },
      { name: "GitHub Actions", detail: "CI/CD for every repo I care about" },
    ],
  },
  {
    eyebrow: "hardware",
    title: "Daily-driver hardware",
    items: [
      { name: "Custom desktop", detail: "Ryzen 9 · 64GB DDR5 · NVMe-everything · home-lab GPU rig" },
      { name: "ThinkPad", detail: "field/client work; runs Windows 11 + WSL2 Ubuntu" },
      { name: "34\" ultrawide + secondary 27\"", detail: "code on the wide, terminal/docs on the side" },
      { name: "Sim racing rig", detail: "Logitech wheel + load-cell pedals, mostly iRacing" },
    ],
  },
  {
    eyebrow: "everyday",
    title: "Everyday tools",
    items: [
      { name: "1Password", detail: "every credential in a vault, nothing in browser autofill" },
      { name: "Obsidian", detail: "personal knowledge base, daily notes, project plans" },
      { name: "Spotify", detail: "lo-fi or synthwave for deep work; podcasts for IT and dev shop talk" },
      { name: "Raycast / PowerToys Run", detail: "spotlight launcher across machines" },
    ],
  },
  {
    eyebrow: "data sources",
    title: "APIs powering this site",
    items: [
      { name: "Open-Meteo", detail: "weather + air quality, no API key required" },
      { name: "RainViewer", detail: "live precipitation radar tiles" },
      { name: "Yahoo Finance v8 chart endpoint", detail: "stock data without auth (v7 quote endpoint is blocked from Vercel IPs)" },
      { name: "CoinGecko", detail: "crypto prices, refresh every 90s" },
      { name: "NASA Open APIs", detail: "APOD, ISS position, Mars rover photos, upcoming launches" },
      { name: "GitHub REST API", detail: "live activity feed on the homepage" },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function Section({
  eyebrow,
  title,
  children,
  delay = 0,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className="mb-12"
    >
      <span className="terminal-prompt font-mono text-sm text-white/70">{eyebrow}</span>
      <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-white mb-5">{title}</h2>
      {children}
    </motion.section>
  );
}

function ItemRow({ item, index }: { item: UsesItem; index: number }) {
  const content = (
    <>
      <div className="flex items-baseline justify-between gap-4 mb-1">
        <h3 className="text-white font-semibold text-sm sm:text-base">{item.name}</h3>
        {item.href && (
          <span aria-hidden className="text-cyan-400/60 text-xs font-mono">↗</span>
        )}
      </div>
      {item.detail && (
        <p className="text-white/55 text-sm leading-relaxed">{item.detail}</p>
      )}
    </>
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
      className="glass-card p-4 hover:border-cyan-400/20 transition-colors"
    >
      {item.href ? (
        <a
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40 rounded"
        >
          {content}
        </a>
      ) : (
        content
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════ */

export default function UsesPage() {
  return (
    <>
      <div className="aurora-bg">
        <div className="aurora-band" />
        <div className="aurora-band" />
      </div>
      <Navbar breadcrumb={["uses"]} />

      <main className="relative pt-28 pb-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <span className="terminal-prompt font-mono text-sm text-white/70">/ uses</span>
            <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
              <span className="text-white">Tools I </span>
              <span className="gradient-text">actually use</span>
            </h1>
            <p className="mt-5 text-white/60 text-base sm:text-lg leading-relaxed">
              The hardware, software, and services I reach for every day — at the IT day-job and
              on personal projects. Inspired by the{" "}
              <a
                href="https://uses.tech"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                /uses page movement
              </a>
              .
            </p>
            <p className="mt-4 text-xs font-mono text-white/35">
              Last updated: <span className="text-white/55">{LAST_UPDATED}</span>
            </p>
          </motion.div>

          {GROUPS.map((group, gIdx) => (
            <Section key={group.title} eyebrow={group.eyebrow} title={group.title} delay={gIdx * 0.04}>
              <div className="grid sm:grid-cols-2 gap-3">
                {group.items.map((item, i) => (
                  <ItemRow key={item.name} item={item} index={i} />
                ))}
              </div>
            </Section>
          ))}

          {/* Footer tip */}
          <div className="pt-8 border-t border-white/5">
            <p className="text-xs font-mono text-white/30 text-center">
              See also{" "}
              <Link href="/now" className="text-white/50 hover:text-cyan-400 transition-colors">
                /now
              </Link>{" "}
              ·{" "}
              <Link href="/projects" className="text-white/50 hover:text-cyan-400 transition-colors">
                /projects
              </Link>{" "}
              ·{" "}
              <Link href="/" className="text-white/50 hover:text-cyan-400 transition-colors">
                home
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
