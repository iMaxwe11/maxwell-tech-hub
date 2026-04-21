"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { SocialIcon } from "@/components/SocialIcon";
import { siteConfig, socialLinks } from "@/lib/site-config";

type CopyField = "email" | "phone" | null;

const outreachTracks = [
  {
    title: "Portfolio or Product Build",
    detail: "Landing pages, dashboards, and polished interactive experiences that feel custom instead of templated.",
    accent: "from-cyan-400/20 to-cyan-400/5",
  },
  {
    title: "Automation + Internal Tools",
    detail: "Ops helpers, API integrations, status dashboards, and workflow cleanup that saves real time.",
    accent: "from-purple-500/20 to-purple-500/5",
  },
  {
    title: "IT + Cloud Support",
    detail: "Infra cleanup, troubleshooting, documentation, and practical delivery support across the stack.",
    accent: "from-amber-400/20 to-amber-400/5",
  },
];

const outreachTemplates = [
  {
    label: "Project Inquiry",
    subject: "Project inquiry from maxwellnixon.com",
    body: "Hey Maxwell,\n\nI have a project in mind:\n- Scope:\n- Timeline:\n- Budget:\n\nWould love to talk details.",
  },
  {
    label: "Freelance Availability",
    subject: "Freelance availability check",
    body: "Hey Maxwell,\n\nAre you available for freelance work this month?\n\nProject summary:\n- \n\nThanks.",
  },
  {
    label: "Tech Conversation",
    subject: "Let's talk tech",
    body: "Hey Maxwell,\n\nI found your site and wanted to connect.\n\nTopic:\n- \n\nBest,\n",
  },
];

export default function ContactPage() {
  const [copiedField, setCopiedField] = useState<CopyField>(null);
  const [copyError, setCopyError] = useState(false);

  const copyValue = async (value: string, field: Exclude<CopyField, null>) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopyError(false);
      setCopiedField(field);
    } catch {
      setCopyError(true);
      setCopiedField(null);
    } finally {
      window.setTimeout(() => {
        setCopiedField(null);
        setCopyError(false);
      }, 2000);
    }
  };

  const quickFacts = [
    { label: "Location", value: siteConfig.location, icon: "📍" },
    { label: "Timezone", value: "ET / America/New_York", icon: "🕐" },
    { label: "Response", value: "Usually within 24 hours", icon: "⚡" },
    { label: "Availability", value: "Open to freelance + collabs", icon: "✅" },
  ];

  return (
    <>
      <div className="aurora-bg"><div className="aurora-band" /><div className="aurora-band" /></div>

      <Navbar breadcrumb={["contact"]} />

      <main className="relative min-h-screen pt-28 pb-16 px-4 sm:px-6">
        <div className="max-w-[1100px] mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
            <div className="inline-flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono mb-6">
              <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-cyan-300">Open to projects</span>
              <span className="rounded-full border border-purple-400/20 bg-purple-400/10 px-3 py-1 text-purple-300">Freelance friendly</span>
              <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-amber-300">East Coast / Remote</span>
            </div>

            <h1 className="text-5xl sm:text-6xl font-bold text-white leading-[0.95]">
              Let&apos;s Build Something <span className="gradient-text">Sharp</span>
            </h1>
            <p className="mt-5 text-white/55 text-lg max-w-2xl mx-auto">
              Product-minded frontend work, polished portfolio builds, automation tooling, and practical cloud/IT execution.
            </p>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] items-start">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-8"
            >
              <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
                <div>
                  <p className="text-[11px] font-mono uppercase tracking-[0.3em] text-cyan-400/60">Communication Deck</p>
                  <h2 className="mt-3 text-2xl font-bold text-white">Fastest Ways To Reach Me</h2>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-2xl">
                  ✉️
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                  <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/35">Email</p>
                  <p className="mt-2 text-xl font-semibold text-white break-all">{siteConfig.email}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => copyValue(siteConfig.email, "email")}
                      className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors"
                    >
                      {copiedField === "email" ? "Copied" : "Copy Email"}
                    </button>
                    <a
                      href={`mailto:${siteConfig.email}`}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-sm font-medium"
                    >
                      Start Email
                    </a>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                    <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/35">Phone</p>
                    <p className="mt-2 text-lg font-semibold text-white">{siteConfig.phone}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => copyValue(siteConfig.phone, "phone")}
                        className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors"
                      >
                        {copiedField === "phone" ? "Copied" : "Copy Number"}
                      </button>
                      <a
                        href={`tel:${siteConfig.phone.replace(/[^+\d]/g, "")}`}
                        className="px-4 py-2 rounded-xl border border-white/10 text-white/70 text-sm font-medium hover:text-white hover:border-white/20 transition-colors"
                      >
                        Call
                      </a>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                    <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/35">Resume</p>
                    <p className="mt-2 text-lg font-semibold text-white">Current profile packet</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <a
                        href={siteConfig.resumePath}
                        className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors"
                      >
                        Download Resume
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <span className="sr-only" aria-live="polite">
                  {copiedField === "email"
                    ? "Email copied to clipboard."
                    : copiedField === "phone"
                    ? "Phone number copied to clipboard."
                    : copyError
                    ? "Copy failed."
                    : ""}
                </span>
              </div>
            </motion.section>

            <motion.aside
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="space-y-4"
            >
              <div className="glass-card p-6">
                <p className="text-[11px] font-mono uppercase tracking-[0.3em] text-purple-400/60">Best Fit</p>
                <div className="mt-4 space-y-3">
                  {quickFacts.map((fact) => (
                    <div key={fact.label} className="rounded-xl border border-white/[0.05] bg-black/20 px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-2xl">{fact.icon}</span>
                        <div className="text-right">
                          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/35">{fact.label}</p>
                          <p className="mt-1 text-sm text-white/75">{fact.value}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-6">
                <p className="text-[11px] font-mono uppercase tracking-[0.3em] text-amber-400/60">What I Can Help With</p>
                <div className="mt-4 space-y-3">
                  {outreachTracks.map((track) => (
                    <div key={track.title} className={`rounded-2xl border border-white/[0.05] bg-gradient-to-br ${track.accent} px-4 py-4`}>
                      <h3 className="text-sm font-semibold text-white">{track.title}</h3>
                      <p className="mt-2 text-[13px] text-white/55 leading-relaxed">{track.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.aside>
          </div>

          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-10">
            <div className="glass-card p-8">
              <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
                <div>
                  <p className="text-[11px] font-mono uppercase tracking-[0.3em] text-cyan-400/60">Quick Starts</p>
                  <h2 className="mt-3 text-2xl font-bold text-white">Start With a Strong Subject Line</h2>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {outreachTemplates.map((template) => (
                  <a
                    key={template.label}
                    href={`mailto:${siteConfig.email}?subject=${encodeURIComponent(template.subject)}&body=${encodeURIComponent(template.body)}`}
                    className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 hover:border-cyan-400/20 transition-colors"
                  >
                    <p className="text-sm font-semibold text-white">{template.label}</p>
                    <p className="mt-2 text-[13px] text-white/45">
                      Opens a prefilled draft so you can get straight to the useful details.
                    </p>
                    <div className="mt-4 text-xs font-mono text-cyan-300/80">Open draft ↗</div>
                  </a>
                ))}
              </div>
            </div>
          </motion.section>

          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mt-10">
            <h2 className="text-2xl font-bold text-white mb-6">Connect Elsewhere</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {socialLinks.filter((social) => social.name !== "Email").map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-card p-5 flex items-center gap-4 hover:scale-[1.01] transition-[transform,border-color] rounded-2xl"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-white/10">
                    <SocialIcon name={social.name} className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-white/50">{social.name}</div>
                    <div className="text-white font-semibold">{social.label}</div>
                  </div>
                  <span className="text-white/30">↗</span>
                </a>
              ))}
            </div>
          </motion.section>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-12 text-center glass-card p-8">
            <p className="text-white/70 text-lg leading-relaxed max-w-2xl mx-auto">
              Clear brief, messy idea, half-built project, or just a good technical conversation.
              <span className="gradient-text font-semibold"> All of those are valid reasons to reach out.</span>
            </p>
          </motion.div>
        </div>
      </main>
    </>
  );
}
