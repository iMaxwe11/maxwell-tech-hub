"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { GrokStarfield } from "@/components/GrokStarfield";
import { ISSTracker } from "@/components/widgets/ISSTracker";
import { NASAAPODCard } from "@/components/widgets/NASAAPODCard";

function Sec({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const v = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section ref={ref} initial={{ opacity: 0, y: 40 }} animate={v ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, delay, ease: [0.25, 0.1, 0.25, 1] }} className={className}>
      {children}
    </motion.section>
  );
}

/* ═══ NEO (Near-Earth Objects) Widget ═══ */
function NEOWidget() {
  const [neos, setNeos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/nasa?endpoint=neo")
      .then(r => r.json())
      .then(data => {
        if (data?.near_earth_objects) {
          const today = new Date().toISOString().split("T")[0];
          const objects = data.near_earth_objects[today] || Object.values(data.near_earth_objects).flat();
          setNeos(objects.slice(0, 6));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="glass-card p-6 animate-pulse"><div className="h-48 bg-white/5 rounded" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
      <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
        <span className="text-xl">☄️</span> Near-Earth Objects
      </h3>
      <p className="text-xs text-white/40 font-mono mb-4">Asteroids passing close to Earth today</p>
      {neos.length === 0 ? (
        <p className="text-white/40 text-sm">No NEO data available right now.</p>
      ) : (
        <div className="space-y-3">
          {neos.map((neo: any, i: number) => (
            <motion.div key={neo.id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/80 truncate">{neo.name?.replace(/[()]/g, '')}</p>
                <p className="text-[10px] text-white/30 font-mono">
                  {neo.estimated_diameter?.meters?.estimated_diameter_max
                    ? `~${Math.round(neo.estimated_diameter.meters.estimated_diameter_max)}m diameter`
                    : 'Size unknown'}
                </p>
              </div>
              {neo.is_potentially_hazardous_asteroid && (
                <span className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-[10px] text-red-400 font-mono shrink-0 ml-2">
                  HAZARDOUS
                </span>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* ═══ SPACE PAGE ═══ */
export default function SpacePage() {
  return (
    <>
      <GrokStarfield />
      <div className="aurora-bg"><div className="aurora-band" /><div className="aurora-band" /></div>

      {/* Navbar */}
      <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
        className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/[0.08]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 opacity-30 group-hover:opacity-50 transition-opacity" />
              <div className="absolute inset-[2px] rounded-[6px] bg-[#050505] flex items-center justify-center">
                <span className="text-xs font-bold gradient-text">M</span>
              </div>
            </div>
            <span className="text-base font-semibold tracking-wide text-white/90 hidden sm:inline">
              maxwellnixon<span className="text-cyan-400">.</span>com
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <Link href="/" className="px-4 py-2 text-sm font-medium tracking-wider uppercase text-white/50 hover:text-white transition-colors font-mono">Home</Link>
            <Link href="/tools" className="px-4 py-2 text-sm font-medium tracking-wider uppercase text-white/50 hover:text-white transition-colors font-mono">Tools</Link>
            <Link href="/play" className="px-4 py-2 text-sm font-medium tracking-wider uppercase text-white/50 hover:text-white transition-colors font-mono">Arcade</Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero */}
      <div className="pt-32 pb-8 px-4 sm:px-6">
        <div className="max-w-[1400px] mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <span className="terminal-prompt font-mono text-sm text-white/70">space_&_science</span>
            <h1 className="mt-4 font-bold text-4xl sm:text-5xl md:text-6xl text-white leading-tight">
              Space <span className="gradient-text">&amp;</span> Science
            </h1>
            <p className="mt-4 text-white/60 max-w-2xl text-lg">
              Real-time data from orbit and beyond — ISS tracking, NASA imagery, and near-Earth object monitoring.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <main className="px-4 sm:px-6 pb-24">
        <div className="max-w-[1400px] mx-auto space-y-8">

          {/* ISS + APOD Row */}
          <Sec className="grid md:grid-cols-2 gap-6" delay={0.1}>
            <ISSTracker />
            <NASAAPODCard />
          </Sec>

          {/* NEO Section */}
          <Sec delay={0.2}>
            <NEOWidget />
          </Sec>

          {/* Fun Facts */}
          <Sec delay={0.3}>
            <div className="glass-card p-8">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span className="text-xl">🌌</span> Quick Space Facts
              </h3>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "ISS Orbit Speed", value: "~28,000 km/h", icon: "🚀" },
                  { label: "ISS Altitude", value: "~408 km", icon: "📡" },
                  { label: "Orbits Per Day", value: "~15.5", icon: "🌍" },
                  { label: "Crew Size", value: "Typically 6-7", icon: "👨‍🚀" },
                ].map((fact, i) => (
                  <motion.div key={fact.label} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.08, type: "spring", stiffness: 200 }}
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center hover:border-white/10 transition-all">
                    <div className="text-2xl mb-2">{fact.icon}</div>
                    <p className="text-white/90 font-bold text-sm">{fact.value}</p>
                    <p className="text-white/40 text-xs font-mono mt-1">{fact.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </Sec>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/25 text-xs font-mono">&copy; {new Date().getFullYear()} Maxwell Nixon</p>
          <div className="flex gap-4">
            <Link href="/" className="text-white/30 hover:text-cyan-400 transition-colors text-xs font-mono">Home</Link>
            <Link href="/tools" className="text-white/30 hover:text-cyan-400 transition-colors text-xs font-mono">Tools</Link>
            <Link href="/play" className="text-white/30 hover:text-cyan-400 transition-colors text-xs font-mono">Arcade</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
