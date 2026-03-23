"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function WeatherRadar() {
  const [weather, setWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=39.7526&longitude=-74.9749&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation&hourly=precipitation_probability,precipitation&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=America/New_York&forecast_days=1"
        );
        const data = await res.json();
        setWeather(data.current);
        setForecast(data.hourly);
      } catch (e) {
        console.error("Weather error:", e);
      }
    };
    fetchWeather();
    const interval = setInterval(fetchWeather, 600000);
    return () => clearInterval(interval);
  }, []);

  if (!weather) {
    return (
      <div className="glass-card p-6 animate-pulse">
        <div className="h-64 bg-white/5 rounded" />
      </div>
    );
  }

  const getWeatherIcon = (code: number) => {
    if (code === 0) return "☀️";
    if (code <= 3) return "🌤️";
    if (code <= 48) return "☁️";
    if (code <= 67) return "🌧️";
    if (code <= 77) return "🌨️";
    return "⛈️";
  };

  const temp = Math.round(weather.temperature_2m);
  const feelsLike = Math.round(weather.apparent_temperature);
  const humidity = weather.relative_humidity_2m;
  const windSpeed = Math.round(weather.wind_speed_10m);
  const precipitation = weather.precipitation || 0;
  const icon = getWeatherIcon(weather.weather_code);

  const now = new Date().getHours();
  const nextHours = forecast 
    ? forecast.precipitation_probability.slice(now, now + 6)
    : [];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="glass-card p-6">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        Weather Radar
      </h3>

      <div className="grid grid-cols-2 gap-4 mb-6">
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

      <div className="mt-4 pt-4 border-t border-white/10">
        <a
          href="https://weather.com/weather/radar/interactive/l/39.75,-74.97"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1">
          <span>View Full Radar Map</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
          </svg>
        </a>
      </div>
    </motion.div>
  );
}
