"use client";

import { useState, useMemo } from "react";
import { copyToClipboard } from "@/lib/toast";
import { Section } from "../shared";

export function JWTDecoder() {
  const [jwt, setJwt] = useState("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ik1heHdlbGwgTml4b24iLCJpYXQiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c");
  const decoded = useMemo(() => {
    try {
      const parts = jwt.split(".");
      if (parts.length !== 3) return null;
      const header = JSON.parse(atob(parts[0].replace(/-/g,"+").replace(/_/g,"/")));
      const payload = JSON.parse(atob(parts[1].replace(/-/g,"+").replace(/_/g,"/")));
      const expDate = payload.exp ? new Date(payload.exp * 1000) : null;
      const isExpired = expDate ? expDate < new Date() : false;
      return { header, payload, signature: parts[2], expDate, isExpired };
    } catch { return null; }
  }, [jwt]);
  return (
    <Section id="jwt" title="JWT Decoder" desc="Decode payloads, inspect claims, and spot expired tokens fast." accent="purple" index={20}>
      <textarea className="tool-input neon-input min-h-[80px] resize-none mb-4 text-xs break-all" value={jwt} onChange={(e) => setJwt(e.target.value)} placeholder="Paste a JWT token..." />
      {decoded ? (
        <div className="space-y-3">
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-2">
            {[
              ["Algorithm", decoded.header.alg ?? "—"],
              ["Subject", decoded.payload.sub ?? decoded.payload.name ?? "—"],
              ["Issuer", decoded.payload.iss ?? "—"],
              ["Audience", Array.isArray(decoded.payload.aud) ? decoded.payload.aud.join(", ") : decoded.payload.aud ?? "—"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-white/[0.05] bg-black/20 px-3 py-3">
                <div className="text-[0.6rem] uppercase tracking-[0.2em] text-[var(--text-muted)] font-[family-name:var(--font-mono)]">{label}</div>
                <div className="mt-2 text-sm text-[var(--text-primary)] break-all">{String(value)}</div>
              </div>
            ))}
          </div>
          {(["header", "payload"] as const).map((section) => (
            <div key={section} className="rounded-lg bg-black/20 border border-white/[0.04] p-3 cursor-pointer group" onClick={() => copyToClipboard(JSON.stringify(decoded[section], null, 2))}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-[family-name:var(--font-mono)] text-[var(--accent-purple)] uppercase tracking-wider">{section}</span>
                <span className="text-[0.55rem] text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity">copy</span>
              </div>
              <pre className="text-xs text-[var(--text-secondary)] font-[family-name:var(--font-mono)] overflow-x-auto">{JSON.stringify(decoded[section], null, 2)}</pre>
            </div>
          ))}
          {decoded.expDate && (
            <div className={`text-xs font-[family-name:var(--font-mono)] px-3 py-2 rounded-lg border ${decoded.isExpired ? "bg-red-400/5 border-red-400/20 text-red-400" : "bg-green-400/5 border-green-400/20 text-green-400"}`}>
              {decoded.isExpired ? "⚠ Expired" : "✓ Valid"} — Expires: {decoded.expDate.toLocaleString()}
            </div>
          )}
        </div>
      ) : (
        <div className="text-xs text-red-400/60 font-[family-name:var(--font-mono)] p-3 rounded-lg bg-red-400/5 border border-red-400/10">Invalid JWT format. Expected 3 base64 segments separated by dots.</div>
      )}
    </Section>
  );
}
