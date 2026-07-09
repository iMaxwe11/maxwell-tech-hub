"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Satellite, SatelliteDish } from "lucide-react";
import type { IssPosition } from "@/lib/types";

/* ═══════════════════════════════════════════════════════════════
   MISSION CONTROL — live ISS ground-track over a dot-matrix Earth
   with a real solar day/night terminator.
   Map projection: equirectangular. viewBox 0 0 360 180,
   x = lon + 180, y = 90 - lat.
   ═══════════════════════════════════════════════════════════════ */

/** Natural Earth 110m land (public domain), rasterized to a 4° grid by
 *  scripts/generate-land-bitmap.js. 44 rows (lat 86 → -86), 90 cols
 *  (lon -178 → 178), hex-encoded bits, MSB = westmost cell. */
const LAND_ROWS = [
  "00000000000000000000000","000003fbfc0000000000000","000040dfff00e0000000000",
  "00030401ff0000101f80000","0f88fcf1fe003803fffff80","fffffe38f180fdffffffffc",
  "0ffffc604003bfffffffff8","001ffc3800009fffffff0c0","000fff7e00097ffffffe080",
  "0007fff00007ffffffff000","0003fff80007ffbffffe000","0003fff0001cb5bffffc000",
  "0003ffc00018afbfffe8000","0001ffc0001f03ffffe2000","00007e80001fffbfffe0000",
  "00003800007fffdfffe0000","00001840007ffdf3ff80000","00001e08007fffe1c710000",
  "00000300007ffe808310000","00000038007fffc08100000","0000003e003bff800200000",
  "0000007f0001ff000040000","0000007fc001fe000243000","0000007ff000fe000100e00",
  "0000007ff000fe000000200","0000003fe000fe400006800","0000001fe000fc80000fc04",
  "0000001fe0007c80003fc20","0000001f80007800007fe00","0000001f00007800003fe00",
  "0000001f000020000021e00","0000001e000000000000c04","00000038000000000000408",
  "00000030000000000000010","00000030000000000000000","00000010000000000000000",
  "00000000000000000000000","00000000000000000000000","00000000000000200040000",
  "000000180000cffdfffff80","00009ffc007ffffffffffe0","07ffffe04ffffffffffffc0",
  "01fffffcfffffffffffffc0","ffffffffffffffffffffffc",
];

const GRID_STEP = 4;

function decodeLandDots(): { x: number; y: number }[] {
  const dots: { x: number; y: number }[] = [];
  LAND_ROWS.forEach((hexRow, r) => {
    const lat = 86 - r * GRID_STEP; // row 0 center = 86°N
    for (let h = 0; h < hexRow.length; h++) {
      const nibble = parseInt(hexRow[h], 16);
      for (let b = 0; b < 4; b++) {
        if (nibble & (0b1000 >> b)) {
          const col = h * 4 + b;
          if (col >= 90) continue; // padding bits
          const lon = -178 + col * GRID_STEP;
          dots.push({ x: lon + 180, y: 90 - lat });
        }
      }
    }
  });
  return dots;
}

// Decoded once per module load — the map never changes.
const LAND_DOTS = decodeLandDots();

const RAD = Math.PI / 180;

/** Solar day/night overlay as an SVG path. Standard terminator curve:
 *  lat(H) = atan(-cos(H) / tan(δ)) where H is the hour angle from the
 *  subsolar longitude and δ the solar declination. The night region is
 *  closed around whichever pole is in darkness (opposite sign of δ). */
function computeNightPath(now: Date): string {
  const start = Date.UTC(now.getUTCFullYear(), 0, 0);
  const dayOfYear = (now.getTime() - start) / 86_400_000;
  const declination = -23.44 * Math.cos(((2 * Math.PI) / 365) * (dayOfYear + 10));
  const utcHours =
    now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;
  const subsolarLon = (12 - utcHours) * 15; // ignores equation of time (±4°, invisible here)

  // Near the equinox the curve degenerates to vertical meridians; draw the
  // night hemisphere as a clean band instead of a ragged square wave.
  if (Math.abs(declination) < 1) {
    const nightStart = ((subsolarLon + 90) % 360 + 360) % 360; // x-coord where night begins
    const w = 180;
    if (nightStart + w <= 360) {
      return `M ${nightStart} 0 h ${w} v 180 h ${-w} Z`;
    }
    const first = 360 - nightStart;
    return `M ${nightStart} 0 h ${first} v 180 h ${-first} Z M 0 0 h ${w - first} v 180 h ${-(w - first)} Z`;
  }

  const pts: string[] = [];
  for (let lon = -180; lon <= 180; lon += 4) {
    const H = (lon - subsolarLon) * RAD;
    const latT = Math.atan(-Math.cos(H) / Math.tan(declination * RAD)) / RAD;
    pts.push(`${lon + 180},${(90 - latT).toFixed(2)}`);
  }
  // δ > 0 → southern pole in darkness → close along the bottom edge.
  const closeY = declination > 0 ? 180 : 0;
  return `M ${pts[0]} L ${pts.join(" ")} L 360,${closeY} L 0,${closeY} Z`;
}

/** Subsolar point (where the sun is directly overhead) for the sun glyph. */
function computeSubsolarPoint(now: Date): { x: number; y: number } {
  const start = Date.UTC(now.getUTCFullYear(), 0, 0);
  const dayOfYear = (now.getTime() - start) / 86_400_000;
  const declination = -23.44 * Math.cos(((2 * Math.PI) / 365) * (dayOfYear + 10));
  const utcHours =
    now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;
  let lon = (12 - utcHours) * 15;
  lon = ((lon + 180) % 360 + 360) % 360 - 180;
  return { x: lon + 180, y: 90 - declination };
}

type TrailPoint = { x: number; y: number; t: number };

/** Split the ground-track into polyline segments, breaking wherever the
 *  ISS wraps the antimeridian (a jump of >180 map units would otherwise
 *  draw a horizontal slash across the whole map). */
function toTrailSegments(points: TrailPoint[]): TrailPoint[][] {
  const segments: TrailPoint[][] = [];
  let current: TrailPoint[] = [];
  for (const p of points) {
    const prev = current[current.length - 1];
    if (prev && Math.abs(p.x - prev.x) > 180) {
      if (current.length > 1) segments.push(current);
      current = [];
    }
    current.push(p);
  }
  if (current.length > 1) segments.push(current);
  return segments;
}

function isValidIss(d: unknown): d is IssPosition {
  if (!d || typeof d !== "object") return false;
  const o = d as Record<string, unknown>;
  return (
    typeof o.latitude === "number" &&
    typeof o.longitude === "number" &&
    // velocity/altitude are absent when the API degrades to its position-only
    // fallback source; the widget renders "—" for them in that case.
    (o.velocity === undefined || typeof o.velocity === "number") &&
    (o.altitude === undefined || typeof o.altitude === "number")
  );
}

const MAX_TRAIL = 140; // ~50 min of history at trail+live cadence

export function ISSTracker() {
  const [iss, setIss] = useState<IssPosition | null>(null);
  const [lost, setLost] = useState(false);
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  // Minute tick so the terminator creeps westward like the real one.
  const [clock, setClock] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  // Seed the orbit trail with the last ~45 minutes of positions so the
  // ground-track is visible immediately instead of building up over minutes.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/iss?mode=trail");
        if (!res.ok) return;
        const data = (await res.json()) as {
          positions?: { latitude: number; longitude: number; timestamp?: number }[];
        };
        if (cancelled || !data.positions?.length) return;
        const seeded = data.positions.map((p) => ({
          x: p.longitude + 180,
          y: 90 - p.latitude,
          t: (p.timestamp ?? 0) * 1000,
        }));
        // Live samples may already exist; merge history in front, keep order.
        setTrail((live) => [...seeded, ...live].slice(-MAX_TRAIL));
      } catch {
        // Trail is decorative — build it live instead.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
        setTrail((prev) =>
          [...prev, { x: data.longitude + 180, y: 90 - data.latitude, t: Date.now() }].slice(
            -MAX_TRAIL
          )
        );
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

  const nightPath = useMemo(() => computeNightPath(clock), [clock]);
  const sun = useMemo(() => computeSubsolarPoint(clock), [clock]);
  const segments = useMemo(() => toTrailSegments(trail), [trail]);

  if (!iss) {
    if (lost) {
      return (
        <div className="glass-card p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <SatelliteDish className="w-5 h-5 text-white/70" aria-hidden />
                ISS Mission Control
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
        <div className="h-56 bg-white/5 rounded" />
      </div>
    );
  }

  const issX = iss.longitude + 180;
  const issY = 90 - iss.latitude;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Satellite className="w-5 h-5" style={{ color: "var(--theme-primary)" }} aria-hidden />
            ISS Mission Control
          </h3>
          <p className="text-xs text-white/50 mt-1">Live ground track · updates every 5s</p>
        </div>
        <div className="flex items-center gap-1.5">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`w-2 h-2 rounded-full ${lost ? "bg-amber-500" : "bg-green-500"}`}
          />
          <span className="text-[9px] font-mono uppercase tracking-widest text-white/40">
            {lost ? "Stale" : "Live"}
          </span>
        </div>
      </div>

      <div className="relative rounded-xl overflow-hidden border border-white/[0.06] bg-black/40 mb-4">
        <svg
          viewBox="0 0 360 180"
          className="w-full h-auto block"
          role="img"
          aria-label={`World map showing the ISS over latitude ${iss.latitude.toFixed(1)}, longitude ${iss.longitude.toFixed(1)}`}
        >
          {/* Graticule */}
          {[60, 120, 180, 240, 300].map((x) => (
            <line key={`v${x}`} x1={x} y1="0" x2={x} y2="180" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
          ))}
          {[30, 60, 120, 150].map((y) => (
            <line key={`h${y}`} x1="0" y1={y} x2="360" y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
          ))}
          {/* Equator, slightly brighter */}
          <line x1="0" y1="90" x2="360" y2="90" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" strokeDasharray="2 3" />

          {/* Continents — dot matrix */}
          {LAND_DOTS.map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r="1.15" fill="rgba(255,255,255,0.16)" />
          ))}

          {/* Day/night terminator */}
          <path d={nightPath} fill="rgba(0,0,5,0.42)" />

          {/* Subsolar sun glyph */}
          <g opacity="0.55">
            <circle cx={sun.x} cy={sun.y} r="2.4" fill="#fbbf24" />
            <circle cx={sun.x} cy={sun.y} r="4.6" fill="none" stroke="#fbbf24" strokeOpacity="0.35" strokeWidth="0.6" />
          </g>

          {/* Orbit trail — opacity ramps toward the present */}
          {segments.map((seg, si) => (
            <g key={si}>
              {seg.slice(1).map((p, i) => {
                const prev = seg[i];
                const globalIndex = trail.indexOf(p);
                const fade = 0.12 + 0.55 * (globalIndex / Math.max(trail.length - 1, 1));
                return (
                  <line
                    key={i}
                    x1={prev.x}
                    y1={prev.y}
                    x2={p.x}
                    y2={p.y}
                    stroke="var(--theme-primary)"
                    strokeOpacity={fade}
                    strokeWidth="1.1"
                    strokeLinecap="round"
                  />
                );
              })}
            </g>
          ))}

          {/* ISS marker: crosshair + pulse rings + core */}
          <g>
            <line x1={issX - 7} y1={issY} x2={issX - 3.5} y2={issY} stroke="var(--theme-primary)" strokeOpacity="0.6" strokeWidth="0.7" />
            <line x1={issX + 3.5} y1={issY} x2={issX + 7} y2={issY} stroke="var(--theme-primary)" strokeOpacity="0.6" strokeWidth="0.7" />
            <line x1={issX} y1={issY - 7} x2={issX} y2={issY - 3.5} stroke="var(--theme-primary)" strokeOpacity="0.6" strokeWidth="0.7" />
            <line x1={issX} y1={issY + 3.5} x2={issX} y2={issY + 7} stroke="var(--theme-primary)" strokeOpacity="0.6" strokeWidth="0.7" />
            <circle
              cx={issX}
              cy={issY}
              r="3"
              fill="none"
              stroke="var(--theme-primary)"
              strokeWidth="0.8"
              className="motion-safe:animate-ping"
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
            />
            <circle cx={issX} cy={issY} r="1.6" fill="var(--theme-primary)" />
            <circle cx={issX} cy={issY} r="0.7" fill="#fff" />
          </g>
        </svg>

        {/* Corner label, mission-control style */}
        <div className="absolute top-2 left-2.5 text-[8px] font-mono uppercase tracking-[0.2em] text-white/25 pointer-events-none select-none">
          ZARYA · 25544
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <div>
          <div className="text-[9px] text-white/40 uppercase tracking-wider mb-0.5">Lat</div>
          <div className="text-white font-mono text-xs font-semibold">{iss.latitude.toFixed(2)}°</div>
        </div>
        <div>
          <div className="text-[9px] text-white/40 uppercase tracking-wider mb-0.5">Lon</div>
          <div className="text-white font-mono text-xs font-semibold">{iss.longitude.toFixed(2)}°</div>
        </div>
        <div>
          <div className="text-[9px] text-white/40 uppercase tracking-wider mb-0.5">Velocity</div>
          <div className="text-white font-mono text-xs font-semibold">
            {iss.velocity !== undefined ? `${Math.round(iss.velocity).toLocaleString()} km/h` : "—"}
          </div>
        </div>
        <div>
          <div className="text-[9px] text-white/40 uppercase tracking-wider mb-0.5">Altitude</div>
          <div className="text-white font-mono text-xs font-semibold">
            {iss.altitude !== undefined ? `${Math.round(iss.altitude)} km` : "—"}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
