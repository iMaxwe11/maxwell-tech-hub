"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface APODData {
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  media_type: string;
  date: string;
  copyright?: string;
}

export default function NASAAPODCard() {
  const [apod, setApod] = useState<APODData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetchAPOD = async () => {
      try {
        const res = await fetch('/api/nasa?endpoint=apod');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setApod(data);
        setLoading(false);
      } catch (e) {
        setError(true);
        setLoading(false);
      }
    };

    fetchAPOD();
  }, []);

  if (loading) {
    return (
      <div className="glass-card p-6 h-[400px] flex items-center justify-center">
        <div className="text-white/50 font-[family-name:var(--font-mono)] text-sm">
          Loading space imagery...
        </div>
      </div>
    );
  }

  if (error || !apod) return null;

  const truncatedExplanation = apod.explanation.slice(0, 150) + "...";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.7 }}
      className="glass-card overflow-hidden group cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="relative h-64 overflow-hidden">
        {apod.media_type === 'image' ? (
          <Image
            src={apod.url}
            alt={apod.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full bg-black/50 flex items-center justify-center">
            <span className="text-white/50 text-sm">Video content</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-bold text-white font-[family-name:var(--font-heading)] mb-1">
            {apod.title}
          </h3>
          <div className="text-xs text-white/60 font-[family-name:var(--font-mono)]">
            NASA APOD · {apod.date}
          </div>
        </div>
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {expanded ? (
            <motion.p
              key="full"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="text-sm text-white/70 leading-relaxed"
            >
              {apod.explanation}
            </motion.p>
          ) : (
            <motion.p
              key="truncated"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-white/70 leading-relaxed"
            >
              {truncatedExplanation}
            </motion.p>
          )}
        </AnimatePresence>

        <div className="mt-4 pt-4 border-t border-white/[0.08] flex items-center justify-between">
          <span className="text-xs text-white/40 font-[family-name:var(--font-mono)]">
            {expanded ? "Click to collapse" : "Click to read more"}
          </span>
          {apod.copyright && (
            <span className="text-xs text-white/30 font-[family-name:var(--font-mono)]">
              © {apod.copyright}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
