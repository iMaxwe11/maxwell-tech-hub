"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface WeatherData {
  temp: number;
  feels_like: number;
  description: string;
  humidity: number;
  wind_speed: number;
  wind_direction: number;
  icon: string;
  city: string;
  precip: number;
  uv_index: number;
  hourly_forecast: Array<{ time: string; temp: number; pop: number }>;
  daily_forecast: Array<{ day: string; high: number; low: number; icon: string; pop: number }>;
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchWeather = async () => {
    try {
      setError(false);
      // Southampton, NJ coordinates
      const lat = 39.9526;
      const lon = -74.7146;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,uv_index&hourly=temperature_2m,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=America%2FNew_York&forecast_days=7`,
        { signal: controller.signal }
      );
      clearTimeout(timeout);

      if (!response.ok) throw new Error("Weather API failed");
      const data = await response.json();

      const weatherCode = data.current.weather_code;
      const currentHour = new Date().getHours();

      const hourly_forecast = data.hourly.time
        .slice(currentHour, currentHour + 12)
        .map((time: string, i: number) => ({
          time: new Date(time).toLocaleTimeString("en-US", { hour: "numeric" }),
          temp: Math.round(data.hourly.temperature_2m[currentHour + i]),
          pop: data.hourly.precipitation_probability[currentHour + i] || 0,
        }));

      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const daily_forecast = data.daily.time.slice(0, 7).map((date: string, i: number) => {
        const d = new Date(date + "T12:00:00");
        return {
          day: i === 0 ? "Today" : dayNames[d.getDay()],
          high: Math.round(data.daily.temperature_2m_max[i]),
          low: Math.round(data.daily.temperature_2m_min[i]),
          icon: getWeatherIcon(data.daily.weather_code[i]),
          pop: data.daily.precipitation_probability_max[i] || 0,
        };
      });

      setWeather({
        temp: Math.round(data.current.temperature_2m),
        feels_like: Math.round(data.current.apparent_temperature),
        description: getWeatherDescription(weatherCode),
        humidity: data.current.relative_humidity_2m,
        wind_speed: Math.round(data.current.wind_speed_10m),
        wind_direction: data.current.wind_direction_10m,
        icon: getWeatherIcon(weatherCode),
        city: "Southampton, NJ",
        precip: data.current.precipitation,
        uv_index: Math.round(data.current.uv_index),
        hourly_forecast,
        daily_forecast,
      });
      setLoading(false);
    } catch (err) {
      console.error("Weather fetch error:", err);
      setError(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !weather) {
    return (
      <div className="glass-card p-6 min-h-[280px]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-white/5 animate-pulse" />
          <div className="space-y-1">
            <div className="w-32 h-4 bg-white/5 rounded animate-pulse" />
            <div className="w-20 h-3 bg-white/5 rounded animate-pulse" />
          </div>
        </div>
        <div className="w-20 h-12 bg-white/5 rounded animate-pulse mb-4" />
        <div className="grid grid-cols-4 gap-2">
          {[1,2,3,4].map(i => <div key={i} className="h-16 bg-white/5 rounded animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="glass-card p-6">
        <p className="text-white/40 text-sm">Weather data temporarily unavailable.</p>
        <button onClick={fetchWeather} className="mt-2 text-xs text-cyan-400 hover:text-cyan-300 font-mono">Retry</button>
      </div>
    );
  }

  const tempColor = weather.temp >= 85 ? "#ef4444" : weather.temp >= 70 ? "#f59e0b" : weather.temp >= 50 ? "#22c55e" : "#3b82f6";
  const windDir = getWindDirection(weather.wind_direction);
  const uvLevel = weather.uv_index <= 2 ? "Low" : weather.uv_index <= 5 ? "Moderate" : weather.uv_index <= 7 ? "High" : "Very High";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 hover:bg-white/[0.08] transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-white/90 font-semibold text-sm">{weather.city}</h3>
          <p className="text-white/50 text-xs mt-0.5">{weather.description}</p>
        </div>
        <div className="text-4xl">{weather.icon}</div>
      </div>

      {/* Temperature */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold" style={{ color: tempColor }}>{weather.temp}°</span>
          <span className="text-white/40 text-sm">Feels {weather.feels_like}°F</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mb-4 pb-4 border-b border-white/10">
        <div className="text-center">
          <span className="text-lg block">💧</span>
          <p className="text-white/40 text-[10px]">Humidity</p>
          <p className="text-white text-xs font-medium">{weather.humidity}%</p>
        </div>
        <div className="text-center">
          <span className="text-lg block">💨</span>
          <p className="text-white/40 text-[10px]">Wind</p>
          <p className="text-white text-xs font-medium">{weather.wind_speed} {windDir}</p>
        </div>
        <div className="text-center">
          <span className="text-lg block">☀️</span>
          <p className="text-white/40 text-[10px]">UV Index</p>
          <p className="text-white text-xs font-medium">{weather.uv_index} {uvLevel}</p>
        </div>
        <div className="text-center">
          <span className="text-lg block">🌧️</span>
          <p className="text-white/40 text-[10px]">Precip</p>
          <p className="text-white text-xs font-medium">{weather.precip}&quot;</p>
        </div>
      </div>

      {/* Hourly */}
      <div className="mb-4 pb-4 border-b border-white/10">
        <p className="text-white/50 text-[10px] font-mono uppercase tracking-wider mb-2">Next 12 Hours</p>
        <div className="grid grid-cols-6 gap-1.5">
          {weather.hourly_forecast.slice(0, 6).map((hour, i) => (
            <div key={i} className="text-center">
              <p className="text-white/30 text-[9px]">{hour.time}</p>
              <p className="text-white text-xs font-medium my-0.5">{hour.temp}°</p>
              {hour.pop > 0 && (
                <p className="text-cyan-400/60 text-[9px]">{hour.pop}%</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 7-Day */}
      <div>
        <p className="text-white/50 text-[10px] font-mono uppercase tracking-wider mb-2">7-Day Forecast</p>
        <div className="space-y-1.5">
          {weather.daily_forecast.map((day, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="text-white/60 w-10 font-medium">{day.day}</span>
              <span className="text-sm">{day.icon}</span>
              {day.pop > 20 && <span className="text-cyan-400/60 text-[10px] w-8 text-right">{day.pop}%</span>}
              {day.pop <= 20 && <span className="w-8" />}
              <div className="flex items-center gap-1">
                <span className="text-white/40 font-mono">{day.low}°</span>
                <div className="w-12 h-1 rounded-full bg-white/10 relative overflow-hidden">
                  <div className="absolute inset-y-0 rounded-full" style={{
                    left: `${Math.max(0, (day.low - 20) / 80 * 100)}%`,
                    right: `${Math.max(0, 100 - (day.high - 20) / 80 * 100)}%`,
                    background: `linear-gradient(90deg, #3b82f6, ${day.high >= 80 ? '#ef4444' : day.high >= 60 ? '#f59e0b' : '#22c55e'})`,
                  }} />
                </div>
                <span className="text-white font-mono">{day.high}°</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Radar */}
      <a href="https://weather.com/weather/radar/interactive/l/39.95,-74.71"
        target="_blank" rel="noopener noreferrer"
        className="mt-4 flex items-center justify-center gap-2 text-cyan-400 hover:text-cyan-300 text-xs font-medium transition-colors py-2 px-3 rounded-lg hover:bg-cyan-400/10">
        <span>View Radar</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
        </svg>
      </a>
    </motion.div>
  );
}

function getWindDirection(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

function getWeatherDescription(code: number): string {
  const codes: Record<number, string> = {
    0: "Clear Sky", 1: "Mainly Clear", 2: "Partly Cloudy", 3: "Overcast",
    45: "Foggy", 48: "Rime Fog", 51: "Light Drizzle", 53: "Moderate Drizzle",
    55: "Dense Drizzle", 61: "Light Rain", 63: "Moderate Rain", 65: "Heavy Rain",
    66: "Freezing Rain", 67: "Heavy Freezing Rain",
    71: "Light Snow", 73: "Moderate Snow", 75: "Heavy Snow", 77: "Snow Grains",
    80: "Light Showers", 81: "Moderate Showers", 82: "Heavy Showers",
    85: "Light Snow Showers", 86: "Heavy Snow Showers",
    95: "Thunderstorm", 96: "Thunderstorm + Hail", 99: "Severe Thunderstorm",
  };
  return codes[code] || "Unknown";
}

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
