"use client";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Link from "next/link";
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
}

const STATUS_COLORS = {
  operational: { bg: "bg-green-500/20", border: "border-green-500/40", dot: "bg-green-500", text: "text-green-400", label: "Operational" },
  degraded: { bg: "bg-amber-500/20", border: "border-amber-500/40", dot: "bg-amber-500", text: "text-amber-400", label: "Degraded" },
  outage: { bg: "bg-red-500/20", border: "border-red-500/40", dot: "bg-red-500", text: "text-red-400", label: "Outage" },
  unknown: { bg: "bg-gray-500/20", border: "border-gray-500/40", dot: "bg-gray-500", text: "text-gray-400", label: "Unknown" },
};

const CATEGORY_ICONS = {
  cloud: "☁️",
  social: "💬",
  streaming: "🎬",
  gaming: "🎮",
  ai: "🤖",
};

export default function StatusPage() {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshCountdown, setRefreshCountdown] = useState(90);
  const countdownRef = useRef<NodeJS.Timeout>();

  const fetchServices = useCallback(async () => {
    try {
      const res = await fetch("/api/status");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setServices(data);
      setRefreshCountdown(90);
    } catch (error) {
      console.error("Status fetch error:", error);
    } finally {
      setLoading(false);
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
    return { total, operational, degraded, outages, avgResponseTime };
  }, [services]);

  const healthStatus = useMemo(() => {
    if (stats.outages > 0) return "outage";
    if (stats.degraded > 0) return "degraded";
    return "operational";
  }, [stats]);

  const categories = useMemo(() => {
    return Object.keys(CATEGORY_ICONS).map((cat) => {
      const catServices = services.filter((s) => s.category === cat);
      const worstStatus = catServices.length > 0
        ? catServices.reduce((prev, curr) => {
            const order: Record<string, number> = { operational: 0, degraded: 1, outage: 2, unknown: 3 };
            return (order[curr.status] || 0) > (order[prev.status] || 0) ? curr : prev;
          }).status
        : "unknown";
      return { name: cat, count: catServices.length, worstStatus };
    });
  }, [services]);

  const topFastest = useMemo(
    () => [...services].filter((s) => s.responseTime).sort((a, b) => (a.responseTime || 0) - (b.responseTime || 0)).slice(0, 5),
    [services]
  );

  const topSlowest = useMemo(
    () => [...services].filter((s) => s.responseTime).sort((a, b) => (b.responseTime || 0) - (a.responseTime || 0)).slice(0, 5),
    [services]
  );

  const maxResponseTime = Math.max(...services.map((s) => s.responseTime || 0), 2000);

  return (
    <div className="min-h-screen bg-[#020204] text-white overflow-hidden">
      <GrokStarfield />
      <Navbar />

      {/* Hero Section */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-6xl mx-auto">
          <div className="text-xs sm:text-sm font-mono text-cyan-400/70 mb-6">$ service_monitor --check-all</div>
          <div className="mb-6">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-2">
              Service <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">Status</span>
            </h1>
          </div>
          <p className="text-sm sm:text-base text-gray-300 mb-4 max-w-2xl">Real-time monitoring of {stats.total}+ services. Auto-refreshes every 90 seconds.</p>
          <div className="flex flex-wrap gap-3">
            <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-gray-300">
              {stats.total} Services
            </div>
            <div className="px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-xs font-mono text-green-400">
              {stats.operational} Operational
            </div>
            <div className={`px-3 py-1.5 rounded-full text-xs font-mono ${stats.outages > 0 ? "bg-red-500/10 border border-red-500/30 text-red-400" : "bg-gray-500/10 border border-gray-500/30 text-gray-400"}`}>
              {stats.outages + stats.degraded} Issues
            </div>
          </div>
        </motion.div>
      </section>

      {/* Global Health Banner */}
      <motion.section className={`relative z-10 px-4 sm:px-6 lg:px-8 mb-12`}>
        <div className={`max-w-6xl mx-auto rounded-lg overflow-hidden border ${
          healthStatus === "operational"
            ? "border-green-500/40 bg-green-500/5"
            : healthStatus === "degraded"
            ? "border-amber-500/40 bg-amber-500/5"
            : "border-red-500/40 bg-red-500/5"
        }`}>
          <div className="px-4 sm:px-6 py-4">
            <div className="flex items-center gap-3 mb-3">
              {healthStatus === "operational" ? (
                <>
                  <motion.div className="w-3 h-3 rounded-full bg-green-500" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                  <span className="text-base sm:text-lg font-semibold text-green-400">All Systems Operational ✓</span>
                </>
              ) : healthStatus === "degraded" ? (
                <>
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-base sm:text-lg font-semibold text-amber-400">Some Services Experiencing Issues</span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-base sm:text-lg font-semibold text-red-400">Service Outages Detected ⚠</span>
                </>
              )}
            </div>
            <div className="text-xs sm:text-sm text-gray-300 mb-3">
              {stats.operational}/{stats.total} operational {stats.degraded > 0 && `· ${stats.degraded} degraded`} {stats.outages > 0 && `· ${stats.outages} outages`}
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div className="flex h-full">
                <div className="bg-green-500" style={{ width: `${(stats.operational / stats.total) * 100}%` }} />
                {stats.degraded > 0 && <div className="bg-amber-500" style={{ width: `${(stats.degraded / stats.total) * 100}%` }} />}
                {stats.outages > 0 && <div className="bg-red-500" style={{ width: `${(stats.outages / stats.total) * 100}%` }} />}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Quick Stats */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 mb-12">
        <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: "Total Services", value: stats.total, color: "text-cyan-400" },
            { label: "Operational", value: stats.operational, color: "text-green-400" },
            { label: "Avg Response Time", value: `${stats.avgResponseTime}ms`, color: "text-cyan-400" },
            { label: "Issues", value: stats.outages + stats.degraded, color: stats.outages + stats.degraded > 0 ? "text-red-400" : "text-green-400" },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="rounded-lg bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm p-3 sm:p-4">
              <div className="text-xs text-gray-400 mb-2">{stat.label}</div>
              <div className={`text-2xl sm:text-3xl font-bold ${stat.color}`}>{stat.value}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Category Filter */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 mb-8 sticky top-20 backdrop-blur-sm bg-[#020204]/80 py-4 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <motion.button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
                selectedCategory === null
                  ? "bg-cyan-500/30 border border-cyan-500/60 text-cyan-300"
                  : "bg-white/5 border border-white/10 text-gray-400 hover:border-white/20"
              }`}
            >
              All ({stats.total})
            </motion.button>
            {categories.map((cat) => (
              <motion.button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
                  selectedCategory === cat.name
                    ? "bg-purple-500/30 border border-purple-500/60 text-purple-300"
                    : "bg-white/5 border border-white/10 text-gray-400 hover:border-white/20"
                }`}
              >
                <span>{CATEGORY_ICONS[cat.name as keyof typeof CATEGORY_ICONS]}</span>
                <span>{cat.count}</span>
                <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[cat.worstStatus].dot}`} />
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 mb-10">
        <div className="max-w-6xl mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/[0.02] border border-white/[0.05] text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.04] transition-all"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
          </div>
        </div>
      </section>

      {/* Loading State */}
      {loading && (
        <section className="relative z-10 px-4 sm:px-6 lg:px-8 mb-16">
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(12).fill(0).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="rounded-lg bg-white/[0.02] border border-white/[0.05] p-4 h-32 animate-pulse"
              />
            ))}
          </div>
        </section>
      )}

      {/* Service Grid */}
      {!loading && (
        <section className="relative z-10 px-4 sm:px-6 lg:px-8 mb-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {filteredServices.map((service, idx) => {
                  const statusColor = STATUS_COLORS[service.status];
                  const responseTimeRatio = service.responseTime ? Math.min((service.responseTime / maxResponseTime) * 100, 100) : 0;
                  const responseTimeColor = !service.responseTime
                    ? "bg-gray-500"
                    : service.responseTime < 300
                    ? "bg-green-500"
                    : service.responseTime < 600
                    ? "bg-cyan-500"
                    : service.responseTime < 1000
                    ? "bg-amber-500"
                    : "bg-red-500";

                  return (
                    <motion.a
                      key={service.name}
                      href={service.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: idx * 0.03, duration: 0.5 }}
                      whileHover={{ y: -8, borderColor: "rgba(6, 182, 212, 0.8)" }}
                      className={`rounded-lg bg-white/[0.02] border-l-4 ${statusColor.border} border-t border-r border-b border-white/[0.05] backdrop-blur-sm p-4 transition-all cursor-pointer group`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`text-2xl filter group-hover:drop-shadow-[0_0_8px_${statusColor.dot}]`}>{service.icon}</div>
                          <div>
                            <h3 className="font-semibold text-white text-sm md:text-base">{service.name}</h3>
                            <div className="text-xs text-gray-500">{CATEGORY_ICONS[service.category as keyof typeof CATEGORY_ICONS]} {service.category}</div>
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-mono ${statusColor.bg} border ${statusColor.border} ${statusColor.text}`}>
                          {statusColor.label}
                        </div>
                      </div>

                      {service.responseTime !== null && (
                        <div className="mb-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-400">Response Time</span>
                            <span className={`text-xs font-mono ${responseTimeColor}`}>{service.responseTime}ms</span>
                          </div>
                          <div className="h-1.5 rounded bg-white/5 overflow-hidden">
                            <motion.div className={`h-full ${responseTimeColor}`} initial={{ width: 0 }} animate={{ width: `${responseTimeRatio}%` }} transition={{ duration: 0.8 }} />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Last checked {service.lastChecked}</span>
                        <span className="text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold">Visit ↗</span>
                      </div>
                    </motion.a>
                  );
                })}
              </AnimatePresence>
            </div>
            {filteredServices.length === 0 && !loading && (
              <div className="text-center py-16">
                <p className="text-gray-400 text-sm">No services match your search</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Response Time Leaderboard */}
      {!loading && (topFastest.length > 0 || topSlowest.length > 0) && (
        <section className="relative z-10 px-4 sm:px-6 lg:px-8 mb-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-white">Response Time Leaderboard</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Fastest */}
              <div className="rounded-lg bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm p-6">
                <h3 className="text-lg font-semibold mb-4 text-green-400">⚡ Fastest Services</h3>
                <div className="space-y-3">
                  {topFastest.map((service, idx) => (
                    <motion.div
                      key={service.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <span className="text-xs font-mono text-gray-500 w-6">{idx + 1}</span>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-white">{service.name}</span>
                          <span className="text-xs font-mono text-green-400">{service.responseTime}ms</span>
                        </div>
                        <div className="h-1 rounded bg-white/5">
                          <motion.div
                            className="h-full bg-green-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${((service.responseTime || 0) / 500) * 100}%` }}
                            transition={{ duration: 0.8, delay: idx * 0.1 }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Slowest */}
              <div className="rounded-lg bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm p-6">
                <h3 className="text-lg font-semibold mb-4 text-amber-400">🐢 Slowest Services</h3>
                <div className="space-y-3">
                  {topSlowest.map((service, idx) => (
                    <motion.div
                      key={service.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <span className="text-xs font-mono text-gray-500 w-6">{idx + 1}</span>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-white">{service.name}</span>
                          <span className="text-xs font-mono text-amber-400">{service.responseTime}ms</span>
                        </div>
                        <div className="h-1 rounded bg-white/5">
                          <motion.div
                            className="h-full bg-amber-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${((service.responseTime || 0) / maxResponseTime) * 100}%` }}
                            transition={{ duration: 0.8, delay: idx * 0.1 }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Category Breakdown */}
      {!loading && (
        <section className="relative z-10 px-4 sm:px-6 lg:px-8 mb-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-white">Category Breakdown</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {categories.map((cat) => {
                const catServices = services.filter((s) => s.category === cat.name);
                const operational = catServices.filter((s) => s.status === "operational").length;
                const percentage = Math.round((operational / catServices.length) * 100) || 0;

                return (
                  <motion.div
                    key={cat.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm p-4"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl">{CATEGORY_ICONS[cat.name as keyof typeof CATEGORY_ICONS]}</span>
                      <div>
                        <h3 className="font-semibold text-white text-sm capitalize">{cat.name}</h3>
                        <p className="text-xs text-gray-500">{cat.count} services</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-center mb-4 h-24">
                      <div className="relative w-20 h-20">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                          <motion.circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="url(#grad)"
                            strokeWidth="8"
                            strokeDasharray={`${2 * Math.PI * 40}`}
                            strokeDashoffset={`${2 * Math.PI * 40 * (1 - percentage / 100)}`}
                            initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                            animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - percentage / 100) }}
                            transition={{ duration: 1 }}
                            strokeLinecap="round"
                          />
                          <defs>
                            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#06b6d4" />
                              <stop offset="100%" stopColor="#a855f7" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg font-bold text-cyan-400">{percentage}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-gray-400 text-center">
                      {operational}/{cat.count} operational
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Auto-Refresh Indicator */}
      <motion.div
        className="fixed bottom-6 right-6 z-50 flex items-center gap-4 rounded-full bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm px-4 py-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8">
            <svg className="w-full h-full" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="14" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
              <motion.circle
                cx="16"
                cy="16"
                r="14"
                fill="none"
                stroke="url(#grad2)"
                strokeWidth="2"
                strokeDasharray="88"
                strokeDashoffset={`${88 * (1 - refreshCountdown / 90)}`}
                strokeLinecap="round"
              />
              <text x="16" y="20" textAnchor="middle" className="text-xs font-bold fill-cyan-400">
                {refreshCountdown}
              </text>
              <defs>
                <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <button
            onClick={fetchServices}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Refresh
          </button>
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.05] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center text-xs text-gray-500">
          <p>Service Status Monitoring Dashboard — Real-time insights powered by Maxwell Nixon</p>
        </div>
      </footer>
    </div>
  );
}
