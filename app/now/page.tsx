"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { GrokStarfield } from "@/components/GrokStarfield";

/* ═══════════════════════════════════════════════════════════════
   DATA — edit this freely; the page will reflect it immediately
   ═══════════════════════════════════════════════════════════════ */

const LAST_UPDATED = "April 2026";

const WORKING_ON = [
  {
    title: "maxwellnixon.com overhaul",
    desc: "Simplifying the primary nav, building a /projects hub, and tightening the home page. Ongoing polish on the live-data widgets.",
    status: "active",
  },
  {
    title: "Self-hosted LLM stack",
    desc: "Running LLaMA and Mistral on my home-lab GPU rig. Exploring prompt pipelines and offline inference for privacy-first tooling.",
    status: "active",
  },
  {
    title: "Smart Data Pipeline (v2)",
    desc: "FastAPI + Python ETL with a Streamlit dashboard. Adding more robust CI/CD and a proper observability layer.",
    status: "active",
  },
  {
    title: "Client IT infrastructure",
    desc: "Day-to-day: Windows Server, Active Directory, VLANs, and PXE imaging for law firms and businesses across NJ/PA/DE.",
    status: "ongoing",
  },
];

const LEARNING = [
  "Deeper Kubernetes patterns — beyond `kubectl apply`",
  "Writing better Python type hints with `mypy` strict mode",
  "Edge deployment trade-offs — Vercel Edge Functions vs. Cloudflare Workers",
  "Prompt engineering techniques for smaller local models",
];

const READING_WATCHING = [
  { kind: "Reading", text: "The Pragmatic Programmer (20th Anniversary Edition)" },
  { kind: "Listening", text: "Syntax.fm — front-end & full-stack shop talk" },
  { kind: "Tinkering", text: "Custom PC builds, sim racing rigs, and FiveM modding" },
];

const AVAILABILITY = {
  status: "Open to interesting projects",
  detail:
    "Currently employed full-time but open to side work on backend automation, cloud migrations, or custom internal tools. Remote or NJ/PA/DE region.",
};

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
      className="mb-14"
    >
      <span className="terminal-prompt font-mono text-sm text-white/70">{eyebrow}</span>
      <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-white mb-6">{title}</h2>
      {children}
    </motion.section>
  );
}

function StatusDot({ status }: { status: "active" | "ongoing" }) {
  const color = status === "active" ? "bg-green-400" : "bg-cyan-400";
  const label = status === "active" ? "Active" : "Ongoing";
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-white/50">
      <motion.span
        animate={{ opacity: [1, 0.35, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className={`w-1.5 h-1.5 rounded-full ${color}`}
      />
      {label}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════ */

export default function NowPage() {
  return (
    <>
      <GrokStarfield />
      <div className="aurora-bg">
        <div className="aurora-band" />
        <div className="aurora-band" />
      </div>
      <Navbar breadcrumb={["now"]} />

      <main className="relative pt-28 pb-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-14"
          >
            <span className="terminal-prompt font-mono text-sm text-white/70">/ now</span>
            <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
              <span className="text-white">What I&apos;m </span>
              <span className="gradient-text">doing now</span>
            </h1>
            <p className="mt-5 text-white/60 text-base sm:text-lg leading-relaxed">
              A snapshot of what&apos;s on my desk right now — projects, learning, and the books
              and tinkering filling the in-between. Inspired by{" "}
              <a
                href="https://nownownow.com/about"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Derek Sivers&apos; /now page movement
              </a>
              .
            </p>
            <p className="mt-4 text-xs font-mono text-white/35">
              Last updated: <span className="text-white/55">{LAST_UPDATED}</span>
            </p>
          </motion.div>

          {/* Working on */}
          <Section eyebrow="currently" title="Working on">
            <div className="space-y-4">
              {WORKING_ON.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.5 }}
                  className="glass-card p-5"
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="text-white font-semibold text-base">{item.title}</h3>
                    <StatusDot status={item.status as "active" | "ongoing"} />
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </Section>

          {/* Learning */}
          <Section eyebrow="learning" title="Digging into">
            <ul className="space-y-2.5">
              {LEARNING.map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  className="flex gap-3 text-white/70 text-sm"
                >
                  <span className="text-cyan-400 mt-0.5 shrink-0">▸</span>
                  <span>{item}</span>
                </motion.li>
              ))}
            </ul>
          </Section>

          {/* Reading / Watching */}
          <Section eyebrow="inputs" title="Reading, listening, tinkering">
            <div className="grid sm:grid-cols-3 gap-3">
              {READING_WATCHING.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.4 }}
                  className="glass-card p-4"
                >
                  <p className="text-[10px] font-mono uppercase tracking-wider text-cyan-400/70 mb-1.5">
                    {item.kind}
                  </p>
                  <p className="text-white/75 text-sm leading-snug">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </Section>

          {/* Availability */}
          <Section eyebrow="availability" title="Open for work?">
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-3">
                <motion.span
                  animate={{ boxShadow: ["0 0 4px #22c55e", "0 0 12px #22c55e", "0 0 4px #22c55e"] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-green-400"
                />
                <p className="text-green-400 font-mono text-sm font-semibold">
                  {AVAILABILITY.status}
                </p>
              </div>
              <p className="text-white/65 text-sm leading-relaxed mb-4">
                {AVAILABILITY.detail}
              </p>
              <Link href="/contact" className="glow-btn glow-btn-filled w-fit text-sm">
                <span>Reach out</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </Section>

          {/* Footer tip */}
          <div className="pt-8 border-t border-white/5">
            <p className="text-xs font-mono text-white/30 text-center">
              See more at{" "}
              <Link href="/projects" className="text-white/50 hover:text-cyan-400 transition-colors">
                /projects
              </Link>{" "}
              ·{" "}
              <Link href="/blog" className="text-white/50 hover:text-cyan-400 transition-colors">
                /blog
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
