"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  dayHigh: number;
  dayLow: number;
  icon: string;
  live: boolean;
}

const META: Record<string, { name: string; icon: string }> = {
  AAPL: { name: "Apple", icon: "🍎" },
  MSFT: { name: "Microsoft", icon: "🪟" },
  GOOGL: { name: "Alphabet", icon: "🔍" },
  AMZN: { name: "Amazon", icon: "📦" },
  NVDA: { name: "NVIDIA", icon: "🟢" },
  TSLA: { name: "Tesla", icon: "⚡" },
  META: { name: "Meta", icon: "🌐" },
};

function MiniSparkline({ positive, seed }: { positive: boolean; seed: number }) {
  const points = Array.from({ length: 20 }, (_, i) => {
    const base = 50 + (positive ? 1 : -1) * (i / 20) * 30;
    const noise = Math.sin(seed * 100 + i * 0.8) * 12 + Math.cos(seed * 50 + i * 1.3) * 8;
    return Math.max(5, Math.min(95, base + noise));
  });
  const path = points.map((y, i) => `${(i / 19) * 100},${100 - y}`).join(" ");
  const color = positive ? "#4ade80" : "#f87171";
  return (
    <svg viewBox="0 0 100 100" className="w-16 h-8 opacity-60" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sg-${seed}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={path} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      <polygon points={`0,100 ${path} 100,100`} fill={`url(#sg-${seed})`} />
    </svg>
  );
}

function AnimatedPrice({ value, prev }: { value: number; prev: number }) {
  const changed = value !== prev && prev > 0;
  const up = value > prev;
  return (
    <motion.span
      key={value}
      initial={changed ? { color: up ? "#4ade80" : "#f87171", scale: 1.05 } : {}}
      animate={{ color: "#ffffff", scale: 1 }}
      transition={{ duration: 1.5 }}
      className="text-white font-mono font-semibold text-sm tabular-nums"
    >
      ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </motion.span>
  );
}

export function StockTicker() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [prevPrices, setPrevPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchStocks = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch("/api/stocks", { signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const mapped: StockData[] = data.map((s: any) => ({
            symbol: String(s.symbol || ""),
            name: META[String(s.symbol)]?.name || String(s.name || s.symbol || ""),
            price: parseFloat(String(s.price || s.regularMarketPrice || 0)),
            change: parseFloat(String(s.change || s.regularMarketChange || 0)),
            changePercent: parseFloat(String(s.changesPercentage || s.regularMarketChangePercent || 0)),
            dayHigh: parseFloat(String(s.dayHigh || s.regularMarketDayHigh || 0)),
            dayLow: parseFloat(String(s.dayLow || s.regularMarketDayLow || 0)),
            icon: META[String(s.symbol)]?.icon || "📊",
            live: true,
          }));
          const valid = mapped.filter((s) => s.price > 0);
          if (valid.length > 0) {
            setPrevPrices((prev) => {
              const next: Record<string, number> = { ...prev };
              stocks.forEach((s) => { next[s.symbol] = s.price; });
              return next;
            });
            setStocks(valid);
            setIsLive(true);
            setLastUpdated(
              new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
            );
            setLoading(false);
            return;
          }
        }
      }
    } catch {
      /* continue */
    }

    // Fallback
    if (stocks.length === 0) {
      setStocks(
        Object.entries(META).map(([symbol, m]) => ({
          symbol,
          name: m.name,
          price: 0,
          change: 0,
          changePercent: 0,
          dayHigh: 0,
          dayLow: 0,
          icon: m.icon,
          live: false,
        }))
      );
      setIsLive(false);
      setLoading(false);
    }
  }, [stocks]);

  useEffect(() => {
    fetchStocks();
    const interval = setInterval(fetchStocks, 60_000); // every 60s
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="glass-card p-6">
        <h3 className="text-lg font-bold text-white mb-4">📊 Live Stocks</h3>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
                <div className="space-y-1">
                  <div className="w-20 h-4 bg-white/5 rounded animate-pulse" />
                  <div className="w-12 h-3 bg-white/5 rounded animate-pulse" />
                </div>
              </div>
              <div className="w-16 h-8 bg-white/5 rounded animate-pulse" />
              <div className="space-y-1 text-right">
                <div className="w-20 h-4 bg-white/5 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!isLive) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">📊 Watchlist</h3>
          <span className="text-[10px] text-white/25 font-mono px-2 py-0.5 rounded-full border border-white/10">
            Offline
          </span>
        </div>
        <div className="space-y-2">
          {stocks.map((stock, i) => (
            <motion.div
              key={stock.symbol}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0 px-2 -mx-2"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-lg">
                  {stock.icon}
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">{stock.name}</div>
                  <div className="text-[11px] text-white/40 font-mono">{stock.symbol}</div>
                </div>
              </div>
              <div className="text-xs text-white/30 font-mono">Waiting for data...</div>
            </motion.div>
          ))}
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={fetchStocks}
          className="mt-3 w-full py-2 rounded-lg bg-white/5 text-xs font-mono text-white/50 hover:bg-white/10 transition-colors"
        >
          Retry
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">📊 Live Stocks</h3>
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-green-400"
          />
          <span className="text-[10px] text-white/30 font-mono">{lastUpdated}</span>
        </div>
      </div>

      <div className="space-y-1">
        <AnimatePresence>
          {stocks.map((stock, i) => {
            const pos = stock.changePercent >= 0;
            const isExpanded = expanded === stock.symbol;
            return (
              <motion.div
                key={stock.symbol}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <div
                  onClick={() => setExpanded(isExpanded ? null : stock.symbol)}
                  className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0 group hover:bg-white/[0.02] rounded-lg px-2 -mx-2 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                      {stock.icon}
                    </div>
                    <div>
                      <div className="text-white font-semibold text-sm group-hover:text-cyan-400 transition-colors">
                        {stock.name}
                      </div>
                      <div className="text-[11px] text-white/40 font-mono">{stock.symbol}</div>
                    </div>
                  </div>
                  <MiniSparkline positive={pos} seed={i + stock.price} />
                  <div className="text-right">
                    <AnimatedPrice value={stock.price} prev={prevPrices[stock.symbol] || 0} />
                    <div className={`text-xs font-mono flex items-center justify-end gap-1 ${pos ? "text-green-400" : "text-red-400"}`}>
                      <span>{pos ? "▲" : "▼"}</span>
                      <span>${Math.abs(stock.change).toFixed(2)}</span>
                      <span>({Math.abs(stock.changePercent).toFixed(2)}%)</span>
                    </div>
                  </div>
                </div>

                {/* Expanded details */}
                <AnimatePresence>
                  {isExpanded && (stock.dayHigh > 0 || stock.dayLow > 0) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-2 pb-3 pt-1">
                        <div className="grid grid-cols-2 gap-2">
                          {stock.dayHigh > 0 && (
                            <div className="bg-white/[0.03] rounded-lg p-2 text-center">
                              <div className="text-[10px] text-white/40 font-mono">Day High</div>
                              <div className="text-sm text-green-400 font-mono font-semibold">
                                ${stock.dayHigh.toFixed(2)}
                              </div>
                            </div>
                          )}
                          {stock.dayLow > 0 && (
                            <div className="bg-white/[0.03] rounded-lg p-2 text-center">
                              <div className="text-[10px] text-white/40 font-mono">Day Low</div>
                              <div className="text-sm text-red-400 font-mono font-semibold">
                                ${stock.dayLow.toFixed(2)}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
        <span className="text-[10px] text-white/25 font-mono">Updates every 60s</span>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={fetchStocks}
          className="text-[10px] text-cyan-400/50 hover:text-cyan-400 font-mono transition-colors"
        >
          Refresh
        </motion.button>
      </div>
    </motion.div>
  );
}
