"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface WeatherData {
  temp: number;
  feels_like: number;
  description: string;
  humidity: number;
  wind_speed: number;
  icon: string;
  city: string;
  hourly_forecast: Array<{
    time: string;
    temp: number;
    pop: number; // probability of precipitation
  }>;
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError(false);
      
      // Sicklerville, NJ coordinates
      const lat = 39.7526;
      const lon = -74.9749;
      
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=America%2FNew_York&forecast_days=1`
      );
      
      if (!response.ok) throw new Error("Weather API failed");
      
      const data = await response.json();
      
      // Get weather description from code
      const weatherCode = data.current.weather_code;
      const description = getWeatherDescription(weatherCode);
      const icon = getWeatherIcon(weatherCode);
      
      // Get next 12 hours forecast
      const currentHour = new Date().getHours();
      const hourly_forecast = data.hourly.time
        .slice(currentHour, currentHour + 12)
        .map((time: string, i: number) => ({
          time: new Date(time).toLocaleTimeString('en-US', { hour: 'numeric' }),
          temp: Math.round(data.hourly.temperature_2m[currentHour + i]),
          pop: data.hourly.precipitation_probability[currentHour + i] || 0,
        }));
      
      setWeather({
        temp: Math.round(data.current.temperature_2m),
        feels_like: Math.round(data.current.apparent_temperature),
        description,
        humidity: data.current.relative_humidity_2m,
        wind_speed: Math.round(data.current.wind_speed_10m),
        icon,
        city: "Sicklerville, NJ",
        hourly_forecast,
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
    const interval = setInterval(fetchWeather, 10 * 60 * 1000); // 10 min
    return () => clearInterval(interval);
  }, []);

  if (loading && !weather) {
    return (
      <div className="glass-card p-6 flex items-center justify-center min-h-[200px]">
        <div className="animate-pulse text-white/40">Loading weather...</div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="glass-card p-6">
        <p className="text-white/40 text-sm">Weather unavailable</p>
      </div>
    );
  }

  const tempColor = weather.temp >= 80 ? "#ef4444" : weather.temp >= 60 ? "#f59e0b" : "#3b82f6";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 hover:bg-white/[0.08] transition-all duration-300 group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-white/90 font-semibold text-sm">{weather.city}</h3>
          <p className="text-white/50 text-xs mt-0.5">{weather.description}</p>
        </div>
        <div className="text-4xl opacity-80">{weather.icon}</div>
      </div>

      {/* Main Temp */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold text-white" style={{ color: tempColor }}>
            {weather.temp}°
          </span>
          <span className="text-white/40 text-sm">Feels {weather.feels_like}°</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-xl">💧</span>
          <div>
            <p className="text-white/40 text-xs">Humidity</p>
            <p className="text-white text-sm font-medium">{weather.humidity}%</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl">💨</span>
          <div>
            <p className="text-white/40 text-xs">Wind</p>
            <p className="text-white text-sm font-medium">{weather.wind_speed} mph</p>
          </div>
        </div>
      </div>

      {/* 12-Hour Forecast */}
      <div className="space-y-2">
        <p className="text-white/60 text-xs font-medium mb-3">Next 12 Hours</p>
        <div className="grid grid-cols-6 gap-2">
          {weather.hourly_forecast.slice(0, 6).map((hour, i) => (
            <div key={i} className="text-center">
              <p className="text-white/40 text-[10px] mb-1">{hour.time}</p>
              <p className="text-white text-sm font-medium mb-1">{hour.temp}°</p>
              {hour.pop > 0 && (
                <div className="w-full bg-white/10 rounded-full h-1">
                  <div
                    className="h-full rounded-full bg-cyan-400/60"
                    style={{ width: `${hour.pop}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Radar Link */}
      <a
        href="https://weather.com/weather/radar/interactive/l/39.75,-74.97"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex items-center justify-center gap-2 text-cyan-400 hover:text-cyan-300 text-xs font-medium transition-colors py-2 px-3 rounded-lg hover:bg-cyan-400/10"
      >
        <span>View Radar</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
        </svg>
      </a>
    </motion.div>
  );
}

function getWeatherDescription(code: number): string {
  const codes: Record<number, string> = {
    0: "Clear Sky",
    1: "Mainly Clear",
    2: "Partly Cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Foggy",
    51: "Light Drizzle",
    53: "Moderate Drizzle",
    55: "Dense Drizzle",
    61: "Light Rain",
    63: "Moderate Rain",
    65: "Heavy Rain",
    71: "Light Snow",
    73: "Moderate Snow",
    75: "Heavy Snow",
    77: "Snow Grains",
    80: "Light Showers",
    81: "Moderate Showers",
    82: "Violent Showers",
    85: "Light Snow Showers",
    86: "Heavy Snow Showers",
    95: "Thunderstorm",
    96: "Thunderstorm with Hail",
    99: "Severe Thunderstorm",
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
