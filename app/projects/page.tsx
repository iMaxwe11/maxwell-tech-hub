"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { GrokStarfield } from "@/components/GrokStarfield";
import { siteConfig } from "@/lib/site-config";

/* ═════════════════════════════════════════════════════════════
   TYPES
   ═════════════════════════════════════════════════════════════ */
interface WorkItem {
  title: string;
  desc: string;
  icon: string;
  tags: string[];
  gradient: string;
  /** Internal route OR external URL (absolute with https://) */
  href?: string;
  /** External URL for a "GitHub" link next to the primary action */
  github?: string;
  /** Category label shown as a chip inside the card */
  category: string;
  /** Non-link items (e.g. professional work) skip the affordance */
  noLink?: boolean;
}

/* ═════════════════════════════════════════════════════════════
   DATA
   ═════════════════════════════════════════════════════════════ */
const LIVE_EXPERIENCES: WorkItem[] = [
  {
    title: "Space & Launch Tracker",
    desc: "Real-time space dashboard — ISS tracking, NASA imagery, launch schedules across all providers, Mars rover photos, asteroid monitoring, and solar weather.",
    icon: "🚀",
    tags: ["Next.js", "NASA API", "Space Devs", "Real-time"],
    gradient: "from-indigo-500 to-purple-600",
    href: "/space",
    category: "Data · Live",
  },
  {
    title: "Weather Dashboard",
    desc: "Full-featured weather with live radar, hourly and 7-day forecasts, wind compass, sun arc, air quality, and precipitation tracking. Entirely from free APIs.",
    icon: "🌦️",
    tags: ["Open-Meteo", "Windy", "Canvas", "Real-time"],
    gradient: "from-sky-500 to-blue-600",
    href: "/weather",
    category: "Data · Live",
  },
  {
    title: "News Feed Hub",
    desc: "Auto-curated news from tech, world, and gaming sources via RSS. HN, BBC, The Verge, Kotaku, and more — refreshes every 15 minutes with zero manual work.",
    icon: "📰",
    tags: ["RSS", "Server-side", "Auto-refresh", "Next.js API"],
    gradient: "from-emerald-500 to-teal-600",
    href: "/news",
    category: "Data · Live",
  },
  {
    title: "Blog",
    desc: "Writing on IT work, infrastructure decisions, self-hosted AI, and the small lessons from running real-world systems for real businesses.",
    icon: "✍️",
    tags: ["Writing", "Long-form", "Technical"],
    gradient: "from-amber-500 to-orange-600",
    href: "/blog",
    category: "Content",
  },
  {
    title: "Status Dashboard",
    desc: "Live infrastructure heartbeat — service uptime, response times, and transparent reporting on the systems that power this site.",
    icon: "📡",
    tags: ["Monitoring", "Uptime", "SRE"],
    gradient: "from-green-500 to-emerald-600",
    href: "/status",
    category: "Operations",
  },
  {
    title: "Privacy Analytics",
    desc: "First-party, privacy-respecting analytics dashboard — local-only tracking, zero third-party scripts, no cookies. Useful data without the creep.",
    icon: "📊",
    tags: ["Privacy", "localStorage", "First-party"],
    gradient: "from-fuchsia-500 to-pink-600",
    href: "/analytics",
    category: "Operations",
  },
];

const LABS: WorkItem[] = [
  {
    title: "Smart Data Pipeline",
    desc: "Cloud-style ETL pipeline — FastAPI service layer, Python processor, Streamlit dashboard. Fully containerized with Docker Compose and CI/CD via GitHub Actions.",
    icon: "🔄",
    tags: ["FastAPI", "Python", "Docker", "Streamlit", "CI/CD"],
    gradient: "from-cyan-500 to-blue-600",
    github: "https://github.com/iMaxwe11/smart-data-pipeline",
    href: "https://github.com/iMaxwe11/smart-data-pipeline",
    category: "Open Source",
  },
  {
    title: "Home Lab & AI Automation",
    desc: "Self-hosted containerized LLaMA and Mistral models with GPU acceleration. Prompt tuning, offline inference, and scripting pipelines — privacy-first by design.",
    icon: "🧠",
    tags: ["LLaMA", "Mistral", "Docker", "GPU", "Python"],
    gradient: "from-orange-500 to-red-500",
    github: "https://github.com/iMaxwe11",
    href: "https://github.com/iMaxwe11",
    category: "Lab",
  },
  {
    title: "FiveM Game Server",
    desc: "Launched and managed a public FiveM multiplayer server with custom vehicles, physics mods, real-time logging, and automated mod loaders.",
    icon: "🎮",
    tags: ["Lua", "Server Admin", "Modding", "Multiplayer"],
    gradient: "from-green-500 to-emerald-600",
    github: "https://github.com/iMaxwe11",
    href: "https://github.com/iMaxwe11",
    category: "Lab",
  },
];

const PROFESSIONAL: WorkItem[] = [
  {
    title: "IT Infrastructure @ PCS",
    desc: "Enterprise IT support for law firms and businesses across NJ, PA, and DE. Windows Server deployment, Active Directory, VLANs, PXE imaging, VPN, and ConnectWise ticketing.",
    icon: "🏢",
    tags: ["Windows Server", "AD", "VLANs", "PXE", "ConnectWise"],
    gradient: "from-blue-500 to-indigo-600",
    category: "Professional",
    noLink: true,
  },
];

/* ═════════════════════════════════════════════════════════════
   CARD
   ═════════════════════════════════════════════════════════════ */
function WorkCard({ item, index }: { item: WorkItem; index: number }) {
  const isExternal = item.href?.startsWith("http");
  const CardInner = (
    <>
      {/* Visual header */}
      <div
        className={`relative h-28 rounded-xl overflow-hidden mb-4 bg-gradient-to-br ${item.gradient}`}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.15) 1.5px, transparent 1.5px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-3 left-4 text-3xl drop-shadow-lg">{item.icon}</div>
        <div className="absolute top-3 right-3">
          <span className="text-[9px] font-mono uppercase tracking-wider text-white/90 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/10">
            {item.category}
          </span>
        </div>
      </div>

      {/* Text */}
      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
        {item.title}
      </h3>
      <p className="text-white/55 text-sm leading-relaxed mb-4">{item.desc}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {item.tags.map((t) => (
          <span
            key={t}
            className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-white/50 border border-white/[0.06] font-mono"
          >
            {t}
          </span>
        ))}
      </div>

      {/* Affordance */}
      {!item.noLink && (
        <div className="flex gap-4 text-xs font-mono text-white/40">
          {item.href && (
            <span className="flex items-center gap-1.5 group-hover:text-cyan-400 transition-colors">
              {isExternal ? "View on GitHub" : "Open →"}
              {isExternal && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                </svg>
              )}
            </span>
          )}
        </div>
      )}
    </>
  );

  const cardClasses =
    "glass-card p-5 h-full group relative overflow-hidden cursor-pointer transition-transform";
  const motionProps = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { delay: index * 0.05, duration: 0.5 },
    whileHover: { y: -4 },
  } as const;

  if (item.noLink || !item.href) {
    return (
      <motion.div className={cardClasses} {...motionProps}>
        {CardInner}
      </motion.div>
    );
  }
  if (isExternal) {
    return (
      <motion.a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={cardClasses}
        {...motionProps}
      >
        {CardInner}
      </motion.a>
    );
  }
  return (
    <motion.div className={cardClasses} {...motionProps}>
      <Link href={item.href} className="absolute inset-0 z-10" aria-label={item.title} />
      <div className="relative">{CardInner}</div>
    </motion.div>
  );
}

/* ═════════════════════════════════════════════════════════════
   SECTION
   ═════════════════════════════════════════════════════════════ */
function WorkSection({
  eyebrow,
  title,
  blurb,
  items,
}: {
  eyebrow: string;
  title: string;
  blurb: string;
  items: WorkItem[];
}) {
  return (
    <section className="relative py-16 sm:py-20 px-4 sm:px-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-10">
          <span className="terminal-prompt font-mono text-sm text-white/70">{eyebrow}</span>
          <h2 className="mt-3 font-bold text-2xl sm:text-3xl text-white">{title}</h2>
          <p className="mt-3 text-white/60 max-w-2xl text-sm sm:text-base">{blurb}</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item, i) => (
            <WorkCard key={item.title} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═════════════════════════════════════════════════════════════
   PAGE
   ═════════════════════════════════════════════════════════════ */
export default function ProjectsPage() {
  return (
    <>
      <GrokStarfield />
      <div className="aurora-bg"><div className="aurora-band" /><div className="aurora-band" /></div>
      <Navbar breadcrumb={["projects"]} />

      <main className="relative pt-28 pb-16">
        {/* Hero */}
        <section className="relative px-4 sm:px-6 pb-8">
          <div className="max-w-[1200px] mx-auto">
            <span className="terminal-prompt font-mono text-sm text-white/70">/ projects</span>
            <h1 className="mt-4 font-bold text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight">
              <span className="text-white">Everything I&apos;ve </span>
              <span className="gradient-text">built</span>
            </h1>
            <p className="mt-5 max-w-2xl text-white/60 text-base sm:text-lg leading-relaxed">
              Live experiences, open-source labs, and professional infrastructure work.
              From real-time dashboards to self-hosted AI — every side of the stack,
              in one place.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/tools" className="glow-btn glow-btn-filled">
                <span>Try the Tools Hub</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <a
                href={`https://github.com/${siteConfig.githubUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="glow-btn"
              >
                <span>GitHub Profile</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                </svg>
              </a>
            </div>
          </div>
        </section>

        <div className="section-divider my-8" />

        <WorkSection
          eyebrow="live_experiences"
          title="Live Experiences"
          blurb="Dashboards and products that run on the open web — each one consumes real-time APIs and renders instantly, no login required."
          items={LIVE_EXPERIENCES}
        />

        <div className="section-divider my-4" />

        <WorkSection
          eyebrow="open_source_labs"
          title="Open Source & Labs"
          blurb="Repos and experiments that live on GitHub. Some are polished, some are in-flight — all are hackable."
          items={LABS}
        />

        <div className="section-divider my-4" />

        <WorkSection
          eyebrow="professional"
          title="Professional"
          blurb="Real-world infrastructure work for paying customers. Different rules, different stakes — same attention to reliability."
          items={PROFESSIONAL}
        />

        {/* Back CTA */}
        <section className="relative py-14 px-4 sm:px-6">
          <div className="max-w-[1200px] mx-auto text-center">
            <p className="text-white/50 text-sm font-mono mb-4">
              Want to talk about any of this?
            </p>
            <Link href="/contact" className="glow-btn glow-btn-filled">
              <span>Get in touch</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
