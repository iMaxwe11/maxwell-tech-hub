"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { GrokStarfield } from "@/components/GrokStarfield";
import { Navbar } from "@/components/Navbar";

/* ═══ Types ═══ */
interface CurrentWeather {
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDir: number;
  weatherCode: number;
  precip: number;
  uvIndex: number;
  pressure: number;
  visibility: number;
  cloudCover: number;
  dewPoint: number;
}

interface HourlyData {
  time: string;
  temp: number;
  pop: number;
  windSpeed: number;
  humidity: number;
  weatherCode: number;
}

interface DailyData {
  day: string;
  date: string;
  high: number;
  low: number;
  icon: string;
  pop: number;
  sunrise: string;
  sunset: string;
  uvMax: number;
  windMax: number;
  precipSum: number;
}

/* ═══ Section Wrapper ═══ */
function Sec({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const v = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.section ref={ref} initial={{ opacity: 0, y: 40 }} animate={v ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, delay, ease: [0.25, 0.1, 0.25, 1] }} className={className}>
      {children}
    </motion.section>
  );
}

/* ═══ Weather Utilities ═══ */
function getWeatherIcon(code: number): string {
  if (code === 0 || code === 1) return "☀️";
  if (code === 2) return "⛅";
  if (code === 3) return "☁️";
  if (code >= 45 && code <= 48) return "🌫️";
  if (code >= 51 && code <= 57) return "🌦️";
  if (code >= 61 && code <= 67) return "🌧️";
  if (code >= 71 && code <= 77) return "❄️";
  if (code >= 80 && code <= 82) return "🌧️";
  if (code >= 85 && code <= 86) return "🌨️";
  if (code >= 95) return "⛈️";
  return "🌡️";
}

function getWeatherDesc(code: number): string {
  const m: Record<number, string> = {
    0: "Clear Sky", 1: "Mainly Clear", 2: "Partly Cloudy", 3: "Overcast",
    45: "Foggy", 48: "Rime Fog", 51: "Light Drizzle", 53: "Drizzle", 55: "Dense Drizzle",
    61: "Light Rain", 63: "Rain", 65: "Heavy Rain",
    66: "Freezing Rain", 67: "Heavy Freezing Rain",
    71: "Light Snow", 73: "Snow", 75: "Heavy Snow", 77: "Snow Grains",
    80: "Light Showers", 81: "Showers", 82: "Heavy Showers",
    85: "Snow Showers", 86: "Heavy Snow Showers",
    95: "Thunderstorm", 96: "Thunderstorm + Hail", 99: "Severe Thunderstorm",
  };
  return m[code] || "Unknown";
}

function getWindDirection(deg: number): string {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return dirs[Math.round(deg / 22.5) % 16];
}

function tempColor(t: number): string {
  if (t >= 95) return "#dc2626";
  if (t >= 85) return "#ef4444";
  if (t >= 75) return "#f59e0b";
  if (t >= 60) return "#22c55e";
  if (t >= 45) return "#06b6d4";
  if (t >= 32) return "#3b82f6";
  return "#818cf8";
}

function uvLabel(uv: number): { text: string; color: string } {
  if (uv <= 2) return { text: "Low", color: "#22c55e" };
  if (uv <= 5) return { text: "Moderate", color: "#f59e0b" };
  if (uv <= 7) return { text: "High", color: "#ef4444" };
  if (uv <= 10) return { text: "Very High", color: "#dc2626" };
  return { text: "Extreme", color: "#a855f7" };
}

/* ═══ Animated Background Gradient ═══ */
function WeatherBackground({ code }: { code: number }) {
  const isNight = new Date().getHours() >= 20 || new Date().getHours() < 6;
  let gradient = "from-sky-900/20 via-transparent to-transparent";
  if (code === 0 && !isNight) gradient = "from-amber-900/10 via-sky-900/10 to-transparent";
  if (code === 0 && isNight) gradient = "from-indigo-900/20 via-transparent to-transparent";
  if (code >= 61 && code <= 82) gradient = "from-blue-900/20 via-slate-900/10 to-transparent";
  if (code >= 95) gradient = "from-purple-900/20 via-slate-900/15 to-transparent";
  if (code >= 71 && code <= 77) gradient = "from-slate-800/20 via-blue-900/10 to-transparent";

  return (
    <div className={`fixed inset-0 bg-gradient-to-b ${gradient} pointer-events-none z-0`} />
  );
}

/* ═══ Current Conditions Hero Card ═══ */
function CurrentConditions({ data }: { data: CurrentWeather }) {
  const uv = uvLabel(data.uvIndex);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      className="glass-card p-8 relative overflow-hidden">
      {/* Decorative glow */}
      <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl"
        style={{ background: `${tempColor(data.temp)}10` }} />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-white/50 text-sm font-medium">Southampton, NJ</p>
            <p className="text-white/30 text-xs font-mono mt-0.5">{getWeatherDesc(data.weatherCode)}</p>
          </div>
          <div className="text-6xl">{getWeatherIcon(data.weatherCode)}</div>
        </div>

        {/* Big temperature */}
        <div className="mb-6">
          <div className="flex items-baseline gap-3">
            <span className="text-7xl sm:text-8xl font-bold tracking-tight" style={{ color: tempColor(data.temp) }}>
              {data.temp}°
            </span>
            <div className="text-white/40 text-sm">
              <p>Feels like <span className="text-white/60">{data.feelsLike}°F</span></p>
            </div>
          </div>
        </div>

        {/* Stat grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Humidity", value: `${data.humidity}%`, icon: "💧", color: "#3b82f6" },
            { label: "Wind", value: `${data.windSpeed} mph ${getWindDirection(data.windDir)}`, icon: "💨", color: "#06b6d4" },
            { label: "UV Index", value: `${data.uvIndex} ${uv.text}`, icon: "☀️", color: uv.color },
            { label: "Pressure", value: `${data.pressure} hPa`, icon: "📊", color: "#a855f7" },
            { label: "Visibility", value: `${data.visibility} mi`, icon: "👁️", color: "#22c55e" },
            { label: "Dew Point", value: `${data.dewPoint}°F`, icon: "🌡️", color: "#f59e0b" },
            { label: "Cloud Cover", value: `${data.cloudCover}%`, icon: "☁️", color: "#94a3b8" },
            { label: "Precip", value: `${data.precip}"`, icon: "🌧️", color: "#6366f1" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-sm">{s.icon}</span>
                <span className="text-[10px] text-white/40 font-mono uppercase">{s.label}</span>
              </div>
              <p className="text-white text-sm font-semibold">{s.value}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ═══ Hourly Forecast Chart ═══ */
function HourlyChart({ hours }: { hours: HourlyData[] }) {
  const maxTemp = Math.max(...hours.map(h => h.temp));
  const minTemp = Math.min(...hours.map(h => h.temp));
  const range = maxTemp - minTemp || 1;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
      className="glass-card p-6">
      <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
        <span className="text-xl">🕐</span> Hourly Forecast
      </h3>
      <p className="text-xs text-white/40 font-mono mb-5">Next 24 hours</p>

      <div className="overflow-x-auto -mx-2 px-2 pb-2">
        <div className="flex gap-3 min-w-max">
          {hours.map((h, i) => {
            const barHeight = ((h.temp - minTemp) / range) * 60 + 20;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex flex-col items-center gap-1.5 min-w-[52px]"
              >
                <span className="text-[10px] text-white/40 font-mono">{h.time}</span>
                <span className="text-xs">{getWeatherIcon(h.weatherCode)}</span>
                <span className="text-xs font-bold" style={{ color: tempColor(h.temp) }}>{h.temp}°</span>
                <div className="w-7 bg-white/5 rounded-full overflow-hidden" style={{ height: 80 }}>
                  <div className="w-full rounded-full mt-auto transition-all"
                    style={{
                      height: barHeight,
                      marginTop: 80 - barHeight,
                      background: `linear-gradient(to top, ${tempColor(h.temp)}40, ${tempColor(h.temp)}15)`,
                      borderTop: `2px solid ${tempColor(h.temp)}`,
                    }}
                  />
                </div>
                {h.pop > 0 && (
                  <span className="text-[9px] text-cyan-400/70 font-mono">{h.pop}%</span>
                )}
                <span className="text-[9px] text-white/25 font-mono">{h.windSpeed}mph</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

/* ═══ 7-Day Forecast ═══ */
function DailyForecast({ days }: { days: DailyData[] }) {
  const globalHigh = Math.max(...days.map(d => d.high));
  const globalLow = Math.min(...days.map(d => d.low));
  const range = globalHigh - globalLow || 1;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
      className="glass-card p-6">
      <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
        <span className="text-xl">📅</span> 7-Day Forecast
      </h3>
      <p className="text-xs text-white/40 font-mono mb-5">Extended outlook</p>

      <div className="space-y-2">
        {days.map((d, i) => {
          const lowPct = ((d.low - globalLow) / range) * 100;
          const highPct = ((d.high - globalLow) / range) * 100;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.05 }}
              className="flex items-center gap-3 py-2.5 px-3 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-all group"
            >
              <span className="w-10 text-sm font-semibold text-white/60">{d.day}</span>
              <span className="text-xl w-8 text-center">{d.icon}</span>
              {d.pop > 20 && (
                <span className="text-[10px] text-cyan-400/70 font-mono w-8 text-right">{d.pop}%</span>
              )}
              {d.pop <= 20 && <span className="w-8" />}
              <span className="text-white/40 font-mono text-xs w-8 text-right">{d.low}°</span>
              {/* Temperature bar */}
              <div className="flex-1 h-2 bg-white/5 rounded-full relative overflow-hidden mx-1">
                <div
                  className="absolute inset-y-0 rounded-full transition-all"
                  style={{
                    left: `${lowPct}%`,
                    right: `${100 - highPct}%`,
                    background: `linear-gradient(90deg, ${tempColor(d.low)}, ${tempColor(d.high)})`,
                  }}
                />
              </div>
              <span className="text-white font-mono text-xs w-8 font-semibold">{d.high}°</span>
              {/* Sun times on hover */}
              <div className="hidden sm:flex items-center gap-2 text-[9px] text-white/20 font-mono opacity-0 group-hover:opacity-100 transition-opacity w-28 justify-end">
                <span>↑{d.sunrise}</span>
                <span>↓{d.sunset}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ═══ Rain Probability Timeline ═══ */
function PrecipTimeline({ hours }: { hours: HourlyData[] }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
      className="glass-card p-6">
      <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
        <span className="text-xl">🌧️</span> Precipitation Probability
      </h3>
      <p className="text-xs text-white/40 font-mono mb-5">Chance of rain over the next 24 hours</p>

      <div className="flex items-end gap-[3px] h-32">
        {hours.map((h, i) => {
          const height = Math.max(h.pop, 3);
          const color = h.pop >= 70 ? "#06b6d4" : h.pop >= 40 ? "#3b82f6" : h.pop >= 20 ? "#6366f1" : "rgba(99,102,241,0.3)";
          return (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ delay: 0.5 + i * 0.02, duration: 0.5, ease: "easeOut" }}
              className="flex-1 rounded-t-sm relative group cursor-default"
              style={{ background: `linear-gradient(to top, ${color}, ${color}40)` }}
            >
              {/* Tooltip */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[9px] font-mono px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                {h.time}: {h.pop}%
              </div>
            </motion.div>
          );
        })}
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-[9px] text-white/30 font-mono">{hours[0]?.time}</span>
        <span className="text-[9px] text-white/30 font-mono">{hours[Math.floor(hours.length / 2)]?.time}</span>
        <span className="text-[9px] text-white/30 font-mono">{hours[hours.length - 1]?.time}</span>
      </div>
    </motion.div>
  );
}

/* ═══ Radar Embed ═══ */
function RadarEmbed() {
  const [expanded, setExpanded] = useState(false);
  const [overlay, setOverlay] = useState("rainViewer");

  const overlays = [
    { id: "rainViewer", label: "Rain/Snow", icon: "🌧️" },
    { id: "wind", label: "Wind", icon: "💨" },
    { id: "temp", label: "Temp", icon: "🌡️" },
    { id: "clouds", label: "Clouds", icon: "☁️" },
    { id: "thunder", label: "Thunder", icon: "⛈️" },
  ];

  // RainViewer uses a different embed; Windy handles the rest
  const iframeSrc = overlay === "rainViewer"
    ? "https://www.rainviewer.com/map.html?loc=39.95,-74.71,8&oFa=1&oC=1&oU=1&oCS=1&oF=0&oAP=1&c=1&o=83&lm=1&layer=radar&sm=1&sn=1"
    : `https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=in&metricTemp=%C2%B0F&metricWind=mph&zoom=8&overlay=${overlay}&product=ecmwf&level=surface&lat=39.95&lon=-74.71&detailLat=39.95&detailLon=-74.71&marker=true&pressure=true&message=true`;

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-xl">📡</span> Live Radar
          </h3>
          <p className="text-xs text-white/40 font-mono mt-1">Interactive weather visualization</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setExpanded(!expanded)}
          className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-white/50 hover:text-white/80 transition-colors"
        >
          {expanded ? "Collapse ↑" : "Expand ↓"}
        </motion.button>
      </div>

      {/* Overlay tabs */}
      <div className="px-4 pb-3 flex gap-1.5 overflow-x-auto">
        {overlays.map(o => (
          <button
            key={o.id}
            onClick={() => setOverlay(o.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono whitespace-nowrap transition-all border ${
              overlay === o.id
                ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                : "bg-white/[0.02] border-white/[0.06] text-white/40 hover:text-white/60 hover:bg-white/[0.04]"
            }`}
          >
            <span>{o.icon}</span>
            <span>{o.label}</span>
          </button>
        ))}
      </div>

      <div className="relative transition-all duration-500" style={{ height: expanded ? 600 : 380 }}>
        <iframe
          key={overlay}
          src={iframeSrc}
          style={{ width: "100%", height: "100%", border: "none" }}
          title="Weather Radar"
          loading="lazy"
          allowFullScreen
        />
      </div>
    </div>
  );
}

/* ═══ Wind Compass ═══ */
function WindCompass({ speed, direction }: { speed: number; direction: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
      className="glass-card p-6 flex flex-col items-center">
      <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2 self-start">
        <span className="text-xl">💨</span> Wind
      </h3>
      <p className="text-xs text-white/40 font-mono mb-4 self-start">{getWindDirection(direction)} at {speed} mph</p>

      <div className="relative w-40 h-40 mb-3">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border border-white/10" />
        <div className="absolute inset-2 rounded-full border border-white/5" />

        {/* Cardinal directions */}
        {["N", "E", "S", "W"].map((d, i) => (
          <span key={d} className="absolute text-[10px] font-mono text-white/40" style={{
            top: i === 0 ? 2 : i === 2 ? "auto" : "50%",
            bottom: i === 2 ? 2 : undefined,
            left: i === 3 ? 2 : i === 1 ? "auto" : "50%",
            right: i === 1 ? 2 : undefined,
            transform: (i === 0 || i === 2) ? "translateX(-50%)" : (i === 1 || i === 3) ? "translateY(-50%)" : undefined,
          }}>{d}</span>
        ))}

        {/* Arrow */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ rotate: direction }}
          transition={{ type: "spring", stiffness: 60, damping: 15 }}
        >
          <div className="w-0.5 h-16 rounded-full relative" style={{ background: "linear-gradient(to top, transparent, #06b6d4)" }}>
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-b-[8px] border-transparent border-b-cyan-400" />
          </div>
        </motion.div>

        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-cyan-400/30 border border-cyan-400/50" />
        </div>
      </div>

      <div className="text-center">
        <span className="text-3xl font-bold text-cyan-400">{speed}</span>
        <span className="text-white/40 text-sm ml-1">mph</span>
      </div>
    </motion.div>
  );
}

/* ═══ Sun Times Card ═══ */
function SunTimes({ sunrise, sunset }: { sunrise: string; sunset: string }) {
  const now = new Date();
  const sr = new Date(`${now.toDateString()} ${sunrise}`);
  const ss = new Date(`${now.toDateString()} ${sunset}`);
  const total = ss.getTime() - sr.getTime();
  const elapsed = now.getTime() - sr.getTime();
  const pct = Math.max(0, Math.min(100, (elapsed / total) * 100));
  const isDaytime = now >= sr && now <= ss;
  const daylightHours = (total / 3600000).toFixed(1);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
      className="glass-card p-6">
      <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
        <span className="text-xl">{isDaytime ? "🌅" : "🌙"}</span> Daylight
      </h3>
      <p className="text-xs text-white/40 font-mono mb-5">{daylightHours} hours of daylight today</p>

      {/* Arc visualization */}
      <div className="relative h-24 mb-4">
        <svg viewBox="0 0 200 100" className="w-full h-full overflow-visible">
          {/* Arc path (background) */}
          <path d="M 10 90 Q 100 -10 190 90" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
          {/* Arc path (progress) */}
          <path d="M 10 90 Q 100 -10 190 90" fill="none" stroke="url(#sunGrad)" strokeWidth="2"
            strokeDasharray="280" strokeDashoffset={280 - (280 * pct / 100)} />
          {/* Sun position */}
          {isDaytime && (
            <circle cx={10 + (180 * pct / 100)} cy={90 - Math.sin(Math.PI * pct / 100) * 100}
              r="6" fill="#fbbf24" filter="url(#sunGlow)" />
          )}
          <defs>
            <linearGradient id="sunGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
            <filter id="sunGlow">
              <feGaussianBlur stdDeviation="3" />
            </filter>
          </defs>
        </svg>
      </div>

      <div className="flex justify-between">
        <div>
          <div className="text-[10px] text-white/40 font-mono uppercase">Sunrise</div>
          <div className="text-white font-semibold text-sm">↑ {sunrise}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-white/40 font-mono uppercase">Sunset</div>
          <div className="text-white font-semibold text-sm">↓ {sunset}</div>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══ Air Quality Widget ═══ */
function AirQuality() {
  const [aqi, setAqi] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://air-quality-api.open-meteo.com/v1/air-quality?latitude=39.9526&longitude=-74.7146&current=us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone&timezone=America/New_York")
      .then(r => r.json())
      .then(data => { setAqi(data.current); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="glass-card p-6 animate-pulse"><div className="h-32 bg-white/5 rounded" /></div>;
  if (!aqi) return null;

  const aqiVal = aqi.us_aqi || 0;
  const aqiLevel = aqiVal <= 50 ? { text: "Good", color: "#22c55e" }
    : aqiVal <= 100 ? { text: "Moderate", color: "#f59e0b" }
    : aqiVal <= 150 ? { text: "Unhealthy (Sensitive)", color: "#ef4444" }
    : { text: "Unhealthy", color: "#dc2626" };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
      className="glass-card p-6">
      <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
        <span className="text-xl">🌬️</span> Air Quality
      </h3>
      <p className="text-xs text-white/40 font-mono mb-4">US AQI Index</p>

      <div className="flex items-center gap-4 mb-4">
        <div className="text-4xl font-bold" style={{ color: aqiLevel.color }}>{aqiVal}</div>
        <div>
          <p className="text-sm font-semibold" style={{ color: aqiLevel.color }}>{aqiLevel.text}</p>
        </div>
      </div>

      {/* AQI bar */}
      <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-4">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min((aqiVal / 300) * 100, 100)}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, #22c55e, #f59e0b, #ef4444)` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "PM2.5", value: `${Math.round(aqi.pm2_5 || 0)} µg/m³` },
          { label: "PM10", value: `${Math.round(aqi.pm10 || 0)} µg/m³` },
          { label: "Ozone", value: `${Math.round(aqi.ozone || 0)} µg/m³` },
          { label: "NO₂", value: `${Math.round(aqi.nitrogen_dioxide || 0)} µg/m³` },
        ].map(p => (
          <div key={p.label} className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <span className="text-[10px] text-white/30 font-mono uppercase">{p.label}</span>
            <p className="text-white text-xs font-semibold">{p.value}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ═══ WEATHER DASHBOARD PAGE ═══ */
export default function WeatherPage() {
  const [current, setCurrent] = useState<CurrentWeather | null>(null);
  const [hourly, setHourly] = useState<HourlyData[]>([]);
  const [daily, setDaily] = useState<DailyData[]>([]);
  const [sunrise, setSunrise] = useState("");
  const [sunset, setSunset] = useState("");
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("");

  const fetchAll = useCallback(async () => {
    try {
      const res = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=39.9526&longitude=-74.7146" +
        "&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,uv_index,surface_pressure,cloud_cover,dew_point_2m" +
        "&hourly=temperature_2m,precipitation_probability,wind_speed_10m,relative_humidity_2m,weather_code,visibility" +
        "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,uv_index_max,wind_speed_10m_max,precipitation_sum" +
        "&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=America/New_York&forecast_days=7"
      );
      const data = await res.json();
      const c = data.current;
      const currentHour = new Date().getHours();

      setCurrent({
        temp: Math.round(c.temperature_2m),
        feelsLike: Math.round(c.apparent_temperature),
        humidity: c.relative_humidity_2m,
        windSpeed: Math.round(c.wind_speed_10m),
        windDir: c.wind_direction_10m,
        weatherCode: c.weather_code,
        precip: c.precipitation,
        uvIndex: Math.round(c.uv_index),
        pressure: Math.round(c.surface_pressure),
        visibility: Math.round((data.hourly?.visibility?.[currentHour] || 16000) / 1609),
        cloudCover: c.cloud_cover,
        dewPoint: Math.round(c.dew_point_2m),
      });

      const hrs: HourlyData[] = data.hourly.time.slice(currentHour, currentHour + 24).map((t: string, i: number) => ({
        time: new Date(t).toLocaleTimeString("en-US", { hour: "numeric" }),
        temp: Math.round(data.hourly.temperature_2m[currentHour + i]),
        pop: data.hourly.precipitation_probability[currentHour + i] || 0,
        windSpeed: Math.round(data.hourly.wind_speed_10m[currentHour + i]),
        humidity: data.hourly.relative_humidity_2m[currentHour + i],
        weatherCode: data.hourly.weather_code[currentHour + i],
      }));
      setHourly(hrs);

      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const ds: DailyData[] = data.daily.time.slice(0, 7).map((date: string, i: number) => {
        const d = new Date(date + "T12:00:00");
        return {
          day: i === 0 ? "Today" : dayNames[d.getDay()],
          date,
          high: Math.round(data.daily.temperature_2m_max[i]),
          low: Math.round(data.daily.temperature_2m_min[i]),
          icon: getWeatherIcon(data.daily.weather_code[i]),
          pop: data.daily.precipitation_probability_max[i] || 0,
          sunrise: new Date(data.daily.sunrise[i]).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
          sunset: new Date(data.daily.sunset[i]).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
          uvMax: Math.round(data.daily.uv_index_max[i]),
          windMax: Math.round(data.daily.wind_speed_10m_max[i]),
          precipSum: data.daily.precipitation_sum[i] || 0,
        };
      });
      setDaily(ds);
      setSunrise(ds[0]?.sunrise || "");
      setSunset(ds[0]?.sunset || "");
      setLastUpdated(new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }));
      setLoading(false);
    } catch (e) {
      console.error("Weather fetch error:", e);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const id = setInterval(fetchAll, 600000);
    return () => clearInterval(id);
  }, [fetchAll]);

  return (
    <>
      <GrokStarfield />
      {current && <WeatherBackground code={current.weatherCode} />}

      <Navbar breadcrumb={["weather"]} accent="#3b82f6" />

      {/* Hero */}
      <div className="pt-28 pb-6 px-4 sm:px-6 relative z-10">
        <div className="max-w-[1400px] mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{current ? getWeatherIcon(current.weatherCode) : "🌡️"}</span>
              <div>
                <h1 className="font-bold text-3xl sm:text-4xl md:text-5xl text-white leading-tight">
                  Weather <span className="gradient-text">Dashboard</span>
                </h1>
                <p className="text-white/40 text-xs font-mono mt-1">
                  Southampton, NJ • Last updated {lastUpdated || "—"}
                  {!loading && (
                    <button onClick={fetchAll} className="ml-3 text-cyan-400/60 hover:text-cyan-400 transition-colors">↻ Refresh</button>
                  )}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="px-4 sm:px-6 pb-24 relative z-10">
          <div className="max-w-[1400px] mx-auto grid md:grid-cols-2 gap-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="glass-card p-6 animate-pulse">
                <div className="h-48 bg-white/5 rounded" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      {!loading && current && (
        <main className="px-4 sm:px-6 pb-24 relative z-10">
          <div className="max-w-[1400px] mx-auto space-y-8">

            {/* Current Conditions + Radar */}
            <Sec delay={0}>
              <div className="grid lg:grid-cols-[1fr_1.3fr] gap-6">
                <CurrentConditions data={current} />
                <RadarEmbed />
              </div>
            </Sec>

            {/* Hourly */}
            <Sec delay={0.05}>
              <HourlyChart hours={hourly} />
            </Sec>

            {/* 7-Day + Precip + Wind + Sun */}
            <Sec delay={0.1}>
              <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6">
                <DailyForecast days={daily} />
                <div className="space-y-6">
                  <PrecipTimeline hours={hourly} />
                </div>
              </div>
            </Sec>

            {/* Wind + Sun + Air Quality */}
            <Sec delay={0.15}>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <WindCompass speed={current.windSpeed} direction={current.windDir} />
                <SunTimes sunrise={sunrise} sunset={sunset} />
                <AirQuality />
              </div>
            </Sec>

          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 border-t border-white/5 relative z-10">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <p className="text-white/25 text-xs font-mono">&copy; {new Date().getFullYear()} Maxwell Nixon</p>
            <span className="text-white/10">|</span>
            <p className="text-white/20 text-[10px] font-mono">Data from Open-Meteo, Windy</p>
          </div>
          <div className="flex gap-4">
            <Link href="/" className="text-white/30 hover:text-cyan-400 transition-colors text-xs font-mono">Home</Link>
            <Link href="/space" className="text-white/30 hover:text-cyan-400 transition-colors text-xs font-mono">Space</Link>
            <Link href="/tools" className="text-white/30 hover:text-cyan-400 transition-colors text-xs font-mono">Tools</Link>
            <Link href="/play" className="text-white/30 hover:text-cyan-400 transition-colors text-xs font-mono">Arcade</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
