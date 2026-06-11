"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { copyToClipboard } from "@/lib/toast";
import { Section, getErrorMessage } from "../shared";

export function CSVJSONStudio() {
  const csvSample = "name,role,stack\nMaxwell,Builder,Next.js\nClaude,Reviewer,Research\nCodex,Shipper,React";
  const jsonSample = '[{"name":"Maxwell","role":"Builder","stack":"Next.js"},{"name":"Claude","role":"Reviewer","stack":"Research"}]';
  const [mode, setMode] = useState<"csv-to-json" | "json-to-csv">("csv-to-json");
  const [input, setInput] = useState(csvSample);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const parseCsvLine = useCallback((line: string) => {
    const cells: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let index = 0; index < line.length; index += 1) {
      const char = line[index];
      const next = line[index + 1];

      if (char === '"') {
        if (inQuotes && next === '"') {
          current += '"';
          index += 1;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }

      if (char === "," && !inQuotes) {
        cells.push(current.trim());
        current = "";
        continue;
      }

      current += char;
    }

    cells.push(current.trim());
    return cells;
  }, []);

  const convert = useCallback(() => {
    try {
      setError(null);

      if (mode === "csv-to-json") {
        const lines = input.split(/\r?\n/).filter((line) => line.trim());
        const [headerLine, ...rows] = lines;
        if (!headerLine) {
          setOutput("[]");
          return;
        }

        const headers = parseCsvLine(headerLine);
        const items = rows.map((row) => {
          const values = parseCsvLine(row);
          return headers.reduce<Record<string, string>>((acc, header, index) => {
            acc[header] = values[index] ?? "";
            return acc;
          }, {});
        });

        setOutput(JSON.stringify(items, null, 2));
        return;
      }

      const records = JSON.parse(input) as Array<Record<string, unknown>>;
      if (!Array.isArray(records)) {
        throw new Error("Expected an array of objects.");
      }

      const headers = Array.from(
        new Set(records.flatMap((record) => Object.keys(record ?? {}))),
      );
      const csv = [
        headers.join(","),
        ...records.map((record) =>
          headers
            .map((header) => {
              const raw = String(record?.[header] ?? "");
              return /[",\n]/.test(raw) ? `"${raw.replace(/"/g, '""')}"` : raw;
            })
            .join(","),
        ),
      ].join("\n");

      setOutput(csv);
    } catch (error) {
      setError(getErrorMessage(error));
      setOutput("");
    }
  }, [input, mode, parseCsvLine]);

  useEffect(() => {
    convert();
  }, [convert]);

  return (
    <Section id="csvjson" title="CSV ↔ JSON Studio" desc="Convert flat CSV rows into JSON objects and send object arrays back to CSV." accent="purple" index={16}>
      <div className="mb-4 flex flex-wrap gap-2">
        {([
          ["csv-to-json", "CSV → JSON"],
          ["json-to-csv", "JSON → CSV"],
        ] as const).map(([value, label]) => (
          <motion.button
            key={value}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setMode(value);
              setInput(value === "csv-to-json" ? csvSample : jsonSample);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-[family-name:var(--font-mono)] uppercase tracking-wider transition-all duration-300 ${
              mode === value
                ? "bg-[var(--accent-purple)]/10 text-[var(--accent-purple)] border border-[var(--accent-purple)]/20"
                : "bg-white/[0.02] text-[var(--text-muted)] border border-white/[0.04]"
            }`}
          >
            {label}
          </motion.button>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <textarea className="tool-input neon-input min-h-[200px] resize-none" value={input} onChange={(event) => setInput(event.target.value)} />
        <textarea className="tool-input min-h-[200px] resize-none bg-black/20" value={output} readOnly />
      </div>
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-3 text-xs text-red-400 font-[family-name:var(--font-mono)]">
            {error}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="mt-4 flex flex-wrap gap-2">
        <motion.button whileTap={{ scale: 0.95 }} className="tool-btn-primary tool-btn" onClick={convert}>Convert</motion.button>
        <motion.button whileTap={{ scale: 0.95 }} className="tool-btn" onClick={() => copyToClipboard(output)}>Copy Output</motion.button>
      </div>
    </Section>
  );
}
