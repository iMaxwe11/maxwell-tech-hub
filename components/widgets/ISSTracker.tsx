"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

interface ISSData {
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
  visibility: string;
}

export default function ISSTracker() {
  const [issData, setIssData] = useState<ISSData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchISS = async () => {
      try {
        const res = await fetch('/api/iss');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setIssData(data);
        setLoading(false);
      } catch (e) {
        setError(true);
        setLoading(false);
      }
    };

    fetchISS();
    const interval = setInterval(fetchISS, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading || error || !issData) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.7 }}
      className="glass-card p-6 relative overflow-hidden"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold font-[family-name:var(--font-heading)] text-white flex items-center gap-2">
            <span className="text-2xl">🛰️</span>
            ISS Live Tracker
          </h3>
          <p className="text-xs text-white/50 mt-1 font-[family-name:var(--font-mono)]">
            International Space Station
          </p>
        </div>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-1">
          <div className="text-xs text-white/50 uppercase tracking-wider font-[family-name:var(--font-mono)]">
            Velocity
          </div>
          <div className="text-xl font-bold text-[var(--accent-cyan)] font-[family-name:var(--font-mono)]">
            {Math.round(issData.velocity).toLocaleString()} km/h
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-xs text-white/50 uppercase tracking-wider font-[family-name:var(--font-mono)]">
            Altitude
          </div>
          <div className="text-xl font-bold text-[var(--accent-purple)] font-[family-name:var(--font-mono)]">
            {Math.round(issData.altitude)} km
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="text-xs text-white/50 uppercase tracking-wider font-[family-name:var(--font-mono)]">
            Latitude
          </div>
          <div className="text-sm font-bold text-white/90 font-[family-name:var(--font-mono)]">
            {issData.latitude.toFixed(4)}°
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-xs text-white/50 uppercase tracking-wider font-[family-name:var(--font-mono)]">
            Longitude
          </div>
          <div className="text-sm font-bold text-white/90 font-[family-name:var(--font-mono)]">
            {issData.longitude.toFixed(4)}°
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/[0.08]">
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/40 font-[family-name:var(--font-mono)]">
            Status: {issData.visibility}
          </span>
          <span className="text-xs text-white/40 font-[family-name:var(--font-mono)]">
            Updates every 5s
          </span>
        </div>
      </div>

      {/* Orbital path animation */}
      <div className="absolute -right-12 -top-12 w-32 h-32 opacity-10">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="w-full h-full border-2 border-dashed border-[var(--accent-cyan)] rounded-full"
        />
      </div>
    </motion.div>
  );
}
