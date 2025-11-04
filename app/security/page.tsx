"use client";
import { useState } from "react";

type VTStats = { harmless?: number; undetected?: number; suspicious?: number; malicious?: number; timeout?: number; failure?: number; type_unsupported?: number };
type VTFlag = { engine: string; category: string; result?: string };

function isHash(s: string) {
  return /^([a-fA-F0-9]{32}|[a-fA-F0-9]{40}|[a-fA-F0-9]{64})$/.test(s || "");
}

export default function SecurityPage() {
  const [mode, setMode] = useState<"file"|"hash">("file");
  const [file, setFile] = useState<File | null>(null);
  const [hash, setHash] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<VTStats | null>(null);
  const [flags, setFlags] = useState<VTFlag[]>([]);
  const [reportLink, setReportLink] = useState<string | null>(null);

  async function scanFile() {
    if (!file) return;
    setBusy(true); setError(null); setStats(null); setFlags([]); setReportLink(null);
    const body = new FormData();
    body.append("file", file);
    try {
      const res = await fetch("/api/scan/vt", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Scan failed");
      setStats(data.stats || null);
      setFlags(data.flags || []);
      setReportLink(data.permalink || null);
    } catch (e:any) {
      setError(e.message || "Scan failed");
    } finally {
      setBusy(false);
    }
  }

  async function scanHash() {
    if (!isHash(hash)) { setError("Enter a valid MD5, SHA1, or SHA256 hash."); return; }
    setBusy(true); setError(null); setStats(null); setFlags([]); setReportLink(null);
    try {
      const res = await fetch("/api/scan/vt", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ hash }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Lookup failed");
      setStats(data.stats || null);
      setFlags(data.flags || []);
      setReportLink(data.permalink || null);
    } catch (e:any) {
      setError(e.message || "Lookup failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="space-y-6">
      <div className="card">
        <h1 className="text-2xl font-semibold mb-2">Security Scan (VirusTotal)</h1>
        <p className="text-white/70 text-sm">
          Choose <strong>File</strong> (upload &amp; analyze, 32MB max on free tier) or <strong>Hash</strong> (MD5/SHA1/SHA256 lookup).
        </p>
        <div className="mt-3 flex gap-2">
          <button className={`px-3 py-1 rounded ${mode==='file'?'bg-accent text-black':'bg-white/10'}`} onClick={()=>setMode("file")}>File</button>
          <button className={`px-3 py-1 rounded ${mode==='hash'?'bg-accent text-black':'bg-white/10'}`} onClick={()=>setMode("hash")}>Hash</button>
        </div>

        {mode === "file" ? (
          <div className="mt-4 flex items-center gap-3">
            <input type="file" onChange={(e)=> setFile(e.target.files?.[0] || null)} />
            <button className="primary" onClick={scanFile} disabled={!file || busy}>{busy ? "Scanning…" : "Scan File"}</button>
          </div>
        ) : (
          <div className="mt-4 flex items-center gap-3">
            <input className="bg-transparent border border-white/10 rounded px-3 py-2 w-[360px]" placeholder="Paste MD5 / SHA1 / SHA256" value={hash} onChange={(e)=>setHash(e.target.value.trim())} />
            <button className="primary" onClick={scanHash} disabled={!hash || busy}>{busy ? "Looking up…" : "Lookup Hash"}</button>
          </div>
        )}

        {(file && mode==='file') && <div className="text-xs text-white/60 mt-2">Selected: {file.name} ({file.size} bytes)</div>}
      </div>

      {error && <div className="card text-red-300">Error: {error}</div>}

      {stats && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-2">Results</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            {Object.entries(stats).map(([k,v]) => (
              <div key={k} className="bg-white/5 rounded-xl p-3 border border-white/10">
                <span className="text-white/60">{k}</span>: <strong>{String(v)}</strong>
              </div>
            ))}
          </div>
          {flags.length>0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Flagged Engines</h3>
              <div className="flex flex-wrap gap-2 text-sm">
                {flags.map((f,i)=>(
                  <div key={i} className="px-2 py-1 rounded bg-white/10">{f.engine}: <span className="text-red-300">{f.category}</span>{f.result?` (${f.result})`:""}</div>
                ))}
              </div>
            </div>
          )}
          <p className="text-xs text-white/50 mt-4">Note: Results come from VirusTotal; always handle files cautiously.</p>
        </div>
      )}

      {reportLink && (
        <div className="card">
          <a className="link" href={reportLink} target="_blank" rel="noreferrer">Open full VirusTotal report ↗</a>
        </div>
      )}
    </main>
  );
}
