"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { copyToClipboard } from "@/lib/toast";
import { Section } from "../shared";

export function SlugStudio() {
  const [input, setInput] = useState("Maxwell Nixon Portfolio Launch Checklist");
  const slug = useMemo(() => {
    return input
      .normalize("NFKD")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .toLowerCase()
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }, [input]);
  const snake = slug.replace(/-/g, "_");

  return (
    <Section id="slug" title="Slug Studio" desc="Generate clean SEO slugs, URL paths, and snake case handles." accent="gold" index={14}>
      <textarea
        className="tool-input neon-input min-h-[120px] resize-none"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder="Paste a title, page name, or route label..."
      />
      <div className="mt-4 grid md:grid-cols-3 gap-3">
        {[
          { label: "Slug", value: slug || "-" },
          { label: "Snake", value: snake || "-" },
          { label: "Route", value: slug ? `/${slug}` : "/" },
        ].map((token) => (
          <motion.button
            key={token.label}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => copyToClipboard(token.value)}
            className="rounded-xl border border-white/[0.05] bg-black/20 p-4 text-left"
          >
            <div className="text-[0.6rem] uppercase tracking-[0.2em] text-[var(--text-muted)] font-[family-name:var(--font-mono)]">{token.label}</div>
            <div className="mt-2 text-sm text-[var(--accent-gold)] font-[family-name:var(--font-mono)] break-all">{token.value}</div>
          </motion.button>
        ))}
      </div>
    </Section>
  );
}
