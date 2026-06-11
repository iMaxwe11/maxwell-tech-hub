"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { copyToClipboard } from "@/lib/toast";
import { Section } from "../shared";

const EMOJI_SET: { char: string; name: string; cat: string }[] = [
  // Faces
  { char: "😀", name: "grinning face happy", cat: "Face" },
  { char: "😂", name: "joy tears laughing lol", cat: "Face" },
  { char: "🥲", name: "smile tear", cat: "Face" },
  { char: "😍", name: "heart eyes love", cat: "Face" },
  { char: "🤔", name: "thinking consider hmm", cat: "Face" },
  { char: "😎", name: "sunglasses cool", cat: "Face" },
  { char: "🥳", name: "party celebrate hat", cat: "Face" },
  { char: "😴", name: "sleeping tired zzz", cat: "Face" },
  { char: "🤯", name: "mind blown explosion shocked", cat: "Face" },
  { char: "😭", name: "crying sad sob", cat: "Face" },
  { char: "🙃", name: "upside down face silly", cat: "Face" },
  { char: "😬", name: "grimace awkward", cat: "Face" },
  // Gestures
  { char: "👍", name: "thumbs up approve ok yes", cat: "Hand" },
  { char: "👎", name: "thumbs down reject no", cat: "Hand" },
  { char: "👋", name: "wave hello hi bye", cat: "Hand" },
  { char: "👏", name: "clap applause bravo", cat: "Hand" },
  { char: "🙏", name: "pray thanks please", cat: "Hand" },
  { char: "💪", name: "flex strong muscle", cat: "Hand" },
  { char: "🤝", name: "handshake deal agree", cat: "Hand" },
  { char: "✌️", name: "peace victory two fingers", cat: "Hand" },
  { char: "🤞", name: "fingers crossed hope luck", cat: "Hand" },
  { char: "👌", name: "ok perfect circle", cat: "Hand" },
  { char: "🫶", name: "heart hands love", cat: "Hand" },
  { char: "🤌", name: "pinched fingers italian", cat: "Hand" },
  // Symbols
  { char: "❤️", name: "heart red love", cat: "Symbol" },
  { char: "🧡", name: "heart orange", cat: "Symbol" },
  { char: "💛", name: "heart yellow", cat: "Symbol" },
  { char: "💚", name: "heart green", cat: "Symbol" },
  { char: "💙", name: "heart blue", cat: "Symbol" },
  { char: "💜", name: "heart purple", cat: "Symbol" },
  { char: "🖤", name: "heart black", cat: "Symbol" },
  { char: "💯", name: "hundred perfect 100", cat: "Symbol" },
  { char: "🔥", name: "fire hot lit", cat: "Symbol" },
  { char: "⭐", name: "star favorite", cat: "Symbol" },
  { char: "✨", name: "sparkles shine magic glitter", cat: "Symbol" },
  { char: "⚡", name: "lightning bolt fast zap", cat: "Symbol" },
  { char: "💡", name: "lightbulb idea", cat: "Symbol" },
  { char: "🎉", name: "party popper celebrate", cat: "Symbol" },
  { char: "🚀", name: "rocket launch fast ship", cat: "Symbol" },
  { char: "💰", name: "money bag cash", cat: "Symbol" },
  { char: "🏆", name: "trophy winner first", cat: "Symbol" },
  { char: "🎯", name: "target bullseye goal", cat: "Symbol" },
  // Tech
  { char: "💻", name: "laptop computer", cat: "Tech" },
  { char: "📱", name: "phone mobile iphone", cat: "Tech" },
  { char: "⌨️", name: "keyboard type", cat: "Tech" },
  { char: "🖥️", name: "desktop monitor computer", cat: "Tech" },
  { char: "💾", name: "floppy save disk", cat: "Tech" },
  { char: "🌐", name: "globe web internet world", cat: "Tech" },
  { char: "📡", name: "satellite signal antenna", cat: "Tech" },
  { char: "🔋", name: "battery power", cat: "Tech" },
  { char: "🔌", name: "plug electric power", cat: "Tech" },
  { char: "📶", name: "signal wifi bars", cat: "Tech" },
  { char: "🎮", name: "game controller", cat: "Tech" },
  { char: "🕹️", name: "joystick arcade", cat: "Tech" },
  // Arrows
  { char: "→", name: "arrow right next", cat: "Arrow" },
  { char: "←", name: "arrow left back previous", cat: "Arrow" },
  { char: "↑", name: "arrow up", cat: "Arrow" },
  { char: "↓", name: "arrow down", cat: "Arrow" },
  { char: "↗", name: "arrow up right diagonal", cat: "Arrow" },
  { char: "↘", name: "arrow down right diagonal", cat: "Arrow" },
  { char: "↙", name: "arrow down left diagonal", cat: "Arrow" },
  { char: "↖", name: "arrow up left diagonal", cat: "Arrow" },
  { char: "⇒", name: "arrow thick right implies", cat: "Arrow" },
  { char: "⇐", name: "arrow thick left", cat: "Arrow" },
  { char: "⇄", name: "arrows left right swap exchange", cat: "Arrow" },
  { char: "⟶", name: "long arrow right", cat: "Arrow" },
  // Marks
  { char: "✓", name: "check mark yes done", cat: "Mark" },
  { char: "✔", name: "check mark heavy", cat: "Mark" },
  { char: "✗", name: "cross x no wrong", cat: "Mark" },
  { char: "✘", name: "cross heavy no", cat: "Mark" },
  { char: "⚠️", name: "warning caution alert", cat: "Mark" },
  { char: "❓", name: "question mark unknown", cat: "Mark" },
  { char: "❗", name: "exclamation important", cat: "Mark" },
  { char: "ℹ️", name: "info information", cat: "Mark" },
  { char: "⭕", name: "circle hollow ok", cat: "Mark" },
  { char: "•", name: "bullet point dot", cat: "Mark" },
  { char: "—", name: "em dash long", cat: "Mark" },
  { char: "…", name: "ellipsis three dots", cat: "Mark" },
  // Math
  { char: "×", name: "multiply times cross", cat: "Math" },
  { char: "÷", name: "divide division", cat: "Math" },
  { char: "±", name: "plus minus plusminus", cat: "Math" },
  { char: "≈", name: "approximately equal", cat: "Math" },
  { char: "≠", name: "not equal", cat: "Math" },
  { char: "≤", name: "less than or equal", cat: "Math" },
  { char: "≥", name: "greater than or equal", cat: "Math" },
  { char: "∞", name: "infinity", cat: "Math" },
  { char: "π", name: "pi math", cat: "Math" },
  { char: "Σ", name: "sigma sum", cat: "Math" },
  { char: "√", name: "square root radical", cat: "Math" },
  { char: "°", name: "degree temperature", cat: "Math" },
];

export function EmojiPicker() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");
  const cats = useMemo(
    () => ["All", ...Array.from(new Set(EMOJI_SET.map((e) => e.cat)))],
    [],
  );
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return EMOJI_SET.filter((e) => {
      if (cat !== "All" && e.cat !== cat) return false;
      if (!query) return true;
      return e.name.includes(query) || e.char === query;
    });
  }, [q, cat]);

  return (
    <Section
      id="emoji"
      title="Emoji & Symbol Picker"
      desc="Search, click to copy — emojis, arrows, checks, math."
      accent="gold"
      index={33}
    >
      <div className="flex gap-2 mb-3 flex-wrap">
        <input
          className="tool-input neon-input flex-1 min-w-[160px]"
          placeholder="Search emojis… (e.g. rocket, heart, arrow)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search emojis"
        />
        <div className="flex gap-1 flex-wrap">
          {cats.map((c) => (
            <motion.button
              key={c}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCat(c)}
              className={`px-2.5 py-1.5 rounded-md text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-wider border transition-colors ${
                cat === c
                  ? "bg-[var(--accent-gold)]/15 text-[var(--accent-gold)] border-[var(--accent-gold)]/40"
                  : "bg-white/[0.02] text-white/40 border-white/[0.06] hover:text-white/70"
              }`}
            >
              {c}
            </motion.button>
          ))}
        </div>
      </div>
      {filtered.length > 0 ? (
        <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-12 gap-1.5">
          {filtered.map((e, i) => (
            <motion.button
              key={`${e.char}-${i}`}
              whileTap={{ scale: 0.85 }}
              whileHover={{ scale: 1.2, y: -2 }}
              onClick={() => copyToClipboard(e.char, `Copied ${e.char}`)}
              title={`${e.name} — click to copy`}
              aria-label={`Copy ${e.name}`}
              className="aspect-square rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05] hover:border-[var(--accent-gold)]/30 flex items-center justify-center text-xl transition-colors"
            >
              {e.char}
            </motion.button>
          ))}
        </div>
      ) : (
        <p className="text-center text-white/40 py-6 font-[family-name:var(--font-mono)] text-xs">
          No matches for &quot;{q}&quot;
        </p>
      )}
      <p className="mt-3 text-[10px] text-white/30 font-[family-name:var(--font-mono)] text-center">
        {filtered.length} shown · Click any symbol to copy
      </p>
    </Section>
  );
}
