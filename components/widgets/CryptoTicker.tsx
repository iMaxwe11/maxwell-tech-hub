"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  image: string;
}

const COIN_ICONS: Record<string, string> = {
  bitcoin: "₿", ethereum: "Ξ", tether: "₮", binancecoin: "◆", solana: "◎",
  ripple: "✕", cardano: "₳", dogecoin: "Ð", polkadot: "●", avalanche: "▲",
};

export function CryptoTicker() {
  const [crypto, setCrypto] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  useEffect(() => {
    const fetchCrypto = async () => {
      try {
        // CoinGecko free API - direct client call, no proxy needed
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        const res = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=6&page=1&sparkline=false&price_change_percentage=24h",
          { signal: controller.signal }
        );
        clearTimeout(timeout);

        if (!res.ok) throw new Error(`API ${res.status}`);
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          setCrypto(data);
          setLastUpdated(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
          setError(false);
        } else {
          throw new Error("Empty response");
        }
      } catch (e) {
        console.error("Crypto error:", e);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCrypto();
    const interval = setInterval(fetchCrypto, 90000); // 90s to avoid rate limits
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="glass-card p-6">
        <h3 className="text-lg font-bold text-white mb-4">📈 Top Crypto</h3>
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
                <div className="w-24 h-4 bg-white/5 rounded animate-pulse" />
                <div className="w-16 h-3 bg-white/5 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || crypto.length === 0) {
    return (
      <div className="glass-card p-6">
        <h3 className="text-lg font-bold text-white mb-4">📈 Top Crypto</h3>
        <p className="text-white/40 text-sm">Market data temporarily unavailable. CoinGecko API rate limited — try refreshing in a moment.</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">📈 Top Crypto</h3>
        {lastUpdated && <span className="text-[10px] text-white/30 font-mono">{lastUpdated}</span>}
      </div>
      <div className="space-y-2">
        {crypto.map((coin) => {
          const change = coin.price_change_percentage_24h || 0;
          const isPositive = change > 0;
          return (
            <div key={coin.id} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0 group hover:bg-white/[0.02] rounded-lg px-2 -mx-2 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-lg">
                  {COIN_ICONS[coin.id] || "◆"}
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">{coin.name}</div>
                  <div className="text-[11px] text-white/40 font-mono uppercase">{coin.symbol}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-mono font-semibold text-sm">
                  ${coin.current_price >= 1
                    ? coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    : coin.current_price.toFixed(4)}
                </div>
                <div className={`text-xs font-mono ${isPositive ? "text-green-400" : "text-red-400"}`}>
                  {isPositive ? "▲" : "▼"} {Math.abs(change).toFixed(2)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 pt-3 border-t border-white/5 text-center">
        <span className="text-[10px] text-white/25 font-mono">Data from CoinGecko · Updates every 90s</span>
      </div>
    </motion.div>
  );
}
