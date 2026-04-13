"use client";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GrokStarfield } from "@/components/GrokStarfield";
import { Navbar } from "@/components/Navbar";

interface ServiceStatus {
  name: string;
  category: "cloud" | "social" | "streaming" | "gaming" | "ai";
  status: "operational" | "degraded" | "outage" | "unknown";
  responseTime: number | null;
  statusMessage: string;
  url: string;
  icon: string;
  lastChecked: string;
  components?: { name: string; status: string }[];
  activeIncidents?: { name: string; impact: string; status: string; updatedAt: string }[];
}

type UptimeSegment = Exclude<ServiceStatus["status"], "unknown">;

const STATUS_COLORS = {
  operational: { dot: "#22c55e", text: "text-green-400", label: "Operational" },
  degraded: { dot: "#f59e0b", text: "text-amber-400", label: "Degraded" },
  outage: { dot: "#ef4444", text: "text-red-400", label: "Outage" },
  unknown: { dot: "#6b7280", text: "text-gray-400", label: "Unknown" },
};

const CATEGORY_ICONS = {
  cloud: "☁️",
  social: "💬",
  streaming: "🎬",
  gaming: "🎮",
  ai: "🤖",
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  cloud: "from-blue-500 to-cyan-400",
  social: "from-pink-500 to-rose-400",
  streaming: "from-purple-500 to-pink-400",
  gaming: "from-violet-500 to-purple-400",
  ai: "from-amber-500 to-orange-400",
};

const UPTIME_24H: UptimeSegment[] = [
  "operational",
  "operational",
  "degraded",
  "operational",
  "operational",
  "operational",
  "operational",
  "operational",
  "operational",
  "operational",
  "outage",
  "operational",
  "operational",
  "operational",
  "operational",
  "operational",
  "operational",
  "operational",
  "operational",
  "operational",
  "operational",
  "operational",
  "operational",
  "operational",
];

export default function StatusPage() {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshCountdown, setRefreshCountdown] = useState(90);
  const [currentTime, setCurrentTime] = useState("--:--:--");
  const [isFetching, setIsFetching] = useState(false);
  const countdownRef = useRef<NodeJS.Timeout>();
  const timeRef = useRef<NodeJS.Timeout>();

  const fetchServices = useCallback(async () => {
    setIsFetching(true);
    try {
      const res = await fetch("/api/status");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setServices(Array.isArray(data) ? data : []);
      setRefreshCountdown(90);
    } catch (error) {
      console.error("Status fetch error:", error);
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
    const interval = setInterval(fetchServices, 90000);
    return () => clearInterval(interval);
  }, [fetchServices]);

  useEffect(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setRefreshCountdown((prev) => (prev > 0 ? prev - 1 : 90));
    }, 1000);
    return () => clearInterval(countdownRef.current);
  }, []);

  useEffect(() => {
    if (timeRef.current) clearInterval(timeRef.current);
    const updateTime = () =>
      setCurrentTime(
        new Date().toLocaleTimeString("en-US", {
          hour12: false,
          timeZone: "UTC",
        })
      );
    updateTime();
    timeRef.current = setInterval(() => {
      updateTime();
    }, 1000);
    return () => clearInterval(timeRef.current);
  }, []);

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchesCategory = !selectedCategory || s.category === selectedCategory;
      const matchesSearch = !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [services, selectedCategory, searchQuery]);

  const stats = useMemo(() => {
    const total = services.length;
    const operational = services.filter((s) => s.status === "operational").length;
    const degraded = services.filter((s) => s.status === "degraded").length;
    const outages = services.filter((s) => s.status === "outage").length;
    const withRT = services.filter((s) => s.responseTime);
    const avgResponseTime = withRT.length > 0
      ? Math.round(withRT.reduce((sum, s) => sum + (s.responseTime || 0), 0) / withRT.length)
      : 0;
    const uptime = total > 0 ? Math.round((operational / total) * 100) : 100;
    return { total, operational, degraded, outages, avgResponseTime, uptime };
  }, [services]);

  const healthStatus = useMemo(() => {
    if (stats.outages > 0) return "outage";
    if (stats.degraded > 0) return "degraded";
    return "operational";
  }, [stats]);

  const allIncidents = useMemo(() => {
    return services.flatMap((s) => (s.activeIncidents || []).map((inc) => ({ ...inc, service: s.name })));
  }, [services]);

  const categories = useMemo(() => {
    return Object.keys(CATEGORY_ICONS).map((cat) => {
      const catServices = services.filter((s) => s.category === cat);
      const worstStatus = catServices.length > 0
        ? catServices.reduce((prev, curr) => {
            const order: Record<string, number> = { operational: 0, degraded: 1, outage: 2, unknown: 3 };
            return (order[curr.status] || 0) > (order[prev.status] || 0) ? curr : prev;
          }).status
        : "unknown";
      const operational = catServices.filter((s) => s.status === "operational").length;
      return { name: cat, count: catServices.length, worstStatus, operational, services: catServices };
    });
  }, [services]);

  const sortedByResponseTime = useMemo(() => {
    return [...services].filter((s) => s.responseTime).sort((a, b) => (b.responseTime || 0) - (a.responseTime || 0));
  }, [services]);

  const maxResponseTime = Math.max(...services.map((s) => s.responseTime || 0), 2000);

  const recentResponseTimes = useMemo(() => {
    return services.filter((s) => s.responseTime).slice(0, 8);
  }, [services]);

  const getUptimeRingColor = (): string => {
    if (stats.uptime > 95) return "#22c55e";
    if (stats.uptime > 85) return "#f59e0b";
    return "#ef4444";
  };

  const formatRelativeTime = (lastChecked: string): string => {
    const then = new Date(lastChecked).getTime();
    const now = Date.now();
    const diffMs = now - then;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);

    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div className="min-h-screen bg-[#020204] text-white overflow-hidden">
      <GrokStarfield />
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-7xl mx-auto">
          <div className="text-xs sm:text-sm font-mono text-cyan-400/70 mb-6">$ status_monitor --live</div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-black mb-4">
                Service <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Monitor</span>
              </h1>
              <p className="text-sm sm:text-base text-gray-300 mb-6 max-w-2xl">
                Real-time health monitoring for {stats.total}+ cloud, social, streaming, gaming, and AI services.
              </p>
                <div className="flex items-center gap-4 text-sm font-mono text-gray-400">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    UTC: {currentTime}
                  </div>
                </div>
            </div>
            {/* Uptime Ring */}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="flex justify-center lg:justify-end">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="55" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                  <motion.circle
                    cx="60"
                    cy="60"
                    r="55"
                    fill="none"
                    stroke={getUptimeRingColor()}
                    strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 55}`}
                    strokeDashoffset={`${2 * Math.PI * 55 * (1 - stats.uptime / 100)}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 55 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 55 * (1 - stats.uptime / 100) }}
                    transition={{ duration: 1.2 }}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-cyan-400">{stats.uptime}%</span>
                  <span className="text-xs text-gray-400">uptime</span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* GLOBAL HEALTH STRIP */}
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="relative z-10 px-4 sm:px-6 lg:px-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <div
            className="rounded-lg border backdrop-blur-sm px-6 py-3 flex items-center justify-between"
            style={{
              borderColor: healthStatus === "operational" ? "rgba(34, 197, 94, 0.3)" : healthStatus === "degraded" ? "rgba(245, 158, 11, 0.3)" : "rgba(239, 68, 68, 0.3)",
              backgroundColor:
                healthStatus === "operational" ? "rgba(34, 197, 94, 0.05)" : healthStatus === "degraded" ? "rgba(245, 158, 11, 0.05)" : "rgba(239, 68, 68, 0.05)",
            }}
          >
            <div className="flex items-center gap-3 flex-1">
              <motion.div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: healthStatus === "operational" ? "#22c55e" : healthStatus === "degraded" ? "#f59e0b" : "#ef4444" }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-sm font-semibold">
                {healthStatus === "operational"
                  ? "All Systems Operational"
                  : stats.outages > 0
                  ? `${stats.outages} Outage${stats.outages !== 1 ? "s" : ""} Detected`
                  : `${stats.degraded} Issue${stats.degraded !== 1 ? "s" : ""} Detected`}
              </span>
            </div>

            <div className="flex-1 px-6">
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div className="flex h-full">
                  {stats.operational > 0 && <div className="bg-green-500" style={{ width: `${(stats.operational / stats.total) * 100}%` }} />}
                  {stats.degraded > 0 && <div className="bg-amber-500" style={{ width: `${(stats.degraded / stats.total) * 100}%` }} />}
                  {stats.outages > 0 && <div className="bg-red-500" style={{ width: `${(stats.outages / stats.total) * 100}%` }} />}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span>Last scan: {refreshCountdown}s ago</span>
              <button
                onClick={fetchServices}
                disabled={isFetching}
                className="px-3 py-1.5 rounded bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 transition-colors text-xs font-semibold disabled:opacity-50"
              >
                {isFetching ? "Scanning..." : "Scan Now"}
              </button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ACTIVE INCIDENTS PANEL */}
      {allIncidents.length > 0 && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="relative z-10 px-4 sm:px-6 lg:px-8 mb-8">
          <div className="max-w-7xl mx-auto">
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 backdrop-blur-sm p-6">
              <div className="flex items-start gap-4">
                <div className="text-2xl mt-1">⚠️</div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-red-400 mb-4">Active Incidents ({allIncidents.length})</h3>
                  <div className="space-y-3">
                    {allIncidents.map((inc, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-start justify-between text-sm bg-white/5 rounded p-3">
                        <div>
                          <div className="font-semibold text-white">
                            {inc.service}: {inc.name}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">Impact: {inc.impact}</div>
                        </div>
                        <div className="text-xs text-gray-400">{formatRelativeTime(inc.updatedAt)}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {/* STATS ROW */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 mb-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: "Services Monitored", value: stats.total, icon: "☁️", color: "text-cyan-400" },
            {
              label: "Operational",
              value: stats.operational,
              icon: "✓",
              color: "text-green-400",
            },
            { label: "Avg Latency", value: `${stats.avgResponseTime}ms`, icon: "⚡", color: "text-cyan-400" },
            { label: "Issues", value: stats.outages + stats.degraded, icon: "!", color: stats.outages + stats.degraded > 0 ? "text-red-400" : "text-green-400" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.05 }}
              className="rounded-lg bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm p-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xl">{stat.icon}</span>
                <div className="text-xs text-gray-400">{stat.label}</div>
              </div>
              <div className={`text-2xl sm:text-3xl font-bold ${stat.color}`}>{stat.value}</div>
              {i === 2 && recentResponseTimes.length > 0 && (
                <div className="flex gap-1 mt-2">
                  {recentResponseTimes.map((srv, idx) => {
                    const normalized = (srv.responseTime || 0) / maxResponseTime;
                    return (
                      <div
                        key={idx}
                        className="h-1 flex-1 rounded-full"
                        style={{
                          backgroundColor:
                            normalized < 0.2 ? "#22c55e" : normalized < 0.4 ? "#06b6d4" : normalized < 0.6 ? "#f59e0b" : "#ef4444",
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* CATEGORY TABS (STICKY) */}
      <section className="relative z-20 px-4 sm:px-6 lg:px-8 mb-8 sticky top-20 backdrop-blur-sm bg-[#020204]/90 py-4 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <motion.button
              onClick={() => setSelectedCategory(null)}
              className="relative px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all bg-white/5 border border-white/10 text-gray-400 hover:border-white/20"
              style={{
                borderColor: selectedCategory === null ? "rgba(6, 182, 212, 0.6)" : undefined,
                color: selectedCategory === null ? "#06b6d4" : undefined,
              }}
            >
              All ({stats.total})
              {selectedCategory === null && <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-500" layoutId="tab-underline" />}
            </motion.button>
            {categories.map((cat) => (
              <motion.button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className="relative px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all flex items-center gap-2 bg-white/5 border border-white/10 text-gray-400 hover:border-white/20"
                style={{
                  borderColor: selectedCategory === cat.name ? "rgba(168, 85, 247, 0.6)" : undefined,
                  color: selectedCategory === cat.name ? "#c084fc" : undefined,
                }}
              >
                <span>{CATEGORY_ICONS[cat.name as keyof typeof CATEGORY_ICONS]}</span>
                <span>{cat.count}</span>
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor:
                      cat.worstStatus === "operational"
                        ? "#22c55e"
                        : cat.worstStatus === "degraded"
                        ? "#f59e0b"
                        : cat.worstStatus === "outage"
                        ? "#ef4444"
                        : "#6b7280",
                  }}
                />
                {selectedCategory === cat.name && <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500" layoutId="tab-underline" />}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* SEARCH BAR */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 mb-10">
        <div className="max-w-7xl mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-10 rounded-lg bg-white/[0.02] border border-white/[0.05] text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.04] transition-all"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-600 bg-white/5 px-2 py-1 rounded">Ctrl+F</span>
            {filteredServices.length > 0 && <span className="absolute right-16 top-1/2 -translate-y-1/2 text-xs text-gray-400">Showing {filteredServices.length} of {stats.total}</span>}
          </div>
        </div>
      </section>

      {/* LOADING STATE */}
      {loading && (
        <section className="relative z-10 px-4 sm:px-6 lg:px-8 mb-16">
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array(16).fill(0).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="rounded-lg bg-white/[0.02] border border-white/[0.05] p-4 h-40 animate-pulse"
              />
            ))}
          </div>
        </section>
      )}

      {/* SERVICE GRID */}
      {!loading && (
        <section className="relative z-10 px-4 sm:px-6 lg:px-8 mb-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <AnimatePresence>
                {filteredServices.map((service, idx) => {
                  const statusColor = STATUS_COLORS[service.status];
                  const responseTimeRatio = service.responseTime ? Math.min((service.responseTime / maxResponseTime) * 100, 100) : 0;
                  const responseTimeColor =
                    !service.responseTime ? "#6b7280" : service.responseTime < 200 ? "#22c55e" : service.responseTime < 400 ? "#06b6d4" : service.responseTime < 800 ? "#f59e0b" : "#ef4444";
                  const hasIncidents = (service.activeIncidents || []).length > 0;

                  return (
                    <motion.a
                      key={service.name}
                      href={service.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: 0.5 + idx * 0.02, duration: 0.5 }}
                      whileHover={{ y: -8 }}
                      className="rounded-lg bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm p-4 transition-all cursor-pointer group hover:border-cyan-500/50"
                      style={{ borderLeftColor: statusColor.dot, borderLeftWidth: "4px" }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="relative">
                          <div
                            className="text-3xl filter drop-shadow-lg"
                            style={{
                              filter: `drop-shadow(0 0 12px ${statusColor.dot}50)`,
                            }}
                          >
                            {service.icon}
                          </div>
                          {hasIncidents && <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">!</div>}
                        </div>
                        <div
                          className="px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{
                            backgroundColor: `${statusColor.dot}20`,
                            border: `1px solid ${statusColor.dot}40`,
                            color: statusColor.dot,
                          }}
                        >
                          {statusColor.label}
                        </div>
                      </div>

                      <div className="mb-3">
                        <h3 className="font-bold text-white text-sm">{service.name}</h3>
                        <div className="text-xs text-gray-500">
                          {CATEGORY_ICONS[service.category as keyof typeof CATEGORY_ICONS]} {service.category}
                        </div>
                      </div>

                      {service.responseTime !== null && (
                        <div className="mb-3">
                          <div className="flex justify-between items-baseline mb-1">
                            <span className="text-2xl font-bold" style={{ color: responseTimeColor }}>
                              {service.responseTime}ms
                            </span>
                          </div>
                          <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                            <motion.div
                              className="h-full"
                              style={{ backgroundColor: responseTimeColor }}
                              initial={{ width: 0 }}
                              animate={{ width: `${responseTimeRatio}%` }}
                              transition={{ duration: 0.8 }}
                            />
                          </div>
                        </div>
                      )}

                      {(service.components || []).length > 0 && (
                        <div className="flex gap-1 mb-3">
                          {service.components?.map((comp, i) => (
                            <div
                              key={i}
                              className="w-2 h-2 rounded-full"
                              style={{
                                backgroundColor:
                                  comp.status === "operational"
                                    ? "#22c55e"
                                    : comp.status === "degraded"
                                    ? "#f59e0b"
                                    : comp.status === "outage"
                                    ? "#ef4444"
                                    : "#6b7280",
                              }}
                              title={comp.name}
                            />
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-white/5">
                        <span className="text-xs text-gray-500">
                          Checked {formatRelativeTime(service.lastChecked)}
                        </span>
                        <span className="text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold">Visit ↗</span>
                      </div>
                    </motion.a>
                  );
                })}
              </AnimatePresence>
            </div>
            {filteredServices.length === 0 && !loading && (
              <div className="text-center py-16">
                <p className="text-gray-400 text-sm">
                  {searchQuery
                    ? "No services match your search."
                    : "Live status data is temporarily unavailable. Try refreshing in a moment."}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* RESPONSE TIME DISTRIBUTION (RACE LEADERBOARD) */}
      {!loading && sortedByResponseTime.length > 0 && (
        <section className="relative z-10 px-4 sm:px-6 lg:px-8 mb-16">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-xl font-bold mb-6 text-white">Response Time Distribution</h2>
            <div className="rounded-lg bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm p-6 space-y-3">
              {sortedByResponseTime.map((service, idx) => {
                const ratio = (service.responseTime || 0) / maxResponseTime;
                const rtColor =
                  (service.responseTime || 0) < 200 ? "#22c55e" : (service.responseTime || 0) < 400 ? "#06b6d4" : (service.responseTime || 0) < 800 ? "#f59e0b" : "#ef4444";

                return (
                  <motion.div
                    key={service.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + idx * 0.02 }}
                    className="flex items-center gap-3"
                  >
                    <span className="text-lg">{service.icon}</span>
                    <span className="text-xs font-mono text-gray-500 w-20">{service.name}</span>
                    <div className="flex-1 h-6 rounded bg-white/5 overflow-hidden relative">
                      <motion.div
                        className="h-full"
                        style={{ backgroundColor: rtColor }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(ratio * 100, 5)}%` }}
                        transition={{ duration: 0.8, delay: 0.6 + idx * 0.02 }}
                      />
                      {idx === 0 && (
                        <div className="absolute top-0 bottom-0" style={{ left: "50%" }}>
                          <div className="h-full border-l border-dashed border-gray-600" />
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-mono font-bold w-16 text-right" style={{ color: rtColor }}>
                      {service.responseTime}ms
                    </span>
                  </motion.div>
                );
              })}
              {services.filter((s) => !s.responseTime).length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 pt-4 border-t border-white/5">
                  <span className="text-sm text-gray-500">
                    {services.filter((s) => !s.responseTime).length} service(s) with no response time data
                  </span>
                </motion.div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* CATEGORY HEALTH CARDS */}
      {!loading && (
        <section className="relative z-10 px-4 sm:px-6 lg:px-8 mb-16">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-xl font-bold mb-6 text-white">Category Health</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {categories.map((cat, catIdx) => {
                const percentage = cat.count > 0 ? Math.round((cat.operational / cat.count) * 100) : 0;
                const gradient = CATEGORY_GRADIENTS[cat.name as keyof typeof CATEGORY_GRADIENTS];

                return (
                  <motion.div
                    key={cat.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + catIdx * 0.05 }}
                    className="rounded-lg bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm p-5"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl">{CATEGORY_ICONS[cat.name as keyof typeof CATEGORY_ICONS]}</span>
                      <div>
                        <h3 className="font-semibold text-white text-sm capitalize">{cat.name}</h3>
                        <p className="text-xs text-gray-500">{cat.count} services</p>
                      </div>
                    </div>

                    <div className="flex justify-center mb-4 h-28">
                      <div className="relative w-24 h-24">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                          <motion.circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke={`url(#grad${catIdx})`}
                            strokeWidth="6"
                            strokeDasharray={`${2 * Math.PI * 40}`}
                            strokeDashoffset={`${2 * Math.PI * 40 * (1 - percentage / 100)}`}
                            initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                            animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - percentage / 100) }}
                            transition={{ duration: 1.2 }}
                            strokeLinecap="round"
                          />
                          <defs>
                            <linearGradient id={`grad${catIdx}`} x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor={gradient.startsWith("from-blue") ? "#3b82f6" : gradient.startsWith("from-pink") ? "#ec4899" : gradient.startsWith("from-violet") ? "#7c3aed" : "#f59e0b"} />
                              <stop offset="100%" stopColor={gradient.includes("cyan") ? "#06b6d4" : gradient.includes("rose") ? "#f43f5e" : gradient.includes("pink") ? "#ec4899" : "#d97706"} />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold text-cyan-400">{percentage}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-gray-400 text-center mb-3">
                      {cat.operational}/{cat.count} operational
                    </div>

                    <div className="flex gap-1 flex-wrap justify-center">
                      {cat.services.slice(0, 5).map((svc, idx) => (
                        <div
                          key={idx}
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor:
                              svc.status === "operational"
                                ? "#22c55e"
                                : svc.status === "degraded"
                                ? "#f59e0b"
                                : svc.status === "outage"
                                ? "#ef4444"
                                : "#6b7280",
                          }}
                          title={svc.name}
                        />
                      ))}
                      {cat.count > 5 && <span className="text-xs text-gray-600">+{cat.count - 5}</span>}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 24H UPTIME SIMULATION */}
      {!loading && (
        <section className="relative z-10 px-4 sm:px-6 lg:px-8 mb-16">
          <div className="max-w-7xl mx-auto">
            <div className="rounded-lg bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white">24h Uptime</h2>
                  <p className="text-xs text-gray-500">(Simulated - illustrative only)</p>
                </div>
                <span className="text-xs text-gray-600">ℹ️</span>
              </div>
              <div className="flex gap-0.5">
                {UPTIME_24H.map((status, idx) => {
                  const color =
                    status === "operational" ? "#22c55e" : status === "degraded" ? "#f59e0b" : "#ef4444";
                  return (
                    <motion.div
                      key={idx}
                      className="flex-1 h-16 rounded cursor-pointer hover:brightness-125 transition-all"
                      style={{ backgroundColor: color }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 + idx * 0.02 }}
                      title={`${String(idx).padStart(2, "0")}:00 - ${String(idx).padStart(2, "0")}:59 · ${status}`}
                    />
                  );
                })}
              </div>
              <div
                className="mt-4 grid gap-px text-xs text-gray-600 text-center"
                style={{ gridTemplateColumns: "repeat(24, minmax(0, 1fr))" }}
              >
                {Array(24).fill(0).map((_, i) => (
                  <div key={i}>{String(i).padStart(2, "0")}</div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* AUTO-REFRESH WIDGET */}
      <motion.div
        className="fixed bottom-6 right-6 z-50 rounded-full bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-12 h-12">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 50 50">
              <circle cx="25" cy="25" r="20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
              <motion.circle
                cx="25"
                cy="25"
                r="20"
                fill="none"
                stroke="url(#autoRefreshGrad)"
                strokeWidth="2"
                strokeDasharray={`${2 * Math.PI * 20}`}
                strokeDashoffset={`${2 * Math.PI * 20 * (1 - refreshCountdown / 90)}`}
                animate={{
                  strokeDashoffset: 2 * Math.PI * 20 * (1 - refreshCountdown / 90),
                }}
                transition={{ duration: 0.1 }}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="autoRefreshGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-cyan-400">{refreshCountdown}</span>
            </div>
          </div>
          <button
            onClick={fetchServices}
            disabled={isFetching}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors disabled:opacity-50"
          >
            {isFetching ? "Scanning..." : "Refresh"}
          </button>
          {isFetching && (
            <motion.div
              className="w-2 h-2 rounded-full bg-cyan-400"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </div>
      </motion.div>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/[0.05] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-xs text-gray-500">
          <p>Network Operations Center Status Dashboard — Real-time monitoring of global services</p>
        </div>
      </footer>
    </div>
  );
}
