"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { copyToClipboard, toast } from "@/lib/toast";
import { Section } from "../shared";

interface ShadowLayer {
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
  inset: boolean;
}

export function ShadowGenerator() {
  const [shadows, setShadows] = useState<ShadowLayer[]>([
    { x: 0, y: 12, blur: 30, spread: -4, color: "#000000", opacity: 0.35, inset: false },
    { x: 0, y: 2, blur: 6, spread: 0, color: "#06b6d4", opacity: 0.35, inset: false },
  ]);

  const renderLayer = (s: ShadowLayer) => {
    const c = s.color.replace("#", "");
    const r = parseInt(c.slice(0, 2), 16) || 0;
    const g = parseInt(c.slice(2, 4), 16) || 0;
    const b = parseInt(c.slice(4, 6), 16) || 0;
    return `${s.inset ? "inset " : ""}${s.x}px ${s.y}px ${s.blur}px ${s.spread}px rgba(${r}, ${g}, ${b}, ${s.opacity})`;
  };

  const cssValue = shadows.map(renderLayer).join(", ");
  const cssMultiLine = shadows.map(renderLayer).join(",\n             ");

  const update = (i: number, patch: Partial<ShadowLayer>) => {
    setShadows((prev) => prev.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  };
  const remove = (i: number) =>
    setShadows((prev) => (prev.length > 1 ? prev.filter((_, j) => j !== i) : prev));
  const add = () =>
    setShadows((prev) => [
      ...prev,
      { x: 0, y: 4, blur: 12, spread: 0, color: "#a855f7", opacity: 0.3, inset: false },
    ]);
  const reset = () => {
    setShadows([
      { x: 0, y: 12, blur: 30, spread: -4, color: "#000000", opacity: 0.35, inset: false },
      { x: 0, y: 2, blur: 6, spread: 0, color: "#06b6d4", opacity: 0.35, inset: false },
    ]);
    toast("Reset to defaults", "info");
  };

  const sliders: Array<[string, keyof ShadowLayer, number, number, string]> = [
    ["X", "x", -50, 50, "px"],
    ["Y", "y", -50, 50, "px"],
    ["Blur", "blur", 0, 100, "px"],
    ["Spread", "spread", -50, 50, "px"],
  ];

  return (
    <Section
      id="shadow"
      title="Box Shadow Generator"
      desc="Multi-layer CSS box-shadow with live preview."
      accent="purple"
      index={34}
    >
      <div className="grid md:grid-cols-[1fr_300px] gap-5">
        {/* Preview */}
        <div
          className="flex items-center justify-center min-h-[260px] rounded-xl p-8 border border-white/[0.06]"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.04), transparent), repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0 8px, transparent 8px 16px)",
          }}
        >
          <motion.div
            layout
            className="w-36 h-36 rounded-2xl bg-white/95"
            style={{ boxShadow: cssValue }}
          />
        </div>
        {/* Controls */}
        <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
          {shadows.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-white/[0.08] bg-black/20 p-3 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-[family-name:var(--font-mono)] text-white/40 uppercase tracking-wider">
                  Layer {i + 1}
                </span>
                <div className="flex items-center gap-1.5">
                  <label className="text-[10px] font-[family-name:var(--font-mono)] text-white/55 flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={s.inset}
                      onChange={(e) => update(i, { inset: e.target.checked })}
                      className="accent-[var(--accent-purple)]"
                    />{" "}
                    inset
                  </label>
                  <button
                    onClick={() => remove(i)}
                    disabled={shadows.length <= 1}
                    aria-label="Remove layer"
                    className="text-white/30 hover:text-red-400 text-base leading-none w-5 h-5 rounded hover:bg-red-400/10 disabled:opacity-20 disabled:cursor-not-allowed"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {sliders.map(([label, key, min, max, unit]) => {
                  const v = s[key] as number;
                  return (
                    <label
                      key={key as string}
                      className="text-[9px] font-[family-name:var(--font-mono)] text-white/40 uppercase tracking-wider flex flex-col gap-1"
                    >
                      <span className="flex justify-between">
                        <span>{label}</span>
                        <span className="text-white/60 normal-case">
                          {v}
                          {unit}
                        </span>
                      </span>
                      <input
                        type="range"
                        min={min}
                        max={max}
                        value={v}
                        onChange={(e) =>
                          update(i, { [key]: parseInt(e.target.value, 10) } as Partial<ShadowLayer>)
                        }
                        className="w-full accent-[var(--accent-purple)]"
                      />
                    </label>
                  );
                })}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={s.color}
                  onChange={(e) => update(i, { color: e.target.value })}
                  aria-label={`Layer ${i + 1} color`}
                  className="w-7 h-7 rounded border border-white/10 cursor-pointer"
                />
                <label className="flex-1 text-[9px] font-[family-name:var(--font-mono)] text-white/40 uppercase tracking-wider flex flex-col gap-0.5">
                  <span className="flex justify-between">
                    <span>Opacity</span>
                    <span className="text-white/60 normal-case">
                      {Math.round(s.opacity * 100)}%
                    </span>
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={s.opacity * 100}
                    onChange={(e) => update(i, { opacity: parseInt(e.target.value, 10) / 100 })}
                    className="w-full accent-[var(--accent-purple)]"
                  />
                </label>
              </div>
            </motion.div>
          ))}
          <div className="grid grid-cols-2 gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={add}
              className="tool-btn text-xs"
            >
              + Add layer
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={reset}
              className="tool-btn text-xs"
            >
              Reset
            </motion.button>
          </div>
        </div>
      </div>
      <div className="mt-4 rounded-lg bg-black/30 border border-white/[0.06] p-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <pre className="text-[11px] font-[family-name:var(--font-mono)] text-[var(--accent-cyan)] whitespace-pre-wrap flex-1 min-w-[200px]">{`box-shadow: ${cssMultiLine};`}</pre>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => copyToClipboard(`box-shadow: ${cssValue};`, "CSS copied")}
            className="tool-btn-primary tool-btn shrink-0"
          >
            Copy CSS
          </motion.button>
        </div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════
   PAGE LAYOUT
   ═══════════════════════════════════════════ */
