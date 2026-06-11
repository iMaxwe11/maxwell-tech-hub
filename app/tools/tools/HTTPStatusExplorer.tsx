"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { copyToClipboard } from "@/lib/toast";
import { Section } from "../shared";

const HTTP_STATUSES = [
  { code: 200, label: "OK", category: "Success", note: "Standard successful response." },
  { code: 201, label: "Created", category: "Success", note: "Resource created successfully." },
  { code: 204, label: "No Content", category: "Success", note: "Success with no response body." },
  { code: 301, label: "Moved Permanently", category: "Redirect", note: "Permanent redirect to a new URL." },
  { code: 302, label: "Found", category: "Redirect", note: "Temporary redirect." },
  { code: 304, label: "Not Modified", category: "Redirect", note: "Use cached content." },
  { code: 400, label: "Bad Request", category: "Client", note: "Malformed or invalid request." },
  { code: 401, label: "Unauthorized", category: "Client", note: "Authentication required or invalid." },
  { code: 403, label: "Forbidden", category: "Client", note: "Authenticated but not allowed." },
  { code: 404, label: "Not Found", category: "Client", note: "Requested resource does not exist." },
  { code: 409, label: "Conflict", category: "Client", note: "State conflict, often on writes." },
  { code: 422, label: "Unprocessable Content", category: "Client", note: "Validation failed or semantic issue." },
  { code: 429, label: "Too Many Requests", category: "Client", note: "Rate limit reached." },
  { code: 500, label: "Internal Server Error", category: "Server", note: "Unexpected server failure." },
  { code: 502, label: "Bad Gateway", category: "Server", note: "Upstream dependency returned an invalid response." },
  { code: 503, label: "Service Unavailable", category: "Server", note: "Temporary outage or maintenance." },
  { code: 504, label: "Gateway Timeout", category: "Server", note: "Upstream service timed out." },
] as const;

export function HTTPStatusExplorer() {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return HTTP_STATUSES;
    return HTTP_STATUSES.filter((status) =>
      `${status.code} ${status.label} ${status.category} ${status.note}`
        .toLowerCase()
        .includes(normalized),
    );
  }, [query]);

  return (
    <Section id="httpstatus" title="HTTP Status Explorer" desc="Search the common response codes you keep half-remembering mid-debug." accent="cyan" index={17}>
      <input
        className="tool-input neon-input"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search 404, auth, validation, redirects..."
      />
      <div className="mt-4 grid md:grid-cols-2 gap-3">
        {results.map((status) => (
          <motion.button
            key={status.code}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => copyToClipboard(String(status.code))}
            className="rounded-xl border border-white/[0.05] bg-black/20 p-4 text-left"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-2xl font-bold text-[var(--accent-cyan)] font-[family-name:var(--font-heading)]">{status.code}</div>
              <span className="text-[0.6rem] uppercase tracking-[0.2em] text-[var(--text-muted)] font-[family-name:var(--font-mono)]">{status.category}</span>
            </div>
            <div className="mt-2 text-sm font-semibold text-white">{status.label}</div>
            <p className="mt-2 text-xs text-[var(--text-secondary)]">{status.note}</p>
          </motion.button>
        ))}
      </div>
    </Section>
  );
}
