"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { IssPosition } from "@/lib/types";

export function ISSTracker() {
  const [iss, setIss] = useState<IssPosition | null>(null);

  useEffect(() => {
    const fetchISS = async () => {
      try {
        const res = await fetch("/api/iss");
        const data = (await res.json()) as IssPosition;
        setIss(data);
      } catch (e) {
        console.error("ISS error:", e);
      }
    };
    fetchISS();
    const interval = setInterval(fetchISS, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!iss) return <div className="glass-card p-6 animate-pulse"><div className="h-24 bg-white/5 rounded" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white">🛰️ ISS Live</h3>
          <p className="text-xs text-white/50 mt-1">International Space Station</p>
        </div>
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}
          className="w-2 h-2 rounded-full bg-green-500" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs text-white/50 uppercase tracking-wider mb-1">Latitude</div>
          <div className="text-white font-mono font-semibold">{iss.latitude.toFixed(4)}°</div>
        </div>
        <div>
          <div className="text-xs text-white/50 uppercase tracking-wider mb-1">Longitude</div>
          <div className="text-white font-mono font-semibold">{iss.longitude.toFixed(4)}°</div>
        </div>
        <div>
          <div className="text-xs text-white/50 uppercase tracking-wider mb-1">Velocity</div>
          <div className="text-white font-mono font-semibold">{Math.round(iss.velocity)} km/h</div>
        </div>
        <div>
          <div className="text-xs text-white/50 uppercase tracking-wider mb-1">Altitude</div>
          <div className="text-white font-mono font-semibold">{Math.round(iss.altitude)} km</div>
        </div>
      </div>
    </motion.div>
  );
}
