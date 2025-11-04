"use client";
import { useEffect, useState } from "react";
const themes = [
  { key: "default", label: "Studio" },
  { key: "obsidian", label: "Obsidian" },
  { key: "aurora", label: "Aurora" },
];
export function ThemePicker() {
  const [theme, setTheme] = useState("default");
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme === "default" ? "" : theme);
  }, [theme]);
  return (
    <div className="flex gap-2">
      {themes.map(t => (
        <button key={t.key} onClick={()=> setTheme(t.key)} className={`px-3 py-1 rounded-lg ${theme===t.key?'bg-accent text-black':'bg-white/10'}`} title={t.label}>
          {t.label}
        </button>
      ))}
    </div>
  );
}
