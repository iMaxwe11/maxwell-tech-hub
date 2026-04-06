"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

export function WeatherRadar() {
  const [weather, setWeather] = useState<any>(null);
  const [showRadar, setShowRadar] = useState(false);
  const [radarTimestamps, setRadarTimestamps] = useState<any[]>([]);
  const [radarFrame, setRadarFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch current weather
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=39.7526&longitude=-74.9749&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation&hourly=precipitation_probability,precipitation&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=America/New_York&forecast_days=1"
        );
        const data = await res.json();
        setWeather(data);
      } catch (e) {
        console.error("Weather error:", e);
      }
    };
    fetchWeather();
    const interval = setInterval(fetchWeather, 600000);
    return () => clearInterval(interval);
  }, []);

  // Fetch RainViewer radar timestamps
  useEffect(() => {
    const fetchRadar = async () => {
      try {
        const res = await fetch("https://api.rainviewer.com/public/weather-maps.json");
        const data = await res.json();
        if (data?.radar?.past) {
          setRadarTimestamps(data.radar.past);
          setRadarFrame(data.radar.past.length - 1);
        }
      } catch (e) {
        console.error("Radar error:", e);
      }
    };
    fetchRadar();
    const interval = setInterval(fetchRadar, 300000);
    return () => clearInterval(interval);
  }, []);

  // Animation playback
  useEffect(() => {
    if (playing && radarTimestamps.length > 0) {
      intervalRef.current = setInterval(() => {
        setRadarFrame((prev) => (prev + 1) % radarTimestamps.length);
      }, 500);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, radarTimestamps.length]);

  if (!weather) {
    return (
      <div className="glass-card p-6 animate-pulse">
        <div className="h-64 bg-white/5 rounded" />
      </div>
    );
  }

  const current = weather.current;
  const forecast = weather.hourly;
  const getWeatherIcon = (code: number) => {
    if (code === 0) return "☀️";
    if (code <= 3) return "🌤️";
    if (code <= 48) return "☁️";
    if (code <= 67) return "🌧️";
    if (code <= 77) return "🌨️";
    return "⛈️";
  };

  const temp = Math.round(current.temperature_2m);
  const feelsLike = Math.round(current.apparent_temperature);
  const humidity = current.relative_humidity_2m;
  const windSpeed = Math.round(current.wind_speed_10m);
  const precipitation = current.precipitation || 0;
  const icon = getWeatherIcon(current.weather_code);

  const now = new Date().getHours();
  const nextHours = forecast
    ? forecast.precipitation_probability.slice(now, now + 6)
    : [];

  const currentTimestamp = radarTimestamps[radarFrame];
  const tileUrl = currentTimestamp
    ? `https://tilecache.rainviewer.com/v2/radar/${currentTimestamp.path}/256/{z}/{x}/{y}/2/1_1.png`
    : null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          Weather Radar
        </h3>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowRadar(!showRadar)}
          className={`text-xs font-mono px-3 py-1.5 rounded-lg border transition-all ${
            showRadar
              ? "bg-cyan-400/10 text-cyan-400 border-cyan-400/30"
              : "bg-white/5 text-white/50 border-white/10 hover:border-white/20"
          }`}
        >
          {showRadar ? "Hide Radar" : "Show Radar"}
        </motion.button>
      </div>

      {/* Current conditions */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-4xl font-bold text-white">{temp}°F</div>
          <div className="text-xs text-white/60">Feels like {feelsLike}°</div>
        </div>
        <div className="text-right space-y-1">
          <div className="text-sm text-white/70">💧 {humidity}%</div>
          <div className="text-sm text-white/70">💨 {windSpeed} mph</div>
          {precipitation > 0 && (
            <div className="text-sm text-cyan-400">🌧️ {precipitation}"</div>
          )}
        </div>
      </div>

      {/* Embedded Radar Map */}
      {showRadar && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-4"
        >
          <div className="relative rounded-xl overflow-hidden border border-white/10" style={{ height: 280 }}>
            <iframe
              src="https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=in&metricTemp=%C2%B0F&metricWind=mph&zoom=8&overlay=radar&product=radar&level=surface&lat=39.75&lon=-74.97&detailLat=39.75&detailLon=-74.97&marker=true&pressure=true&message=true"
              style={{ width: "100%", height: "100%", border: "none", borderRadius: 12 }}
              title="Weather Radar"
              loading="lazy"
              allow="fullscreen"
            />
            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-[9px] text-white/50 font-mono px-2 py-1 rounded">
              Powered by Windy.com
            </div>
          </div>

          {/* RainViewer timeline */}
          {radarTimestamps.length > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setPlaying(!playing)}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 transition-colors"
              >
                {playing ? (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                ) : (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                )}
              </motion.button>
              <input
                type="range"
                min={0}
                max={radarTimestamps.length - 1}
                value={radarFrame}
                onChange={(e) => { setPlaying(false); setRadarFrame(+e.target.value); }}
                className="flex-1 h-1 appearance-none bg-white/10 rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400"
              />
              <span className="text-[10px] text-white/40 font-mono w-14 text-right">
                {currentTimestamp
                  ? new Date(currentTimestamp.time * 1000).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
                  : "--:--"}
              </span>
            </div>
          )}
        </motion.div>
      )}

      {/* Rain probability chart */}
      <div className="space-y-2">
        <div className="text-xs font-mono text-white/50 uppercase tracking-wider">
          Rain Probability (Next 6 Hours)
        </div>
        <div className="flex items-end gap-1 h-24">
          {nextHours.map((prob: number, i: number) => {
            const height = Math.max(prob, 5);
            const color = prob > 70 ? "bg-cyan-400" : prob > 40 ? "bg-blue-400" : "bg-blue-600/50";
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-[10px] text-white/60 font-mono">{prob}%</div>
                <div
                  className={`w-full rounded-t ${color} transition-all`}
                  style={{ height: `${height}%` }}
                />
                <div className="text-[9px] text-white/40 font-mono">
                  {(now + i) % 24}h
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
