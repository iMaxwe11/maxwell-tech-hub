"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { copyToClipboard } from "@/lib/toast";
import { Section } from "../shared";

export function SQLFormatter() {
  const [raw, setRaw] = useState(
    "select id, name, email, created_at from users where active = 1 and created_at > '2024-01-01' order by name limit 10",
  );
  const formatted = useMemo(() => {
    if (!raw.trim()) return "";
    const KEYWORDS = /\b(select|from|where|and|or|inner join|left join|right join|full join|cross join|on|group by|order by|having|limit|offset|insert into|values|update|set|delete|returning|with|as|union|case|when|then|else|end|is null|is not null|between|in|like|desc|asc|distinct|all)\b/gi;
    const MAJOR = /\b(select|from|where|group by|order by|having|limit|offset|insert into|values|update|set|delete|returning|with|union|left join|right join|inner join|full join|cross join|join|on)\b/gi;

    // Normalise whitespace, then uppercase keywords
    let s = raw.replace(/\s+/g, " ").trim().replace(KEYWORDS, (m) => m.toUpperCase());
    // Newline before each major clause (except the very first occurrence)
    let first = true;
    s = s.replace(MAJOR, (m) => {
      if (first) {
        first = false;
        return m.toUpperCase();
      }
      return "\n" + m.toUpperCase();
    });
    // Indent continuations (nested JOIN / ON)
    s = s
      .split("\n")
      .map((line) => {
        const trimmed = line.trim();
        if (/^(ON|AND|OR)\s/i.test(trimmed)) return "  " + trimmed;
        return trimmed;
      })
      .join("\n");
    // Break long SELECT column lists onto their own indented lines
    s = s.replace(/^(SELECT\s+)(.+)$/im, (_full, prefix: string, cols: string) => {
      // Skip if the SELECT body already contains a subquery
      if (/\bSELECT\b/i.test(cols)) return prefix + cols.trim();
      const parts = cols.split(",").map((c) => c.trim()).filter(Boolean);
      if (parts.length <= 2) return prefix + parts.join(", ");
      return prefix + "\n  " + parts.join(",\n  ");
    });
    // Add a trailing semicolon if the original had one or if the statement looks complete
    if (raw.trim().endsWith(";") && !s.endsWith(";")) s += ";";
    return s;
  }, [raw]);

  return (
    <Section id="sql" title="SQL Formatter" desc="Paste SQL → indented, uppercased, clause-broken output." accent="purple" index={32}>
      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="text-[0.6rem] text-[var(--text-muted)] font-[family-name:var(--font-mono)] uppercase tracking-wider mb-1 block">
            Input
          </label>
          <textarea
            className="tool-input neon-input min-h-[220px] resize-none text-xs"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            spellCheck={false}
            placeholder="Paste SQL here…"
          />
        </div>
        <div>
          <label className="text-[0.6rem] text-[var(--text-muted)] font-[family-name:var(--font-mono)] uppercase tracking-wider mb-1 block">
            Formatted
          </label>
          <pre className="rounded-lg bg-black/30 border border-white/[0.06] p-3 min-h-[220px] max-h-[420px] overflow-auto text-xs font-[family-name:var(--font-mono)] text-[var(--accent-cyan)] whitespace-pre">
            {formatted || <span className="text-white/20">Output will appear here</span>}
          </pre>
        </div>
      </div>
      <div className="mt-3 flex gap-2 flex-wrap">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => copyToClipboard(formatted, "SQL copied")}
          disabled={!formatted}
          className="tool-btn-primary tool-btn disabled:opacity-30"
        >
          Copy Formatted
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setRaw("")}
          className="tool-btn"
        >
          Clear
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() =>
            setRaw(
              "SELECT u.id, u.name, count(o.id) as orders FROM users u LEFT JOIN orders o ON o.user_id = u.id WHERE u.active = 1 GROUP BY u.id, u.name HAVING count(o.id) > 5 ORDER BY orders DESC LIMIT 20",
            )
          }
          className="tool-btn"
        >
          Load Sample
        </motion.button>
      </div>
    </Section>
  );
}
