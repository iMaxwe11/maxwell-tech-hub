"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Shortcut = { keys: string[]; label: string };

const SHORTCUTS: { group: string; items: Shortcut[] }[] = [
  {
    group: "Navigation",
    items: [
      { keys: ["⌘", "K"], label: "Open command palette" },
      { keys: ["Ctrl", "K"], label: "Open command palette (Windows/Linux)" },
      { keys: ["?"], label: "Show this help" },
      { keys: ["Esc"], label: "Close dialogs & palettes" },
    ],
  },
  {
    group: "Terminal (on /terminal)",
    items: [
      { keys: ["↑", "↓"], label: "Command history" },
      { keys: ["Tab"], label: "Autocomplete command" },
      { keys: ["Ctrl", "L"], label: "Clear terminal" },
      { keys: ["cd", "tools"], label: "Navigate to page (try: projects, space, weather)" },
    ],
  },
  {
    group: "Secrets",
    items: [
      { keys: ["↑", "↑", "↓", "↓", "← →", "B A"], label: "Try it — something happens" },
    ],
  },
];

function Keycap({ label }: { label: string }) {
  return (
    <kbd
      className="min-w-[1.75rem] px-2 py-1 text-[11px] font-mono text-white/80 rounded-md
                 bg-white/[0.06] border border-white/[0.12]
                 shadow-[inset_0_-1px_0_rgba(0,0,0,0.3),0_1px_0_rgba(255,255,255,0.04)]
                 text-center leading-none"
    >
      {label}
    </kbd>
  );
}

export function KeyboardShortcuts() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Ignore when user is typing
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      const isEditable =
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        target?.isContentEditable;
      if (isEditable) return;

      // '?' opens (shift + /)
      if (e.key === "?" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Keyboard shortcuts"
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl rounded-2xl border border-white/10
                       bg-[#0b0b10]/95 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.6)]
                       overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-white/40">
                  Help
                </p>
                <h2 className="text-white font-semibold text-lg">Keyboard Shortcuts</h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-white/40 hover:text-white/80 text-xs font-mono px-2 py-1 rounded border border-white/10 hover:border-white/20 transition-colors"
                aria-label="Close"
              >
                Esc
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-6 max-h-[70vh] overflow-y-auto">
              {SHORTCUTS.map((group) => (
                <div key={group.group}>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-cyan-400/70 mb-3">
                    {group.group}
                  </p>
                  <div className="space-y-2">
                    {group.items.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-4 py-1"
                      >
                        <span className="text-sm text-white/70">{item.label}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {item.keys.map((k, j) => (
                            <Keycap key={j} label={k} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer tip */}
            <div className="px-6 py-3 border-t border-white/5 bg-white/[0.015]">
              <p className="text-[11px] font-mono text-white/35">
                Tip: press <Keycap label="?" /> anywhere to reopen this.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
