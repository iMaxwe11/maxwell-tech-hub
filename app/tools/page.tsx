"use client";
import { useMemo, useState } from "react";

/** Tools Page: Palette, Markdown, Inspiration, JSON, Regex, Timestamp, Contrast, Generator, Base64, URL */
export default function ToolsPage() {
  return (
    <main className="space-y-10 pb-16">
      <h1 className="text-3xl font-semibold">Tools</h1>
      <Palette />
      <MarkdownPreview />
      <Inspiration />
      <JSONFormatter />
      <RegexTester />
      <TimestampConverter />
      <ContrastChecker />
      <GeneratorKit />
      <Base64Tool />
      <URLTool />
    </main>
  );
}
function Section({ id, title, children, desc } : any) {
  return (
    <section id={id} className="card">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-xl font-semibold">{title}</h2>
        {desc && <p className="text-sm text-white/60">{desc}</p>}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}
function Palette() {
  const [h, setH] = useState(200);
  const [s, setS] = useState(100);
  const [l, setL] = useState(60);
  const color = `hsl(${h} ${s}% ${l}%)`;
  return (
    <Section id="palette" title="Color Palette" desc="Generate a quick palette and copy the CSS value.">
      <div className="flex items-center gap-6">
        <div className="w-40 h-28 rounded-xl border border-white/10" style={{ background: color }} />
        <div className="flex-1 grid sm:grid-cols-3 gap-4">
          {[["Hue", h, setH, 360], ["Sat", s, setS, 100], ["Light", l, setL, 100]].map(([label,val,setter,max]:any)=>(
            <div key={label as string}>
              <label className="text-sm text-white/70">{label}</label>
              <input type="range" min="0" max={max as number} value={val as number} onChange={(e)=> (setter as any)(+e.target.value)} className="w-full"/>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 text-sm flex items-center gap-3">
        CSS: <code>hsl({h} {s}% {l}%)</code>
        <button className="px-2 py-1 rounded bg-white/10 hover:bg-white/15" onClick={()=> navigator.clipboard.writeText(`hsl(${h} ${s}% ${l}%)`)}>Copy</button>
      </div>
    </Section>
  );
}
function MarkdownPreview() {
  const [text, setText] = useState("# Hello\n\nThis is **live** preview.");
  return (
    <Section id="markdown" title="Markdown Preview" desc="Lightweight markdown preview (headings, bold, italics).">
      <div className="grid md:grid-cols-2 gap-4">
        <textarea value={text} onChange={(e)=>setText(e.target.value)} className="min-h-[220px] p-3 rounded-xl bg-black/30 border border-white/10" />
        <div className="prose prose-invert max-w-none">
          <MDRender text={text} />
        </div>
      </div>
    </Section>
  );
}
function MDRender({ text }:{ text:string }) {
  const html = text
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/gim, "<em>$1</em>")
    .replace(/\n/g, "<br/>");
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
function Inspiration() {
  const ideas = [
    "What if UI elements behaved like liquids?",
    "Turn keyboard input into ambient visuals.",
    "Map Git commit history to sound and color.",
  ];
  const [idx, setIdx] = useState(0);
  return (
    <Section id="inspo" title="Inspiration" desc="Quick idea spark for experiments.">
      <div className="flex items-center justify-between gap-4">
        <div>{ideas[idx]}</div>
        <button className="primary" onClick={()=> setIdx((idx+1)%ideas.length)}>Next</button>
      </div>
    </Section>
  );
}
function JSONFormatter() {
  const [input, setInput] = useState('{"hello":"world","arr":[1,2,3]}');
  const [space, setSpace] = useState(2);
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState("");

  function prettify() {
    try { setError(null); const obj = JSON.parse(input); setOutput(JSON.stringify(obj, null, space)); }
    catch (e:any) { setError(e.message); setOutput(""); }
  }
  function minify() {
    try { setError(null); const obj = JSON.parse(input); setOutput(JSON.stringify(obj)); }
    catch (e:any) { setError(e.message); setOutput(""); }
  }

  return (
    <Section id="json" title="JSON Formatter" desc="Validate, prettify, or minify JSON.">
      <div className="grid md:grid-cols-2 gap-4">
        <textarea value={input} onChange={(e)=>setInput(e.target.value)} className="min-h-[220px] p-3 rounded-xl bg-black/30 border border-white/10" />
        <textarea value={output} readOnly className="min-h-[220px] p-3 rounded-xl bg-black/20 border border-white/10" />
      </div>
      {error && <div className="text-red-400 text-sm mt-2">Error: {error}</div>}
      <div className="mt-3 flex items-center gap-3">
        <label className="text-sm text-white/70">Spaces</label>
        <input type="number" min={0} max={8} value={space} onChange={(e)=> setSpace(parseInt(e.target.value || "0"))} className="w-20 bg-transparent border border-white/10 rounded px-2 py-1" />
        <button className="primary" onClick={prettify}>Prettify</button>
        <button className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15" onClick={minify}>Minify</button>
        <button className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15" onClick={()=> navigator.clipboard.writeText(output)}>Copy</button>
      </div>
    </Section>
  );
}
function RegexTester() {
  const [pattern, setPattern] = useState("\\w+");
  const [flags, setFlags] = useState("g");
  const [text, setText] = useState("Try matching multiple words: hello world_123!");
  const [error, setError] = useState<string | null>(null);
  const matches = useMemo(() => {
    try {
      setError(null);
      const re = new RegExp(pattern, flags);
      const m = [...text.matchAll(re)];
      return m.map((x:any)=> ({ match: x[0], index: x.index }));
    } catch (e:any) {
      setError(e.message);
      return [];
    }
  }, [pattern, flags, text]);

  return (
    <Section id="regex" title="Regex Tester" desc="Test JavaScript regular expressions.">
      <div className="grid gap-3">
        <div className="flex gap-3">
          <input className="flex-1 bg-transparent border border-white/10 rounded px-3 py-2" value={pattern} onChange={(e)=>setPattern(e.target.value)} placeholder="Pattern (no slashes)"/>
          <input className="w-24 bg-transparent border border-white/10 rounded px-3 py-2" value={flags} onChange={(e)=>setFlags(e.target.value)} placeholder="Flags" />
        </div>
        <textarea className="min-h-[140px] p-3 rounded-xl bg-black/30 border border-white/10" value={text} onChange={(e)=>setText(e.target.value)} />
        {error ? <div className="text-red-400 text-sm">{error}</div> : (
          <div className="text-sm text-white/80">
            Matches ({matches.length}): {matches.map((m,i)=>(
              <span key={i} className="inline-block bg-white/10 rounded px-2 py-1 m-1">{m.match}<span className="text-white/50"> @{m.index}</span></span>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}
function TimestampConverter() {
  const [timestamp, setTimestamp] = useState(Math.floor(Date.now()/1000).toString());
  const [dtLocal, setDtLocal] = useState(new Date().toISOString().slice(0,16));

  function tsToDates(tsStr:string) {
    const num = Number(tsStr);
    const ms = (tsStr.length > 10) ? num : num*1000;
    const d = new Date(ms);
    if (isNaN(d.getTime())) return { local: "-", utc: "-" };
    return { local: d.toString(), utc: d.toUTCString() };
  }
  function dateToTs(isoLocal:string) {
    const d = new Date(isoLocal.replace("T", " ") + ":00");
    const sec = Math.floor(d.getTime()/1000);
    const ms = d.getTime();
    if (isNaN(ms)) return { sec: "-", ms: "-" };
    return { sec, ms };
  }
  const dates = tsToDates(timestamp);
  const stamps = dateToTs(dtLocal);

  return (
    <Section id="timestamp" title="Timestamp Converter" desc="UNIX seconds/ms ↔ human dates (local & UTC).">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm text-white/70">UNIX Timestamp</label>
          <input className="w-full bg-transparent border border-white/10 rounded px-3 py-2" value={timestamp} onChange={(e)=> setTimestamp(e.target.value)} />
          <div className="text-sm text-white/80">Local: {dates.local}</div>
          <div className="text-sm text-white/80">UTC: {dates.utc}</div>
        </div>
        <div className="space-y-2">
          <label className="text-sm text-white/70">Local Date/Time</label>
          <input type="datetime-local" className="w-full bg-transparent border border-white/10 rounded px-3 py-2" value={dtLocal} onChange={(e)=> setDtLocal(e.target.value)} />
          <div className="text-sm text-white/80">UNIX sec: {stamps.sec}</div>
          <div className="text-sm text-white/80">UNIX ms: {stamps.ms}</div>
          <button className="mt-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15" onClick={()=> setDtLocal(new Date().toISOString().slice(0,16))}>Now</button>
        </div>
      </div>
    </Section>
  );
}
function hexToRgb(hex:string) {
  const m = hex.replace("#","").trim();
  const v = m.length===3 ? m.split("").map(c=>c+c).join("") : m;
  const n = parseInt(v, 16);
  return { r: (n>>16)&255, g: (n>>8)&255, b: n&255 };
}
function srgbToLin(v:number) { v/=255; return v <= 0.04045 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); }
function luminance({r,g,b}:{r:number;g:number;b:number}) { const R = srgbToLin(r), G = srgbToLin(g), B = srgbToLin(b); return 0.2126*R + 0.7152*G + 0.0722*B; }
function contrastRatio(hex1:string, hex2:string) { const L1 = luminance(hexToRgb(hex1)); const L2 = luminance(hexToRgb(hex2)); const [a,b] = L1 > L2 ? [L1, L2] : [L2, L1]; return (a + 0.05) / (b + 0.05); }
function wcagLevel(ratio:number, large=false) { if (large) { if (ratio >= 4.5) return "AAA"; if (ratio >= 3) return "AA"; } else { if (ratio >= 7) return "AAA"; if (ratio >= 4.5) return "AA"; } return "Fail"; }
function ContrastChecker() {
  const [fg, setFg] = useState("#d1e7ff");
  const [bg, setBg] = useState("#0a0f15");
  const ratio = useMemo(()=> Number(contrastRatio(fg,bg).toFixed(2)), [fg,bg]);
  const levelNormal = wcagLevel(ratio, false);
  const levelLarge = wcagLevel(ratio, true);
  return (
    <Section id="contrast" title="Color Contrast Checker" desc="WCAG contrast ratio + pass/fail for normal/large text.">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex gap-3">
            <div>
              <label className="text-sm text-white/70">Foreground</label>
              <input type="color" value={fg} onChange={(e)=>setFg(e.target.value)} className="block w-12 h-10 bg-transparent border border-white/10 rounded" />
              <input value={fg} onChange={(e)=>setFg(e.target.value)} className="mt-1 w-28 bg-transparent border border-white/10 rounded px-2 py-1 text-sm" />
            </div>
            <div>
              <label className="text-sm text-white/70">Background</label>
              <input type="color" value={bg} onChange={(e)=>setBg(e.target.value)} className="block w-12 h-10 bg-transparent border border-white/10 rounded" />
              <input value={bg} onChange={(e)=>setBg(e.target.value)} className="mt-1 w-28 bg-transparent border border-white/10 rounded px-2 py-1 text-sm" />
            </div>
          </div>
          <div className="text-sm text-white/80">Contrast ratio: <strong>{ratio}</strong></div>
          <div className="text-sm text-white/80">Normal text: <span className={`px-2 py-1 rounded ${levelNormal!=="Fail"?'bg-green-500/20 text-green-300':'bg-red-500/20 text-red-300'}`}>{levelNormal}</span></div>
          <div className="text-sm text-white/80">Large text: <span className={`px-2 py-1 rounded ${levelLarge!=="Fail"?'bg-green-500/20 text-green-300':'bg-red-500/20 text-red-300'}`}>{levelLarge}</span></div>
        </div>
        <div className="rounded-xl border border-white/10 p-4" style={{ background: bg, color: fg }}>
          <div className="text-lg font-semibold">Preview Title</div>
          <div className="text-sm mt-2">This is body text at normal size. It helps you judge readability.</div>
          <button className="mt-4 px-3 py-2 rounded-xl" style={{ background: fg, color: bg }}>Button</button>
        </div>
      </div>
    </Section>
  );
}
function GeneratorKit() {
  const [uuid, setUuid] = useState<string>("");
  const [len, setLen] = useState(16);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useDigits, setUseDigits] = useState(true);
  const [useSymbols, setUseSymbols] = useState(false);
  const [excludeAmbig, setExcludeAmbig] = useState(true);
  const [pwd, setPwd] = useState("");

  function genUUID() { try { setUuid(crypto.randomUUID()); } catch { setUuid("UUID not supported in this browser."); } }
  function genPassword() {
    const upper = "ABCDEFGHJKMNPQRSTUVWXYZ";
    const lower = "abcdefghjkmnpqrstuvwxyz";
    const digits = excludeAmbig ? "23456789" : "0123456789";
    const symbols = "!@#$%^&*()_+-=[]{};:,.?/";
    let alphabet = "";
    if (useUpper) alphabet += excludeAmbig ? upper : "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (useLower) alphabet += excludeAmbig ? lower : "abcdefghijklmnopqrstuvwxyz";
    if (useDigits) alphabet += digits;
    if (useSymbols) alphabet += symbols;
    if (!alphabet) return setPwd("Select at least one set.");
    const out = [];
    const arr = new Uint32Array(len);
    (crypto.getRandomValues ? crypto.getRandomValues(arr) : arr).forEach((n:any) => { out.push(alphabet[n % alphabet.length]); });
    setPwd(out.join(""));
  }

  return (
    <Section id="generator" title="Generator Kit" desc="UUID v4 and customizable password generator.">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="font-medium">UUID v4</div>
            <button className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15" onClick={genUUID}>Generate</button>
          </div>
          <input className="w-full bg-transparent border border-white/10 rounded px-3 py-2" readOnly value={uuid} />
          <div className="flex gap-2">
            <button className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15" onClick={()=> navigator.clipboard.writeText(uuid)}>Copy</button>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-medium">Password</div>
            <button className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15" onClick={genPassword}>Generate</button>
          </div>
          <input className="w-full bg-transparent border border-white/10 rounded px-3 py-2" readOnly value={pwd} />
          <div className="grid grid-cols-2 gap-3 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={useUpper} onChange={(e)=>setUseUpper(e.target.checked)} /> Uppercase</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={useLower} onChange={(e)=>setUseLower(e.target.checked)} /> Lowercase</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={useDigits} onChange={(e)=>setUseDigits(e.target.checked)} /> Digits</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={useSymbols} onChange={(e)=>setUseSymbols(e.target.checked)} /> Symbols</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={excludeAmbig} onChange={(e)=>setExcludeAmbig(e.target.checked)} /> Exclude ambiguous</label>
            <div className="flex items-center gap-2">
              <span>Length</span>
              <input type="range" min={8} max={64} value={len} onChange={(e)=>setLen(parseInt(e.target.value))} />
              <span className="w-8 text-right">{len}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15" onClick={()=> navigator.clipboard.writeText(pwd)}>Copy</button>
          </div>
        </div>
      </div>
    </Section>
  );
}
function Base64Tool() {
  const [plain, setPlain] = useState("Encode me: Maxwell Hub!");
  const [b64, setB64] = useState("");

  function encodeBase64(str:string) {
    const bytes = new TextEncoder().encode(str);
    let binary = "";
    const chunk = 0x8000;
    for (let i=0; i<bytes.length; i+=chunk) binary += String.fromCharCode.apply(null, Array.from(bytes.slice(i, i+chunk)) as any);
    return btoa(binary);
  }
  function decodeBase64(b64:string) {
    try {
      const binary = atob(b64);
      const bytes = new Uint8Array(binary.length);
      for (let i=0; i<binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return new TextDecoder().decode(bytes);
    } catch { return "(Invalid base64)"; }
  }

  return (
    <Section id="base64" title="Base64 Encoder / Decoder" desc="UTF-8 safe.">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-white/70">Plain text</label>
          <textarea value={plain} onChange={(e)=> setPlain(e.target.value)} className="min-h-[140px] p-3 rounded-xl bg-black/30 border border-white/10" />
          <div className="flex gap-2 mt-2">
            <button className="primary" onClick={()=> setB64(encodeBase64(plain))}>Encode →</button>
            <button className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15" onClick={()=> navigator.clipboard.writeText(plain)}>Copy</button>
          </div>
        </div>
        <div>
          <label className="text-sm text-white/70">Base64</label>
          <textarea value={b64} onChange={(e)=> setB64(e.target.value)} className="min-h-[140px] p-3 rounded-xl bg-black/20 border border-white/10" />
          <div className="flex gap-2 mt-2">
            <button className="primary" onClick={()=> setPlain(decodeBase64(b64))}>← Decode</button>
            <button className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15" onClick={()=> navigator.clipboard.writeText(b64)}>Copy</button>
          </div>
        </div>
      </div>
    </Section>
  );
}
function URLTool() {
  const [raw, setRaw] = useState("https://example.com/?q=Maxwell Hub & wow=true");
  const [enc, setEnc] = useState("");

  return (
    <Section id="url" title="URL Encoder / Decoder" desc="encodeURIComponent / decodeURIComponent helpers.">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-white/70">Raw</label>
          <textarea value={raw} onChange={(e)=> setRaw(e.target.value)} className="min-h-[120px] p-3 rounded-xl bg-black/30 border border-white/10" />
          <div className="flex gap-2 mt-2">
            <button className="primary" onClick={()=> setEnc(encodeURIComponent(raw))}>Encode →</button>
            <button className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15" onClick={()=> navigator.clipboard.writeText(raw)}>Copy</button>
          </div>
        </div>
        <div>
          <label className="text-sm text-white/70">Encoded</label>
          <textarea value={enc} onChange={(e)=> setEnc(e.target.value)} className="min-h-[120px] p-3 rounded-xl bg-black/20 border border-white/10" />
          <div className="flex gap-2 mt-2">
            <button className="primary" onClick={()=> { try { setRaw(decodeURIComponent(enc)); } catch { setRaw("(Invalid percent-encoding)"); } }}>← Decode</button>
            <button className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15" onClick={()=> navigator.clipboard.writeText(enc)}>Copy</button>
          </div>
        </div>
      </div>
    </Section>
  );
}
