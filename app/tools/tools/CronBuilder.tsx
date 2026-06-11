"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { copyToClipboard } from "@/lib/toast";
import { Section } from "../shared";

const CRON_PRESETS = [
  { label: "Every 15 min", value: "*/15 * * * *", detail: "Runs every quarter-hour." },
  { label: "Hourly", value: "0 * * * *", detail: "Runs once at the top of every hour." },
  { label: "Daily 9 AM", value: "0 9 * * *", detail: "Runs daily at 9:00 AM." },
  { label: "Weekdays 9 AM", value: "0 9 * * 1-5", detail: "Runs Monday through Friday at 9:00 AM." },
  { label: "Mondays 8 AM", value: "0 8 * * 1", detail: "Runs every Monday morning." },
] as const;

export function CronBuilder() {
  const [minute, setMinute] = useState("*/15");
  const [hour, setHour] = useState("*");
  const [dayOfMonth, setDayOfMonth] = useState("*");
  const [month, setMonth] = useState("*");
  const [dayOfWeek, setDayOfWeek] = useState("*");
  const expression = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;
  const explanation = useMemo(() => {
    const phrases = [
      minute === "*" ? "every minute" : minute.startsWith("*/") ? `every ${minute.slice(2)} minutes` : `at minute ${minute}`,
      hour === "*" ? "every hour" : `at hour ${hour}`,
      dayOfMonth === "*" ? "every day of the month" : `on day ${dayOfMonth}`,
      month === "*" ? "every month" : `in month ${month}`,
      dayOfWeek === "*" ? "every weekday" : `weekday ${dayOfWeek}`,
    ];
    return phrases.join(" • ");
  }, [dayOfMonth, dayOfWeek, hour, minute, month]);

  return (
    <Section id="cron" title="Cron Builder" desc="Build a five-field cron expression with presets and a plain-English summary." accent="gold" index={18}>
      <div className="flex flex-wrap gap-2 mb-4">
        {CRON_PRESETS.map((preset) => (
          <motion.button
            key={preset.value}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const [nextMinute, nextHour, nextDayOfMonth, nextMonth, nextDayOfWeek] = preset.value.split(" ");
              setMinute(nextMinute);
              setHour(nextHour);
              setDayOfMonth(nextDayOfMonth);
              setMonth(nextMonth);
              setDayOfWeek(nextDayOfWeek);
            }}
            className="px-3 py-2 rounded-lg border border-white/[0.06] bg-white/[0.03] text-[0.65rem] uppercase tracking-[0.18em] text-white/50 font-[family-name:var(--font-mono)]"
            title={preset.detail}
          >
            {preset.label}
          </motion.button>
        ))}
      </div>
      <div className="grid sm:grid-cols-5 gap-3">
        {[
          ["Minute", minute, setMinute, "*/15"],
          ["Hour", hour, setHour, "9"],
          ["Day", dayOfMonth, setDayOfMonth, "*"],
          ["Month", month, setMonth, "*"],
          ["Weekday", dayOfWeek, setDayOfWeek, "1-5"],
        ].map(([label, value, setter, placeholder]) => (
          <div key={label as string}>
            <label className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)] uppercase tracking-wider">{label as string}</label>
            <input
              className="tool-input neon-input mt-1"
              value={value as string}
              onChange={(event) => (setter as React.Dispatch<React.SetStateAction<string>>)(event.target.value)}
              placeholder={placeholder as string}
            />
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-xl border border-white/[0.05] bg-black/20 p-4">
        <div className="text-[0.6rem] uppercase tracking-[0.2em] text-[var(--text-muted)] font-[family-name:var(--font-mono)]">Expression</div>
        <div className="mt-2 text-lg text-[var(--accent-gold)] font-[family-name:var(--font-mono)] break-all">{expression}</div>
        <p className="mt-3 text-sm text-[var(--text-secondary)]">{explanation}</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <motion.button whileTap={{ scale: 0.95 }} className="tool-btn-primary tool-btn" onClick={() => copyToClipboard(expression)}>Copy Cron</motion.button>
        <motion.button whileTap={{ scale: 0.95 }} className="tool-btn" onClick={() => copyToClipboard(explanation)}>Copy Summary</motion.button>
      </div>
    </Section>
  );
}
