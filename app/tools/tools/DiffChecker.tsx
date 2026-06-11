"use client";

import { useState, useMemo } from "react";
import { Section } from "../shared";

export function DiffChecker() {
  const [textA, setTextA] = useState("Hello World\nThis is line two\nLine three here");
  const [textB, setTextB] = useState("Hello World\nThis is line 2\nLine three here\nNew line four");
  const diff = useMemo(() => {
    const a = textA.split("\n"); const b = textB.split("\n");
    const maxLen = Math.max(a.length, b.length);
    const lines: Array<{ left: string; right: string; type: "same"|"changed"|"added"|"removed" }> = [];
    for (let i = 0; i < maxLen; i++) {
      const l = a[i] ?? ""; const r = b[i] ?? "";
      if (i >= a.length) lines.push({ left: "", right: r, type: "added" });
      else if (i >= b.length) lines.push({ left: l, right: "", type: "removed" });
      else if (l === r) lines.push({ left: l, right: r, type: "same" });
      else lines.push({ left: l, right: r, type: "changed" });
    }
    return lines;
  }, [textA, textB]);
  const colors = { same: "", changed: "bg-yellow-400/5 border-l-2 border-yellow-400/30", added: "bg-green-400/5 border-l-2 border-green-400/30", removed: "bg-red-400/5 border-l-2 border-red-400/30" };
  return (
    <Section id="diff" title="Diff Checker" desc="Compare two texts side by side." accent="purple" index={18}>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div><label className="text-[0.6rem] text-[var(--text-muted)] font-[family-name:var(--font-mono)] uppercase tracking-wider mb-1 block">Original</label><textarea className="tool-input neon-input min-h-[100px] resize-none text-xs" value={textA} onChange={e => setTextA(e.target.value)} /></div>
        <div><label className="text-[0.6rem] text-[var(--text-muted)] font-[family-name:var(--font-mono)] uppercase tracking-wider mb-1 block">Modified</label><textarea className="tool-input neon-input min-h-[100px] resize-none text-xs" value={textB} onChange={e => setTextB(e.target.value)} /></div>
      </div>
      <div className="rounded-lg bg-black/20 border border-white/[0.04] overflow-hidden">
        {diff.map((line, i) => (
          <div key={i} className={`grid grid-cols-2 text-xs font-[family-name:var(--font-mono)] ${colors[line.type]}`}>
            <div className={`px-3 py-1 border-r border-white/[0.04] ${line.type==="removed"?"text-red-400/80":line.type==="changed"?"text-yellow-400/80":"text-[var(--text-secondary)]"}`}>
              <span className="text-[var(--text-muted)] mr-2 select-none">{i+1}</span>{line.left}
            </div>
            <div className={`px-3 py-1 ${line.type==="added"?"text-green-400/80":line.type==="changed"?"text-yellow-400/80":"text-[var(--text-secondary)]"}`}>
              <span className="text-[var(--text-muted)] mr-2 select-none">{i+1}</span>{line.right}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
