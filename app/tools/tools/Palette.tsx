"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { copyToClipboard } from "@/lib/toast";
import { Section } from "../shared";

export function Palette() {
  const [h, setH] = useState(200); const [s, setS] = useState(100); const [l, setL] = useState(60); const [copied, setCopied] = useState(false);
  const color = `hsl(${h} ${s}% ${l}%)`;
  const hslToRgb = useCallback((hue: number, sat: number, light: number) => {
    const saturation = sat / 100;
    const brightness = light / 100;
    const chroma = (1 - Math.abs(2 * brightness - 1)) * saturation;
    const segment = hue / 60;
    const x = chroma * (1 - Math.abs((segment % 2) - 1));
    let r = 0, g = 0, b = 0;

    if (segment >= 0 && segment < 1) [r, g, b] = [chroma, x, 0];
    else if (segment < 2) [r, g, b] = [x, chroma, 0];
    else if (segment < 3) [r, g, b] = [0, chroma, x];
    else if (segment < 4) [r, g, b] = [0, x, chroma];
    else if (segment < 5) [r, g, b] = [x, 0, chroma];
    else [r, g, b] = [chroma, 0, x];

    const match = brightness - chroma / 2;
    return [r, g, b].map((channel) => Math.round((channel + match) * 255));
  }, []);
  const [r, g, b] = useMemo(() => hslToRgb(h, s, l), [h, s, l, hslToRgb]);
  const hex = useMemo(
    () =>
      `#${[r, g, b]
        .map((channel) => channel.toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase()}`,
    [r, g, b],
  );
  const paletteControls = [
    { label: "Hue", value: h, setValue: setH, max: 360 },
    { label: "Sat", value: s, setValue: setS, max: 100 },
    { label: "Light", value: l, setValue: setL, max: 100 },
  ] as const;
  const swatches = [20, 35, 50, 65, 80];
  function copy(value = `hsl(${h} ${s}% ${l}%)`) { copyToClipboard(value); setCopied(true); setTimeout(() => setCopied(false), 1500); }
  function randomize() {
    setH(Math.floor(Math.random() * 361));
    setS(Math.floor(Math.random() * 41) + 55);
    setL(Math.floor(Math.random() * 31) + 35);
  }
  return (
    <Section id="palette" title="Color Palette" desc="Generate a quick palette, randomize a colorway, and copy CSS-ready values." accent="purple" index={0}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
        <motion.div whileHover={{ scale: 1.05, rotate: 2 }} transition={{ type: "spring", stiffness: 300 }}
          className="w-full sm:w-40 h-24 sm:h-28 rounded-xl border border-white/10 shadow-lg cursor-pointer" style={{ background: color, boxShadow: `0 8px 30px ${color}33` }} onClick={() => copy()} />
        <div className="flex-1 w-full grid sm:grid-cols-3 gap-3 sm:gap-4">
          {paletteControls.map((control) => (
            <div key={control.label}><label className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)] uppercase tracking-wider">{control.label} <span className="text-[var(--accent-cyan)]">{control.value}</span></label>
              <input type="range" min="0" max={control.max} value={control.value} onChange={(e) => control.setValue(+e.target.value)} className="w-full mt-1 accent-[var(--accent-cyan)]" /></div>
          ))}
        </div>
      </div>
      <div className="mt-4 grid sm:grid-cols-3 gap-2">
        {[
          { label: "HSL", value: `hsl(${h} ${s}% ${l}%)` },
          { label: "RGB", value: `rgb(${r}, ${g}, ${b})` },
          { label: "HEX", value: hex },
        ].map((token) => (
          <motion.button
            key={token.label}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => copy(token.value)}
            className="rounded-lg border border-white/[0.05] bg-black/20 px-3 py-3 text-left transition-colors hover:border-white/10"
          >
            <div className="text-[0.6rem] uppercase tracking-[0.2em] text-[var(--text-muted)] font-[family-name:var(--font-mono)]">{token.label}</div>
            <div className="mt-1 text-sm text-[var(--accent-cyan)] font-[family-name:var(--font-mono)] break-all">{token.value}</div>
          </motion.button>
        ))}
      </div>
      <div className="mt-4 text-sm flex flex-wrap items-center gap-3 font-[family-name:var(--font-mono)]">
        <motion.button whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }} className="tool-btn-primary tool-btn" onClick={() => copy()}>
          <AnimatePresence mode="wait"><motion.span key={copied?"done":"copy"} initial={{ opacity:0, y:5 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-5 }}>{copied ? "✓ Copied!" : "Copy"}</motion.span></AnimatePresence>
        </motion.button>
        <motion.button whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }} className="tool-btn" onClick={randomize}>
          Randomize
        </motion.button>
      </div>
      <div className="mt-4 flex gap-1 rounded-lg overflow-hidden">
        {swatches.map((lt) => (
          <motion.div
            key={lt}
            whileHover={{ scaleY: 1.5 }}
            className="flex-1 h-6 cursor-pointer transition-transform"
            style={{ background: `hsl(${h} ${s}% ${lt}%)` }}
            onClick={() => {
              setL(lt);
              copy(`hsl(${h} ${s}% ${lt}%)`);
            }}
          />
        ))}
      </div>
    </Section>
  );
}
