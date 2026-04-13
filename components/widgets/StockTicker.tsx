"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

import type { StockApiQuote } from "@/lib/types";

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  dayHigh: number;
  dayLow: number;
  previousClose: number;
  sparkline: number[];
  icon: string;
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

/* ── Sparkline from real close data ── */
function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * 100},${100 - ((v - min) / range) * 80 - 10}`)
    .join(" ");
  const color = positive ? "#4ade80" : "#f87171";
  return (
    <svg viewBox="0 0 100 100" className="w-16 h-8 opacity-70" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`spk-${data[0]}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      <polygon points={`0,100 ${points} 100,100`} fill={`url(#spk-${data[0]})`} />
    </svg>
  );
}

/* ── Price with flash animation ── */
function Price({ value, prev }: { value: number; prev: number }) {
  const changed = prev > 0 && value !== prev;
  return (
    <motion.span
      key={value}
      initial={changed ? { color: value > prev ? "#4ade80" : "#f87171", scale: 1.06 } : {}}
      animate={{ color: "#ffffff", scale: 1 }}
      transition={{ duration: 1.2 }}
      className="font-mono font-semibold text-sm tabular-nums"
    >
      ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </motion.span>
  );
}

export function StockTicker() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [prevPrices, setPrevPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const stocksRef = useRef<StockData[]>([]);

  const fetchStocks = useCallback(async () => {
    try {
      const res = await fetch("/api/stocks", { signal: AbortSignal.timeout(12000) });
      if (!res.ok) throw new Error("fetch failed");
      const data = (await res.json()) as StockApiQuote[];
      if (!Array.isArray(data) || data.length === 0) throw new Error("empty");

      const mapped: StockData[] = data
        .filter((s) => s.price > 0)
        .map((s) => ({
          symbol: String(s.symbol),
          name: META[String(s.symbol)]?.name || String(s.name || s.symbol),
          price: +s.price,
          change: +s.change,
          changePercent: +s.changePercent,
          dayHigh: +(s.dayHigh ?? 0),
          dayLow: +(s.dayLow ?? 0),
          previousClose: +(s.previousClose ?? 0),
          sparkline: Array.isArray(s.sparkline) ? s.sparkline : [],
          icon: META[String(s.symbol)]?.icon || "📊",
        }));

      if (mapped.length > 0) {
        setPrevPrices((prev) => {
          const next = { ...prev };
          stocksRef.current.forEach((stock) => {
            next[stock.symbol] = stock.price;
          });
          return next;
        });
        stocksRef.current = mapped;
        setStocks(mapped);
        setError(false);
        setLastUpdated(
          new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
        );
      }
    } catch {
      if (stocks.length === 0) setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStocks();
    const iv = setInterval(fetchStocks, 60_000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Loading skeleton ── */
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
              <div className="w-20 h-4 bg-white/5 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Error / empty state ── */
  if (error || stocks.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">📊 Stocks</h3>
          <span className="text-[10px] text-white/25 font-mono px-2 py-0.5 rounded-full border border-white/10">
            Offline
          </span>
        </div>
        <p className="text-xs text-white/40 font-mono mb-4">Market data temporarily unavailable.</p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={fetchStocks}
          className="w-full py-2 rounded-lg bg-white/5 text-xs font-mono text-white/50 hover:bg-white/10 transition-colors"
        >
          Retry
        </motion.button>
      </motion.div>
    );
  }

  /* ── Live ticker ── */
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">📊 Live Stocks</h3>
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
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
            const isOpen = expanded === stock.symbol;
            return (
              <motion.div
                key={stock.symbol}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                {/* Main row */}
                <div
                  onClick={() => setExpanded(isOpen ? null : stock.symbol)}
                  className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0 group hover:bg-white/[0.02] rounded-lg px-2 -mx-2 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform">
                      {stock.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-white font-semibold text-sm group-hover:text-cyan-400 transition-colors truncate">
                        {stock.name}
                      </div>
                      <div className="text-[11px] text-white/40 font-mono">{stock.symbol}</div>
                    </div>
                  </div>

                  <Sparkline
                    data={stock.sparkline.length >= 2 ? stock.sparkline : [stock.previousClose || stock.price * 0.99, stock.price]}
                    positive={pos}
                  />

                  <div className="text-right shrink-0 ml-2">
                    <Price value={stock.price} prev={prevPrices[stock.symbol] || 0} />
                    <div
                      className={`text-xs font-mono flex items-center justify-end gap-0.5 ${
                        pos ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      <span>{pos ? "▲" : "▼"}</span>
                      <span>{Math.abs(stock.changePercent).toFixed(2)}%</span>
                    </div>
                  </div>
                </div>

                {/* Expanded detail */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-2 pb-3 pt-1 grid grid-cols-3 gap-2">
                        {[
                          ["Prev Close", stock.previousClose],
                          ["Day High", stock.dayHigh],
                          ["Day Low", stock.dayLow],
                        ]
                          .filter(([, v]) => (v as number) > 0)
                          .map(([label, val]) => (
                            <div key={label as string} className="bg-white/[0.03] rounded-lg p-2 text-center">
                              <div className="text-[10px] text-white/40 font-mono">{label as string}</div>
                              <div className="text-sm text-white/80 font-mono font-semibold">
                                ${(val as number).toFixed(2)}
                              </div>
                            </div>
                          ))}
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
        <span className="text-[10px] text-white/25 font-mono">Auto-refreshes every 60s</span>
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
