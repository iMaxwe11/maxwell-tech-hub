"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function CryptoTicker() {
  const [crypto, setCrypto] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCrypto = async () => {
      try {
        const res = await fetch("/api/crypto?limit=5");
        const data = await res.json();
        
        // Check if data is actually an array
        if (Array.isArray(data)) {
          setCrypto(data);
        } else {
          console.error("Crypto API returned non-array:", data);
          setCrypto([]);
        }
      } catch (e) {
        console.error("Crypto error:", e);
        setCrypto([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCrypto();
    const interval = setInterval(fetchCrypto, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading || crypto.length === 0) {
    return (
      <div className="glass-card p-6 animate-pulse">
        <div className="h-48 bg-white/5 rounded" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
      <h3 className="text-lg font-bold text-white mb-4">📈 Top Crypto</h3>
      <div className="space-y-3">
        {crypto.map((coin: any) => {
          const change = parseFloat(coin.changePercent24Hr);
          const isPositive = change > 0;
          return (
            <div key={coin.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{coin.symbol === "BTC" ? "₿" : coin.symbol === "ETH" ? "Ξ" : "◆"}</div>
                <div>
                  <div className="text-white font-semibold">{coin.name}</div>
                  <div className="text-xs text-white/50">{coin.symbol}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-mono font-semibold">
                  ${parseFloat(coin.priceUsd).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className={`text-xs font-mono ${isPositive ? "text-green-400" : "text-red-400"}`}>
                  {isPositive ? "+" : ""}{change.toFixed(2)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
