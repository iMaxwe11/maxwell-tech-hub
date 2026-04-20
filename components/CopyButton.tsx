"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface CopyButtonProps {
  value: string;
  /** Tooltip/aria label */
  label?: string;
  /** Visual size */
  size?: "sm" | "md";
  /** Optional className for the container button */
  className?: string;
}

/**
 * Copy-to-clipboard button with inline confirmation micro-toast.
 * The toast lives adjacent to the button itself — no portal needed.
 */
export function CopyButton({ value, label = "Copy to clipboard", size = "sm", className = "" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  const handle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setFailed(false);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setFailed(true);
      setTimeout(() => setFailed(false), 2200);
    }
  };

  const dims = size === "md" ? "w-8 h-8" : "w-6 h-6";
  const icon = size === "md" ? 14 : 12;

  return (
    <span className={`relative inline-flex ${className}`}>
      <button
        type="button"
        onClick={handle}
        aria-label={label}
        title={label}
        className={`${dims} inline-flex items-center justify-center rounded-md
                    text-white/40 hover:text-cyan-400 bg-white/[0.04] hover:bg-white/[0.08]
                    border border-white/[0.06] hover:border-cyan-400/30
                    transition-[color,background-color,border-color] shrink-0`}
      >
        <AnimatePresence mode="wait">
          {copied ? (
            <motion.svg
              key="check"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ duration: 0.15 }}
              width={icon}
              height={icon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-green-400"
            >
              <path d="M20 6L9 17l-5-5" />
            </motion.svg>
          ) : (
            <motion.svg
              key="copy"
              initial={{ scale: 0.9, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.15 }}
              width={icon}
              height={icon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </motion.svg>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {(copied || failed) && (
          <motion.span
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.16 }}
            role="status"
            aria-live="polite"
            className={`absolute left-1/2 top-full -translate-x-1/2 mt-1.5
                        px-2 py-0.5 rounded-md text-[10px] font-mono whitespace-nowrap
                        border pointer-events-none z-20
                        ${
                          copied
                            ? "bg-green-400/10 text-green-400 border-green-400/25"
                            : "bg-red-400/10 text-red-400 border-red-400/25"
                        }`}
          >
            {copied ? "Copied!" : "Failed"}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
