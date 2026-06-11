"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Section } from "../shared";

type PasswordTone = "muted" | "weak" | "fair" | "strong" | "veryStrong";

const PASSWORD_TONE_STYLES: Record<PasswordTone, { barClass: string; textClass: string }> = {
  muted: { barClass: "bg-white/20", textClass: "text-white/40" },
  weak: { barClass: "bg-red-400", textClass: "text-red-400" },
  fair: { barClass: "bg-yellow-400", textClass: "text-yellow-400" },
  strong: { barClass: "bg-green-400", textClass: "text-green-400" },
  veryStrong: { barClass: "bg-cyan-400", textClass: "text-cyan-400" },
};

export function PasswordTester() {
  const [pw, setPw] = useState("");
  const analysis = useMemo(() => {
    const checks = [
      { label: "8+ characters", pass: pw.length >= 8 },
      { label: "Uppercase letter", pass: /[A-Z]/.test(pw) },
      { label: "Lowercase letter", pass: /[a-z]/.test(pw) },
      { label: "Number", pass: /\d/.test(pw) },
      { label: "Special character", pass: /[^A-Za-z0-9]/.test(pw) },
      { label: "12+ characters", pass: pw.length >= 12 },
      { label: "No common patterns", pass: !/^(password|123456|qwerty|abc123)/i.test(pw) && pw.length > 0 },
    ];
    const score = checks.filter(c => c.pass).length;
    const strength = pw.length === 0 ? "" : score <= 2 ? "Weak" : score <= 4 ? "Fair" : score <= 5 ? "Strong" : "Very Strong";
    const tone: PasswordTone = pw.length === 0 ? "muted" : score <= 2 ? "weak" : score <= 4 ? "fair" : score <= 5 ? "strong" : "veryStrong";
    // Entropy estimate
    let pool = 0;
    if (/[a-z]/.test(pw)) pool += 26;
    if (/[A-Z]/.test(pw)) pool += 26;
    if (/\d/.test(pw)) pool += 10;
    if (/[^A-Za-z0-9]/.test(pw)) pool += 32;
    const entropy = pw.length > 0 ? Math.round(pw.length * Math.log2(pool || 1)) : 0;
    return { checks, score, strength, tone, entropy };
  }, [pw]);
  const toneStyles = PASSWORD_TONE_STYLES[analysis.tone];
  return (
    <Section id="password" title="Password Strength" desc="Test password strength and get security tips." accent="gold" index={21}>
      <input type="text" className="tool-input neon-input mb-4" value={pw} onChange={e => setPw(e.target.value)} placeholder="Enter a password to test..." autoComplete="off" />
      {pw.length > 0 && (
        <>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${(analysis.score / 7) * 100}%` }} className={`h-full rounded-full ${toneStyles.barClass}`} />
            </div>
            <span className={`text-sm font-bold font-[family-name:var(--font-mono)] ${toneStyles.textClass}`}>{analysis.strength}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            <div className="rounded-lg p-2 bg-black/20 border border-white/[0.04] text-center">
              <div className="text-lg font-bold text-[var(--accent-gold)] font-[family-name:var(--font-heading)]">{analysis.entropy}</div>
              <div className="text-[0.55rem] text-[var(--text-muted)] font-[family-name:var(--font-mono)]">Entropy bits</div>
            </div>
            <div className="rounded-lg p-2 bg-black/20 border border-white/[0.04] text-center">
              <div className="text-lg font-bold text-[var(--accent-gold)] font-[family-name:var(--font-heading)]">{pw.length}</div>
              <div className="text-[0.55rem] text-[var(--text-muted)] font-[family-name:var(--font-mono)]">Length</div>
            </div>
            <div className="rounded-lg p-2 bg-black/20 border border-white/[0.04] text-center">
              <div className="text-lg font-bold text-[var(--accent-gold)] font-[family-name:var(--font-heading)]">{analysis.score}/7</div>
              <div className="text-[0.55rem] text-[var(--text-muted)] font-[family-name:var(--font-mono)]">Score</div>
            </div>
            <div className="rounded-lg p-2 bg-black/20 border border-white/[0.04] text-center">
              <div className="text-lg font-bold text-[var(--accent-gold)] font-[family-name:var(--font-heading)]">{new Set(pw).size}</div>
              <div className="text-[0.55rem] text-[var(--text-muted)] font-[family-name:var(--font-mono)]">Unique chars</div>
            </div>
          </div>
          <div className="space-y-1">
            {analysis.checks.map(c => (
              <div key={c.label} className="flex items-center gap-2 text-xs font-[family-name:var(--font-mono)]">
                <span className={c.pass ? "text-green-400" : "text-white/20"}>{c.pass ? "✓" : "○"}</span>
                <span className={c.pass ? "text-[var(--text-secondary)]" : "text-[var(--text-muted)]"}>{c.label}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </Section>
  );
}

/* ═══════════════════════════════════════════
   HACKER MODE (Easter Egg)
   ═══════════════════════════════════════════ */
