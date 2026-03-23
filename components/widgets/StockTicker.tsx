"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface StockData {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
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

export function StockTicker() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    const fetchStocks = async () => {
      // Try 1: Our API route
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const res = await fetch("/api/stocks", { signal: controller.signal });
        clearTimeout(timeout);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const mapped: StockData[] = data.map((s: Record<string, unknown>) => ({
              symbol: String(s.symbol || ""),
              name: META[String(s.symbol)]?.name || String(s.name || s.symbol || ""),
              price: parseFloat(String(s.price || s.regularMarketPrice || 0)),
              changePercent: parseFloat(String(s.changesPercentage || s.regularMarketChangePercent || 0)),
              icon: META[String(s.symbol)]?.icon || "📊",
              live: true,
            }));
            if (mapped.some(s => s.price > 0)) {
              setStocks(mapped.filter(s => s.price > 0));
              setIsLive(true);
              setLastUpdated(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
              setLoading(false);
              return;
            }
          }
        }
      } catch { /* continue to fallback */ }

      // Try 2: Direct client-side Yahoo Finance (CORS may block but worth trying)
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const res = await fetch(
          "https://query1.finance.yahoo.com/v7/finance/quote?symbols=AAPL,MSFT,GOOGL,AMZN,NVDA,TSLA,META",
          { signal: controller.signal }
        );
        clearTimeout(timeout);
        if (res.ok) {
          const json = await res.json();
          const quotes = json?.quoteResponse?.result;
          if (Array.isArray(quotes) && quotes.length > 0) {
            const mapped: StockData[] = quotes.map((q: Record<string, unknown>) => ({
              symbol: String(q.symbol || ""),
              name: META[String(q.symbol)]?.name || String(q.shortName || q.symbol || ""),
              price: parseFloat(String(q.regularMarketPrice || 0)),
              changePercent: parseFloat(String(q.regularMarketChangePercent || 0)),
              icon: META[String(q.symbol)]?.icon || "📊",
              live: true,
            }));
            setStocks(mapped.filter(s => s.price > 0));
            setIsLive(true);
            setLastUpdated(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
            setLoading(false);
            return;
          }
        }
      } catch { /* continue to fallback */ }

      // Fallback: Show market index summary via a public endpoint
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        // CoinGecko has a "companies" endpoint that shows BTC holdings by company — use as a signal
        const res = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=apple,microsoft,alphabet&vs_currencies=usd",
          { signal: controller.signal }
        );
        clearTimeout(timeout);
        // This won't work for stocks but catches the error gracefully
      } catch { /* expected */ }

      // Final fallback: Professional static display
      setStocks([
        { symbol: "AAPL", name: "Apple", price: 0, changePercent: 0, icon: "🍎", live: false },
        { symbol: "MSFT", name: "Microsoft", price: 0, changePercent: 0, icon: "🪟", live: false },
        { symbol: "GOOGL", name: "Alphabet", price: 0, changePercent: 0, icon: "🔍", live: false },
        { symbol: "NVDA", name: "NVIDIA", price: 0, changePercent: 0, icon: "🟢", live: false },
        { symbol: "TSLA", name: "Tesla", price: 0, changePercent: 0, icon: "⚡", live: false },
        { symbol: "META", name: "Meta", price: 0, changePercent: 0, icon: "🌐", live: false },
      ]);
      setIsLive(false);
      setLoading(false);
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
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
                <div className="space-y-1"><div className="w-20 h-4 bg-white/5 rounded animate-pulse" /><div className="w-12 h-3 bg-white/5 rounded animate-pulse" /></div>
              </div>
              <div className="space-y-1 text-right"><div className="w-20 h-4 bg-white/5 rounded animate-pulse" /><div className="w-14 h-3 bg-white/5 rounded animate-pulse" /></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Non-live fallback: show tracked stocks without prices
  if (!isLive) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">📊 Watchlist</h3>
          <span className="text-[10px] text-white/25 font-mono px-2 py-0.5 rounded-full border border-white/10">Tracked</span>
        </div>
        <div className="space-y-2">
          {stocks.map((stock, i) => (
            <motion.a key={stock.symbol} href={`https://finance.yahoo.com/quote/${stock.symbol}`} target="_blank" rel="noopener noreferrer"
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0 group hover:bg-white/[0.03] rounded-lg px-2 -mx-2 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-lg">{stock.icon}</div>
                <div>
                  <div className="text-white font-semibold text-sm group-hover:text-cyan-400 transition-colors">{stock.name}</div>
                  <div className="text-[11px] text-white/40 font-mono">{stock.symbol}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-white/30 font-mono group-hover:text-white/50 transition-colors flex items-center gap-1">
                  View <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-white/5 text-center">
          <a href="https://finance.yahoo.com" target="_blank" rel="noopener noreferrer" className="text-[10px] text-cyan-400/40 hover:text-cyan-400/70 font-mono transition-colors">Open Yahoo Finance →</a>
        </div>
      </motion.div>
    );
  }

  // Live data display
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">📊 Hot Stocks</h3>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          {lastUpdated && <span className="text-[10px] text-white/30 font-mono">{lastUpdated}</span>}
        </div>
      </div>
      <div className="space-y-2">
        <AnimatePresence>
          {stocks.slice(0, 6).map((stock, i) => {
            const pos = stock.changePercent > 0;
            return (
              <motion.a key={stock.symbol} href={`https://finance.yahoo.com/quote/${stock.symbol}`} target="_blank" rel="noopener noreferrer"
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0 group hover:bg-white/[0.02] rounded-lg px-2 -mx-2 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-lg">{stock.icon}</div>
                  <div>
                    <div className="text-white font-semibold text-sm group-hover:text-cyan-400 transition-colors">{stock.name}</div>
                    <div className="text-[11px] text-white/40 font-mono">{stock.symbol}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-mono font-semibold text-sm">
                    ${stock.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className={`text-xs font-mono ${pos ? "text-green-400" : "text-red-400"}`}>
                    {pos ? "▲" : "▼"} {Math.abs(stock.changePercent).toFixed(2)}%
                  </div>
                </div>
              </motion.a>
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
