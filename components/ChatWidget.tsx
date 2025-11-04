"use client";
import { useState } from "react";

const SUGGESTIONS = [
  "What tools are included?",
  "How does the terminal work?",
  "Can I change themes?",
  "How do I play music here?"
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  return (
    <>
      {!open && (
        <button className="fixed bottom-6 right-6 primary shadow-glow" onClick={()=>setOpen(true)}>
          Chat
        </button>
      )}
      {open && <ChatWindow onClose={()=> setOpen(false)} />}
    </>
  );
}

function ChatWindow({ onClose }:{ onClose: ()=>void }) {
  const [messages, setMessages] = useState([{ role: "assistant", content: "Hey! I'm Maxwell Bot. Ask about projects, tools, themes, music, or the terminal." }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send(text?: string) {
    const payload = (text ?? input).trim();
    if (!payload) return;
    const userMsg = { role: "user", content: payload };
    setMessages(m => [...m, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg].slice(-10) }),
      });
      const data = await res.json();
      setMessages(m => [...m, { role: "assistant", content: data.reply || "(no reply)" }]);
    } catch (e) {
      setMessages(m => [...m, { role: "assistant", content: "Error reaching chat service." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 rounded-2xl bg-bg-soft/90 backdrop-blur border border-white/10 shadow-glow p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold">Ask Maxwell</div>
        <button onClick={onClose} className="text-white/60 hover:text-white">×</button>
      </div>
      <div className="space-y-2 max-h-72 overflow-y-auto text-sm">
        {messages.map((m,i)=>(
          <div key={i} className={m.role==="user"?"text-right":""}>
            <div className={`inline-block px-3 py-2 rounded-xl ${m.role==="user"?"bg-accent text-black":"bg-white/10"}`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && <div className="text-white/60">Thinking…</div>}
      </div>
      <div className="mt-2 flex gap-2">
        <input
          className="flex-1 bg-transparent border border-white/10 rounded-xl px-3 py-2 outline-none"
          value={input}
          onChange={(e)=>setInput(e.target.value)}
          onKeyDown={(e)=> e.key==="Enter" && send()}
          placeholder="Ask about tools…"
        />
        <button className="primary" onClick={()=>send()}>Send</button>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s,i)=>(
          <button key={i} className="px-2 py-1 rounded bg-white/10 hover:bg-white/15 text-xs" onClick={()=>send(s)}>{s}</button>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-white/50">
        Tip: Add your API key in <code>.env.local</code> to enable real AI responses.
      </p>
    </div>
  );
}
