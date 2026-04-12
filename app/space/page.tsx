"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, useInView, AnimatePresence, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { GrokStarfield } from "@/components/GrokStarfield";
import { Navbar } from "@/components/Navbar";
import { ISSTracker } from "@/components/widgets/ISSTracker";
import { NASAAPODCard } from "@/components/widgets/NASAAPODCard";

/* ═══ Section Wrapper ═══ */
function Sec({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const v = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.section ref={ref} initial={{ opacity: 0, y: 40 }} animate={v ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, delay, ease: [0.25, 0.1, 0.25, 1] }} className={className}>
      {children}
    </motion.section>
  );
}

/* ═══ Orbit Ring Animation ═══ */
function OrbitRings() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      {[280, 400, 540, 700].map((size, i) => (
        <motion.div key={size} className="absolute rounded-full border"
          style={{ width: size, height: size, borderColor: `rgba(6, 182, 212, ${0.08 - i * 0.015})`, borderWidth: 1 }}
          animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
          transition={{ duration: 30 + i * 15, repeat: Infinity, ease: "linear" }}>
          <motion.div className="absolute rounded-full"
            style={{
              width: 4 + i * 2, height: 4 + i * 2,
              background: ["#06b6d4", "#a855f7", "#f59e0b", "#ef4444"][i],
              top: -2 - i, left: "50%", marginLeft: -2 - i,
              boxShadow: `0 0 ${8 + i * 4}px ${["#06b6d4", "#a855f7", "#f59e0b", "#ef4444"][i]}`,
            }} />
        </motion.div>
      ))}
      <div className="absolute w-4 h-4 rounded-full bg-cyan-400/60 blur-sm" />
      <div className="absolute w-40 h-40 rounded-full bg-cyan-400/5 blur-3xl" />
    </div>
  );
}

/* ═══ Mission Clock ═══ */
function MissionClock() {
  const [time, setTime] = useState("");
  const [missionDay, setMissionDay] = useState(0);
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toISOString().slice(11, 19));
      const expStart = new Date("2024-09-11T00:00:00Z");
      setMissionDay(Math.floor((now.getTime() - expStart.getTime()) / 86400000));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex items-center justify-center gap-6 text-xs font-mono">
      <div className="flex items-center gap-2">
        <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
          className="w-1.5 h-1.5 rounded-full bg-green-500" />
        <span className="text-white/40">UTC</span>
        <span className="text-cyan-400 tabular-nums tracking-wider">{time}</span>
      </div>
      <div className="text-white/30">|</div>
      <div><span className="text-white/40">Mission Day </span><span className="text-purple-400">{missionDay}</span></div>
    </div>
  );
}

/* ═══ Countdown Timer Helper ═══ */
function useCountdown(targetDate: string | null) {
  const [text, setText] = useState("");
  useEffect(() => {
    if (!targetDate) return;
    const tick = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) { setText("NOW"); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setText(d > 0 ? `${d}d ${h}h ${m}m ${s}s` : `${h}h ${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return text;
}

/* ═══ LAUNCH SCHEDULE — Full Launch Library 2 ═══ */
function LaunchSchedule() {
  const [launches, setLaunches] = useState<any[]>([]);
  const [pastLaunches, setPastLaunches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"upcoming" | "recent">("upcoming");

  useEffect(() => {
    Promise.all([
      fetch("https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=12&mode=list")
        .then(r => r.json()).catch(() => ({ results: [] })),
      fetch("https://ll.thespacedevs.com/2.2.0/launch/previous/?limit=8&mode=list")
        .then(r => r.json()).catch(() => ({ results: [] })),
    ]).then(([upcoming, recent]) => {
      setLaunches(upcoming.results || []);
      setPastLaunches(recent.results || []);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="glass-card p-6">
      <div className="h-8 w-48 bg-white/5 rounded animate-pulse mb-6" />
      <div className="space-y-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />)}</div>
    </div>
  );

  const items = tab === "upcoming" ? launches : pastLaunches;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-xl">🚀</span> Launch Schedule
          </h3>
          <p className="text-xs text-white/40 font-mono mt-1">All providers — SpaceX, NASA, ULA, Rocket Lab, ISRO & more</p>
        </div>
        <div className="flex gap-1">
          {(["upcoming", "recent"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-mono uppercase tracking-wider transition-all ${
                tab === t ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" : "text-white/40 hover:text-white/60 hover:bg-white/5"
              }`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
          className="space-y-3">
          {items.length === 0 ? (
            <p className="text-white/40 text-sm text-center py-8">No launch data available.</p>
          ) : items.map((launch: any, i: number) => (
            <LaunchCard key={launch.id || i} launch={launch} index={i} isPast={tab === "recent"} />
          ))}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

function LaunchCard({ launch, index, isPast }: { launch: any; index: number; isPast: boolean }) {
  const countdown = useCountdown(isPast ? null : launch.net);
  const date = launch.net ? new Date(launch.net) : null;
  const statusColor = launch.status?.abbrev === "Go"
    ? "text-green-400 bg-green-500/10 border-green-500/20"
    : launch.status?.abbrev === "Success"
    ? "text-green-400 bg-green-500/10 border-green-500/20"
    : launch.status?.abbrev === "TBD"
    ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
    : launch.status?.abbrev === "Failure"
    ? "text-red-400 bg-red-500/10 border-red-500/20"
    : "text-white/40 bg-white/5 border-white/10";

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-all group"
    >
      <div className="flex items-start gap-4">
        {/* Countdown / Date */}
        <div className="shrink-0 w-20 text-center">
          {!isPast && countdown ? (
            <div>
              <div className="text-[9px] text-white/30 font-mono uppercase mb-0.5">T-minus</div>
              <div className="text-xs font-bold font-mono text-purple-400 leading-tight">{countdown}</div>
            </div>
          ) : date ? (
            <div>
              <div className="text-lg font-bold text-white/80">{date.getDate()}</div>
              <div className="text-[10px] text-white/40 font-mono">{date.toLocaleString("en-US", { month: "short" })}</div>
            </div>
          ) : null}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h4 className="text-sm font-semibold text-white truncate">{launch.name}</h4>
            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-mono border shrink-0 ${statusColor}`}>
              {launch.status?.abbrev || "—"}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-white/30 font-mono flex-wrap">
            {launch.launch_service_provider?.name && (
              <span>{launch.launch_service_provider.name}</span>
            )}
            {launch.rocket?.configuration?.name && (
              <span className="text-white/20">• {launch.rocket.configuration.name}</span>
            )}
            {launch.pad?.location?.name && (
              <span className="text-white/20 hidden sm:inline">• {launch.pad.location.name}</span>
            )}
          </div>
          {launch.mission?.description && (
            <p className="text-[11px] text-white/25 mt-1.5 line-clamp-1 group-hover:text-white/40 transition-colors">
              {launch.mission.description}
            </p>
          )}
        </div>

        {/* Webcast link */}
        {launch.webcast_live && (
          <a href={launch.vidURLs?.[0]?.url || "#"} target="_blank" rel="noopener noreferrer"
            className="shrink-0 px-2 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-[9px] text-red-400 font-mono hover:bg-red-500/20 transition-all flex items-center gap-1">
            <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-red-500" />
            LIVE
          </a>
        )}
      </div>
    </motion.div>
  );
}

/* ═══ NEO Widget ═══ */
function NEOWidget() {
  const [neos, setNeos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/nasa?endpoint=neo").then(r => r.json()).then(data => {
      if (data?.near_earth_objects) {
        const today = new Date().toISOString().split("T")[0];
        const objects = data.near_earth_objects[today] || Object.values(data.near_earth_objects).flat();
        setNeos((objects as any[]).slice(0, 8));
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);
  if (loading) return <div className="glass-card p-6 animate-pulse"><div className="h-48 bg-white/5 rounded" /></div>;
  const hazardous = neos.filter((n: any) => n.is_potentially_hazardous_asteroid).length;
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-xl">☄️</span> Near-Earth Objects
          </h3>
          <p className="text-xs text-white/40 font-mono mt-1">Asteroids passing close to Earth today</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{neos.length}</div>
            <div className="text-[9px] text-white/40 font-mono uppercase">tracked</div>
          </div>
          {hazardous > 0 && (
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{hazardous}</div>
              <div className="text-[9px] text-red-400/60 font-mono uppercase">hazardous</div>
            </div>
          )}
        </div>
      </div>
      {neos.length === 0 ? (
        <p className="text-white/40 text-sm">No NEO data available.</p>
      ) : (
        <div className="space-y-2">
          {neos.map((neo: any, i: number) => {
            const dist = neo.close_approach_data?.[0]?.miss_distance?.kilometers;
            const velocity = neo.close_approach_data?.[0]?.relative_velocity?.kilometers_per_hour;
            const diameter = neo.estimated_diameter?.meters?.estimated_diameter_max;
            return (
              <motion.div key={neo.id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-all">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/80 truncate font-medium">{neo.name?.replace(/[()]/g, "")}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    {diameter && <span className="text-[10px] text-white/30 font-mono">⌀ {Math.round(diameter)}m</span>}
                    {dist && <span className="text-[10px] text-white/30 font-mono">{Number(Number(dist).toFixed(0)).toLocaleString()} km</span>}
                    {velocity && <span className="text-[10px] text-white/30 font-mono">{Number(Number(velocity).toFixed(0)).toLocaleString()} km/h</span>}
                  </div>
                </div>
                {neo.is_potentially_hazardous_asteroid && (
                  <motion.span animate={{ opacity: [1, 0.6, 1] }} transition={{ duration: 2, repeat: Infinity }}
                    className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-[10px] text-red-400 font-mono shrink-0 ml-2">
                    HAZARDOUS
                  </motion.span>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

/* ═══ Space Weather ═══ */
function SpaceWeather() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const end = new Date().toISOString().split("T")[0];
    const start = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
    Promise.all([
      fetch(`https://api.nasa.gov/DONKI/FLR?startDate=${start}&endDate=${end}&api_key=DEMO_KEY`).then(r => r.json()).catch(() => []),
      fetch(`https://api.nasa.gov/DONKI/GST?startDate=${start}&endDate=${end}&api_key=DEMO_KEY`).then(r => r.json()).catch(() => []),
    ]).then(([flares, storms]) => {
      setData({ flares: Array.isArray(flares) ? flares : [], storms: Array.isArray(storms) ? storms : [] });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);
  if (loading) return <div className="glass-card p-6 animate-pulse"><div className="h-32 bg-white/5 rounded" /></div>;
  const flareCount = data?.flares?.length || 0;
  const stormCount = data?.storms?.length || 0;
  const latestFlare = data?.flares?.[data.flares.length - 1];
  const kpIndex = data?.storms?.[data.storms.length - 1]?.allKpIndex?.[0]?.kpIndex;
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
      <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
        <span className="text-xl">☀️</span> Space Weather
      </h3>
      <p className="text-xs text-white/40 font-mono mb-4">Solar activity — last 7 days</p>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
          <div className="text-2xl font-bold text-amber-400">{flareCount}</div>
          <div className="text-[10px] text-white/40 font-mono uppercase">Solar Flares</div>
        </div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
          <div className="text-2xl font-bold text-purple-400">{stormCount}</div>
          <div className="text-[10px] text-white/40 font-mono uppercase">Geo Storms</div>
        </div>
      </div>
      {latestFlare && (
        <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-400 font-mono font-semibold">Latest Flare: {latestFlare.classType}</span>
            <span className="text-[10px] text-white/30 font-mono">{new Date(latestFlare.beginTime).toLocaleDateString()}</span>
          </div>
        </div>
      )}
      {kpIndex !== undefined && (
        <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/10">
          <div className="flex items-center justify-between">
            <span className="text-xs text-purple-400 font-mono font-semibold">Kp Index: {kpIndex}</span>
            <span className="text-[10px] text-white/30 font-mono">{Number(kpIndex) >= 5 ? "Storm conditions" : "Quiet"}</span>
          </div>
          <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${(Number(kpIndex) / 9) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }} className="h-full rounded-full"
              style={{ background: Number(kpIndex) >= 7 ? "#ef4444" : Number(kpIndex) >= 5 ? "#f59e0b" : "#22c55e" }} />
          </div>
        </div>
      )}
      {flareCount === 0 && stormCount === 0 && (
        <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/10 text-center">
          <span className="text-xs text-green-400 font-mono">All quiet — no significant solar activity</span>
        </div>
      )}
    </motion.div>
  );
}

/* ═══ ISS Map Embed ═══ */
function ISSMap() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden">
      <div className="p-4 pb-2">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="text-xl">🗺️</span> ISS Ground Track
        </h3>
        <p className="text-xs text-white/40 font-mono mt-1">Live position on world map</p>
      </div>
      <div className="relative" style={{ height: 340 }}>
        <iframe src="https://isstracker.spaceflight.esa.int/"
          style={{ width: "100%", height: "100%", border: "none" }} title="ISS Live Tracker Map" loading="lazy" allow="fullscreen" />
        <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-[9px] text-white/40 font-mono px-2 py-1 rounded">ESA ISS Tracker</div>
      </div>
    </motion.div>
  );
}

/* ═══ Mars Rover Photos ═══ */
function MarsRoverPhotos() {
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  useEffect(() => {
    fetch("https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/latest_photos?api_key=DEMO_KEY")
      .then(r => r.json()).then(data => {
        if (data?.latest_photos) setPhotos(data.latest_photos.slice(0, 9));
        setLoading(false);
      }).catch(() => setLoading(false));
  }, []);
  if (loading) return <div className="glass-card p-6 animate-pulse"><div className="h-48 bg-white/5 rounded" /></div>;
  if (photos.length === 0) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-xl">🔴</span> Mars Rover Gallery
          </h3>
          <p className="text-xs text-white/40 font-mono mt-1">Latest from Curiosity — Sol {photos[0]?.sol}</p>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-[10px] text-red-400 font-mono">{photos[0]?.rover?.name}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {photos.map((photo, i) => (
          <motion.div key={photo.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.06 }} onClick={() => setSelectedPhoto(photo)}
            className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group">
            <img src={photo.img_src} alt={`Mars - ${photo.camera.full_name}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-1 left-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-[9px] text-white font-mono truncate">{photo.camera.name}</p>
            </div>
          </motion.div>
        ))}
      </div>
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-3xl w-full" onClick={e => e.stopPropagation()}>
              <img src={selectedPhoto.img_src} alt={selectedPhoto.camera.full_name} className="w-full rounded-xl" />
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold text-sm">{selectedPhoto.camera.full_name}</p>
                  <p className="text-white/40 text-xs font-mono">Sol {selectedPhoto.sol} — {selectedPhoto.earth_date}</p>
                </div>
                <button onClick={() => setSelectedPhoto(null)}
                  className="text-white/60 hover:text-white text-sm font-mono px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══ People in Space Right Now ═══ */
function PeopleInSpace() {
  const [people, setPeople] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("http://api.open-notify.org/astros.json")
      .then(r => r.json())
      .then(data => { setPeople(data?.people || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);
  if (loading) return <div className="glass-card p-6 animate-pulse"><div className="h-32 bg-white/5 rounded" /></div>;
  const byCraft = people.reduce((acc: Record<string, string[]>, p: any) => {
    (acc[p.craft] = acc[p.craft] || []).push(p.name);
    return acc;
  }, {});
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="text-xl">👨‍🚀</span> Humans in Space
        </h3>
        <div className="text-2xl font-bold text-cyan-400">{people.length}</div>
      </div>
      {Object.entries(byCraft).map(([craft, names]) => (
        <div key={craft} className="mb-3 last:mb-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">{craft}</span>
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-[10px] font-mono text-white/30">{(names as string[]).length} crew</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(names as string[]).map(name => (
              <span key={name} className="px-2 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[11px] text-white/60">
                {name}
              </span>
            ))}
          </div>
        </div>
      ))}
    </motion.div>
  );
}

/* ═══ Solar System Cards ═══ */
const PLANETS = [
  { name: "Mercury", dist: "0.39 AU", temp: "430°C / -180°C", icon: "🪨", color: "#94a3b8", moons: 0 },
  { name: "Venus", dist: "0.72 AU", temp: "462°C", icon: "🌕", color: "#fbbf24", moons: 0 },
  { name: "Earth", dist: "1.00 AU", temp: "15°C avg", icon: "🌍", color: "#3b82f6", moons: 1 },
  { name: "Mars", dist: "1.52 AU", temp: "-65°C avg", icon: "🔴", color: "#ef4444", moons: 2 },
  { name: "Jupiter", dist: "5.20 AU", temp: "-110°C", icon: "🟤", color: "#f59e0b", moons: 95 },
  { name: "Saturn", dist: "9.58 AU", temp: "-140°C", icon: "🪐", color: "#d4a574", moons: 146 },
  { name: "Uranus", dist: "19.2 AU", temp: "-195°C", icon: "🔵", color: "#67e8f9", moons: 28 },
  { name: "Neptune", dist: "30.1 AU", temp: "-200°C", icon: "💙", color: "#6366f1", moons: 16 },
];

function SolarSystemCards() {
  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
        <span className="text-xl">🌌</span> Solar System
      </h3>
      <p className="text-xs text-white/40 font-mono mb-5">Our cosmic neighborhood at a glance</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {PLANETS.map((p, i) => (
          <motion.div key={p.name} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }} transition={{ delay: i * 0.06, type: "spring", stiffness: 200 }}
            whileHover={{ scale: 1.03, borderColor: `${p.color}33` }}
            className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center transition-all cursor-default">
            <div className="text-2xl mb-1.5">{p.icon}</div>
            <p className="text-white font-semibold text-sm">{p.name}</p>
            <p className="text-[10px] font-mono mt-1" style={{ color: p.color }}>{p.dist}</p>
            <p className="text-[10px] text-white/30 font-mono">{p.temp}</p>
            <p className="text-[9px] text-white/20 font-mono mt-0.5">{p.moons} moon{p.moons !== 1 ? "s" : ""}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ═══ Stat Card ═══ */
function StatCard({ label, value, icon, color, sub }: { label: string; value: string; icon: string; color: string; sub?: string }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
      whileHover={{ scale: 1.02, borderColor: `${color}33` }} transition={{ type: "spring", stiffness: 200 }}
      className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center transition-all">
      <div className="text-2xl mb-2">{icon}</div>
      <p className="text-white/90 font-bold text-lg" style={{ color }}>{value}</p>
      <p className="text-white/40 text-[10px] font-mono mt-1 uppercase tracking-wider">{label}</p>
      {sub && <p className="text-white/20 text-[9px] font-mono mt-0.5">{sub}</p>}
    </motion.div>
  );
}

/* ═══ SPACE PAGE ═══ */
export default function SpacePage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <>
      <GrokStarfield />
      <div className="aurora-bg"><div className="aurora-band" /><div className="aurora-band" /></div>
      <Navbar breadcrumb={["space"]} accent="#a855f7" />

      {/* ═══ CINEMATIC HERO ═══ */}
      <div ref={heroRef} className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <OrbitRings />
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 text-center px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 1 }}>
            <div className="mb-6"><MissionClock /></div>
            <h1 className="font-bold text-5xl sm:text-6xl md:text-8xl text-white leading-[0.9] tracking-tight">
              <span className="block">SPACE</span>
              <span className="block gradient-text">&amp; BEYOND</span>
            </h1>
            <p className="mt-6 text-white/50 max-w-xl mx-auto text-lg leading-relaxed">
              Real-time launch tracking, orbital telemetry, solar weather, Mars imagery, and asteroid monitoring.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="mt-12">
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="flex flex-col items-center gap-2 text-white/30">
              <span className="text-[10px] font-mono uppercase tracking-[0.3em]">Explore</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* ═══ STATS BAR ═══ */}
      <Sec className="px-4 sm:px-6 -mt-16 relative z-20" delay={0}>
        <div className="max-w-[1400px] mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="ISS Speed" value="28,000" icon="🛰️" color="#06b6d4" sub="km/h" />
          <StatCard label="ISS Altitude" value="408" icon="📡" color="#a855f7" sub="km above Earth" />
          <StatCard label="Known NEOs" value="34,000+" icon="☄️" color="#f59e0b" sub="tracked objects" />
          <StatCard label="Mars Rovers" value="2 Active" icon="🔴" color="#ef4444" sub="Curiosity & Perseverance" />
        </div>
      </Sec>

      {/* ═══ MAIN CONTENT ═══ */}
      <main className="px-4 sm:px-6 pb-24 mt-12">
        <div className="max-w-[1400px] mx-auto space-y-10">

          {/* Launch Schedule — THE STAR */}
          <Sec delay={0.05}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-0.5 bg-gradient-to-r from-purple-400 to-transparent" />
              <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-purple-400/70">Launch Schedule</h2>
            </div>
            <LaunchSchedule />
          </Sec>

          {/* ISS Section */}
          <Sec delay={0.08}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-0.5 bg-gradient-to-r from-cyan-400 to-transparent" />
              <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-cyan-400/70">International Space Station</h2>
            </div>
            <div className="grid md:grid-cols-[1fr_1.6fr] gap-6">
              <div className="space-y-6">
                <ISSTracker />
                <PeopleInSpace />
              </div>
              <ISSMap />
            </div>
          </Sec>

          {/* NASA + Space Weather */}
          <Sec delay={0.1}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-0.5 bg-gradient-to-r from-amber-400 to-transparent" />
              <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-amber-400/70">NASA &amp; Solar Activity</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <NASAAPODCard />
              <SpaceWeather />
            </div>
          </Sec>

          {/* NEO Section */}
          <Sec delay={0.12}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-0.5 bg-gradient-to-r from-red-400 to-transparent" />
              <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-red-400/70">Asteroid Watch</h2>
            </div>
            <NEOWidget />
          </Sec>

          {/* Mars Rover Gallery */}
          <Sec delay={0.14}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-0.5 bg-gradient-to-r from-red-500 to-transparent" />
              <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-red-500/70">Mars Surface</h2>
            </div>
            <MarsRoverPhotos />
          </Sec>

          {/* Solar System */}
          <Sec delay={0.16}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-0.5 bg-gradient-to-r from-indigo-400 to-transparent" />
              <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-indigo-400/70">Our Solar System</h2>
            </div>
            <SolarSystemCards />
          </Sec>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <p className="text-white/25 text-xs font-mono">&copy; {new Date().getFullYear()} Maxwell Nixon</p>
            <span className="text-white/10">|</span>
            <p className="text-white/20 text-[10px] font-mono">Data from NASA, ESA, The Space Devs, SpaceX</p>
          </div>
          <div className="flex gap-4">
            <Link href="/" className="text-white/30 hover:text-cyan-400 transition-colors text-xs font-mono">Home</Link>
            <Link href="/news" className="text-white/30 hover:text-cyan-400 transition-colors text-xs font-mono">News</Link>
            <Link href="/weather" className="text-white/30 hover:text-cyan-400 transition-colors text-xs font-mono">Weather</Link>
            <Link href="/tools" className="text-white/30 hover:text-cyan-400 transition-colors text-xs font-mono">Tools</Link>
            <Link href="/play" className="text-white/30 hover:text-cyan-400 transition-colors text-xs font-mono">Arcade</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
