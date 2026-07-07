"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Satellite, SatelliteDish } from "lucide-react";
import type { IssPosition } from "@/lib/types";

function isValidIss(d: unknown): d is IssPosition {
  if (!d || typeof d !== "object") return false;
  const o = d as Record<string, unknown>;
  return (
    typeof o.latitude === "number" &&
    typeof o.longitude === "number" &&
    typeof o.velocity === "number" &&
    typeof o.altitude === "number"
  );
}

export function ISSTracker() {
  const [iss, setIss] = useState<IssPosition | null>(null);
  const [lost, setLost] = useState(false);

  useEffect(() => {
    let failures = 0;
    let timer: ReturnType<typeof setTimeout>;
    let stopped = false;

    const schedule = () => {
      if (stopped) return;
      // 5s cadence while healthy; exponential backoff to 60s while the
      // upstream is rate-limiting so we don't hammer a failing endpoint.
      const delay = failures === 0 ? 5000 : Math.min(5000 * 2 ** failures, 60000);
      timer = setTimeout(fetchISS, delay);
    };

    const fetchISS = async () => {
      try {
        const res = await fetch("/api/iss");
        const data: unknown = await res.json();
        if (!res.ok || !isValidIss(data)) throw new Error("bad response");
        failures = 0;
        setLost(false);
        setIss(data);
      } catch {
        // Keep showing the last known position; only surface "signal lost"
        // after repeated failures with nothing to show.
        failures += 1;
        if (failures >= 3) setLost(true);
      } finally {
        schedule();
      }
    };
    fetchISS();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, []);

  if (!iss) {
    if (lost) {
      return (
        <div className="glass-card p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <SatelliteDish className="w-5 h-5 text-white/70" aria-hidden />
                ISS Live
              </h3>
              <p className="text-xs text-white/50 mt-1">International Space Station</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <p className="text-sm text-white/60">
            Signal lost — the tracking API is unreachable. Retrying automatically.
          </p>
        </div>
      );
    }
    return (
      <div className="glass-card p-6 animate-pulse">
        <div className="h-24 bg-white/5 rounded" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Satellite className="w-5 h-5 text-cyan-400" aria-hidden />
            ISS Live
          </h3>
          <p className="text-xs text-white/50 mt-1">International Space Station</p>
        </div>
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}
          className={`w-2 h-2 rounded-full ${lost ? "bg-amber-500" : "bg-green-500"}`} />
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
