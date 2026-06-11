"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { copyToClipboard } from "@/lib/toast";
import { Section } from "../shared";

export function TextCaseStudio() {
  const [input, setInput] = useState("Launch the obsidian luxe dashboard");
  const words = useMemo(
    () => input.trim().split(/\s+/).filter(Boolean),
    [input],
  );
  const titleCase = useMemo(
    () => words.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" "),
    [words],
  );
  const sentenceCase = useMemo(() => {
    const normalized = input.trim();
    return normalized ? normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase() : "";
  }, [input]);
  const camelCase = useMemo(
    () =>
      words
        .map((word, index) =>
          index === 0
            ? word.toLowerCase()
            : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(""),
    [words],
  );
  const pascalCase = useMemo(
    () => words.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(""),
    [words],
  );
  const kebabCase = useMemo(() => words.map((word) => word.toLowerCase()).join("-"), [words]);
  const snakeCase = useMemo(() => words.map((word) => word.toLowerCase()).join("_"), [words]);
  const outputs = [
    { label: "Upper", value: input.toUpperCase() },
    { label: "Lower", value: input.toLowerCase() },
    { label: "Title", value: titleCase },
    { label: "Sentence", value: sentenceCase },
    { label: "camelCase", value: camelCase },
    { label: "PascalCase", value: pascalCase },
    { label: "kebab-case", value: kebabCase },
    { label: "snake_case", value: snakeCase },
  ];

  return (
    <Section id="textcase" title="Text Case Studio" desc="Flip between title, sentence, camel, Pascal, kebab, and snake case." accent="cyan" index={15}>
      <textarea
        className="tool-input neon-input min-h-[120px] resize-none"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder="Type text to transform..."
      />
      <div className="mt-4 grid sm:grid-cols-2 gap-3">
        {outputs.map((output) => (
          <motion.button
            key={output.label}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => copyToClipboard(output.value)}
            className="rounded-xl border border-white/[0.05] bg-black/20 p-4 text-left"
          >
            <div className="text-[0.6rem] uppercase tracking-[0.2em] text-[var(--text-muted)] font-[family-name:var(--font-mono)]">{output.label}</div>
            <div className="mt-2 text-sm text-[var(--text-primary)] break-all">{output.value || "—"}</div>
          </motion.button>
        ))}
      </div>
    </Section>
  );
}
