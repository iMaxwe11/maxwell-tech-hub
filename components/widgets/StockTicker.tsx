"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  icon: string;
}

const STOCK_META: Record<string, { name: string; icon: string }> = {
  AAPL: { name: "Apple", icon: "🍎" },
  MSFT: { name: "Microsoft", icon: "🪟" },
  GOOGL: { name: "Alphabet", icon: "🔍" },
  AMZN: { name: "Amazon", icon: "📦" },
  NVDA: { name: "NVIDIA", icon: "🟢" },
  TSLA: { name: "Tesla", icon: "⚡" },
  META: { name: "Meta", icon: "🌐" },
};

export function StockTicker() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const res = await fetch("/api/stocks", { signal: controller.signal });
        clearTimeout(timeout);

        if (!res.ok) throw new Error(`API ${res.status}`);
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          const mapped: StockData[] = data.map((s: Record<string, unknown>) => ({
            symbol: s.symbol as string,
            name: (STOCK_META[s.symbol as string]?.name || s.name) as string,
            price: parseFloat(String(s.price)) || 0,
            change: parseFloat(String(s.change)) || 0,
            changePercent: parseFloat(String(s.changesPercentage)) || 0,
            icon: STOCK_META[s.symbol as string]?.icon || "📊",
          }));
          setStocks(mapped);
          setLastUpdated(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
          setError(false);
        } else {
          throw new Error("Empty");
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchStocks();
    const interval = setInterval(fetchStocks, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="glass-card p-6">
        <h3 className="text-lg font-bold text-white mb-4">📊 Hot Stocks</h3>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
                <div className="space-y-1">
                  <div className="w-20 h-4 bg-white/5 rounded animate-pulse" />
                  <div className="w-12 h-3 bg-white/5 rounded animate-pulse" />
                </div>
              </div>
              <div className="space-y-1 text-right">
                <div className="w-20 h-4 bg-white/5 rounded animate-pulse" />
                <div className="w-14 h-3 bg-white/5 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || stocks.length === 0) {
    return (
      <div className="glass-card p-6">
        <h3 className="text-lg font-bold text-white mb-4">📊 Hot Stocks</h3>
        <p className="text-white/40 text-sm">Stock data temporarily unavailable. Markets may be closed or API rate limited.</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">📊 Hot Stocks</h3>
        {lastUpdated && <span className="text-[10px] text-white/30 font-mono">{lastUpdated}</span>}
      </div>
      <div className="space-y-2">
        <AnimatePresence>
          {stocks.slice(0, 6).map((stock, i) => {
            const isPositive = stock.changePercent > 0;
            return (
              <motion.div key={stock.symbol}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0 group hover:bg-white/[0.02] rounded-lg px-2 -mx-2 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-lg">
                    {stock.icon}
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">{stock.name}</div>
                    <div className="text-[11px] text-white/40 font-mono">{stock.symbol}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-mono font-semibold text-sm">
                    ${stock.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className={`text-xs font-mono ${isPositive ? "text-green-400" : "text-red-400"}`}>
                    {isPositive ? "▲" : "▼"} {Math.abs(stock.changePercent).toFixed(2)}%
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      <div className="mt-3 pt-3 border-t border-white/5 text-center">
        <span className="text-[10px] text-white/25 font-mono">Market data · Updates every 5m</span>
      </div>
    </motion.div>
  );
}
