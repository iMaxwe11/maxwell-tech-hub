"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface CryptoAsset {
  id: string;
  rank: string;
  symbol: string;
  name: string;
  priceUsd: string;
  changePercent24Hr: string;
  marketCapUsd: string;
}

export default function CryptoTicker() {
  const [assets, setAssets] = useState<CryptoAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchCrypto = async () => {
      try {
        const res = await fetch('/api/crypto?limit=5');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setAssets(data.data || []);
        setLoading(false);
      } catch (e) {
        setError(true);
        setLoading(false);
      }
    };

    fetchCrypto();
    const interval = setInterval(fetchCrypto, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  if (loading || error || assets.length === 0) return null;

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    if (num >= 1000) return `$${num.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    if (num >= 1) return `$${num.toFixed(2)}`;
    return `$${num.toFixed(4)}`;
  };

  const formatChange = (change: string) => {
    const num = parseFloat(change);
    return num >= 0 ? `+${num.toFixed(2)}%` : `${num.toFixed(2)}%`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.7 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold font-[family-name:var(--font-heading)] text-white flex items-center gap-2">
          <span className="text-2xl">₿</span>
          Crypto Live
        </h3>
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-xs text-white/50 font-[family-name:var(--font-mono)]"
        >
          LIVE
        </motion.div>
      </div>

      <div className="space-y-3">
        {assets.map((asset, index) => {
          const isPositive = parseFloat(asset.changePercent24Hr) >= 0;
          return (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="flex items-center justify-between py-2 border-b border-white/[0.06] last:border-0"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/40 font-[family-name:var(--font-mono)] w-4">
                  {asset.rank}
                </span>
                <div>
                  <div className="text-sm font-bold text-white font-[family-name:var(--font-mono)]">
                    {asset.symbol}
                  </div>
                  <div className="text-xs text-white/50">
                    {asset.name}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-bold text-white font-[family-name:var(--font-mono)]">
                  {formatPrice(asset.priceUsd)}
                </div>
                <div className={`text-xs font-[family-name:var(--font-mono)] ${
                  isPositive ? 'text-green-400' : 'text-red-400'
                }`}>
                  {formatChange(asset.changePercent24Hr)}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-white/[0.08]">
        <div className="text-xs text-white/40 font-[family-name:var(--font-mono)] text-center">
          Powered by CoinCap API · Updates every 60s
        </div>
      </div>
    </motion.div>
  );
}
