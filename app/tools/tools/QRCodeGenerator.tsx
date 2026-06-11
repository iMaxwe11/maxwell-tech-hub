"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { copyToClipboard } from "@/lib/toast";
import { Section } from "../shared";

export function QRCodeGenerator() {
  const [text, setText] = useState("https://maxwellnixon.com");
  const [size, setSize] = useState(240);
  const [fg, setFg] = useState("06b6d4");
  const [bg, setBg] = useState("0a0a0a");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas || !text) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    canvas.width = size; canvas.height = size;
    // Simple QR using a free API as image source
    const img = new Image(); img.crossOrigin = "anonymous";
    img.onload = () => { ctx.fillStyle = `#${bg}`; ctx.fillRect(0,0,size,size); ctx.drawImage(img, 0, 0, size, size); };
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&bgcolor=${bg}&color=${fg}`;
  }, [bg, fg, size, text]);
  const download = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const a = document.createElement("a"); a.download = "qrcode.png";
    a.href = canvas.toDataURL("image/png"); a.click();
  };
  return (
    <Section id="qrcode" title="QR Code Generator" desc="Generate branded QR codes with custom size and colors." accent="cyan" index={19}>
      <input className="tool-input neon-input mb-4" value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter URL or text..." />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)]">
          Size
          <select value={size} onChange={(event) => setSize(Number(event.target.value))} className="tool-input neon-input ml-2 w-24">
            {[180, 240, 320].map((option) => <option key={option} value={option}>{option}px</option>)}
          </select>
        </label>
        <label className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)] flex items-center gap-2">
          Foreground
          <input type="color" value={`#${fg}`} onChange={(event) => setFg(event.target.value.replace("#", ""))} className="w-8 h-8 rounded border border-white/10" />
        </label>
        <label className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)] flex items-center gap-2">
          Background
          <input type="color" value={`#${bg}`} onChange={(event) => setBg(event.target.value.replace("#", ""))} className="w-8 h-8 rounded border border-white/10" />
        </label>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <canvas ref={canvasRef} className="rounded-lg" style={{ width: 180, height: 180 }} />
        </div>
        <div className="space-y-3">
          <motion.button whileTap={{ scale: 0.9 }} className="tool-btn-primary tool-btn" onClick={download}>Download PNG</motion.button>
          <motion.button whileTap={{ scale: 0.9 }} className="tool-btn" onClick={() => copyToClipboard(text)}>Copy Text</motion.button>
          <motion.button whileTap={{ scale: 0.9 }} className="tool-btn" onClick={() => setText("https://maxwellnixon.com/status")}>Load Sample</motion.button>
        </div>
      </div>
    </Section>
  );
}
