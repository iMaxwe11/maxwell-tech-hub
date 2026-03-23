"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function StockTicker() {
  const [stocks, setStocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const res = await fetch("/api/stocks");
        const data = await res.json();
        
        if (Array.isArray(data)) {
          setStocks(data);
        } else {
          console.error("Stocks API returned non-array:", data);
          setStocks([]);
        }
      } catch (e) {
        console.error("Stocks error:", e);
        setStocks([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStocks();
    const interval = setInterval(fetchStocks, 300000);
    return () => clearInterval(interval);
  }, []);

  if (loading || stocks.length === 0) {
    return (
      <div className="glass-card p-6 animate-pulse">
        <div className="h-64 bg-white/5 rounded" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="glass-card p-6">
      <h3 className="text-lg font-bold text-white mb-4">📈 Top Stocks</h3>
      <div className="space-y-3">
        {stocks.map((stock: any) => {
          const change = parseFloat(stock.changesPercentage || 0);
          const isPositive = change > 0;
          
          return (
            <div 
              key={stock.symbol} 
              className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <div className="flex items-center gap-3">
                <div className="text-xl">
                  {stock.symbol === "AAPL" ? "🍎" : 
                   stock.symbol === "MSFT" ? "🪟" :
                   stock.symbol === "GOOGL" ? "🔍" :
                   stock.symbol === "AMZN" ? "📦" :
                   stock.symbol === "NVDA" ? "🎮" : "📊"}
                </div>
                <div>
                  <div className="text-white font-semibold">{stock.name}</div>
                  <div className="text-xs text-white/50">{stock.symbol}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-mono font-semibold">
                  ${parseFloat(stock.price).toLocaleString(undefined, { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
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
