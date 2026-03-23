"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function NASAAPODCard() {
  const [apod, setApod] = useState<any>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetch("/api/nasa?endpoint=apod")
      .then((r) => r.json())
      .then(setApod)
      .catch(console.error);
  }, []);

  if (!apod) return <div className="glass-card p-6 animate-pulse"><div className="h-64 bg-white/5 rounded" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden">
      <div className="relative h-64 overflow-hidden">
        <img src={apod.url} alt={apod.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-lg font-bold text-white mb-1">{apod.title}</h3>
          <p className="text-xs text-white/70">{apod.date}</p>
        </div>
      </div>
      <div className="p-6">
        <AnimatePresence>
          {expanded ? (
            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }} className="text-sm text-white/70 leading-relaxed mb-4">
              {apod.explanation}
            </motion.p>
          ) : (
            <motion.p className="text-sm text-white/70 leading-relaxed mb-4 line-clamp-2">
              {apod.explanation}
            </motion.p>
          )}
        </AnimatePresence>
        <button onClick={() => setExpanded(!expanded)}
          className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-mono">
          {expanded ? "Show less" : "Read more"}
        </button>
      </div>
    </motion.div>
  );
}