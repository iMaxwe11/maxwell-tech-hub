"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Telescope } from "lucide-react";

import type { ApodData } from "@/lib/types";

export function NASAAPODCard() {
  const [apod, setApod] = useState<ApodData | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  // Index into the image candidate list; bumped by onError to walk the fallback chain.
  const [imgStep, setImgStep] = useState(0);

  const fetchApod = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      const response = await fetch("/api/nasa?endpoint=apod", {
        signal: AbortSignal.timeout(12_000),
      });

      if (!response.ok) {
        throw new Error(`APOD request failed with ${response.status}`);
      }

      const data = (await response.json()) as ApodData;
      setApod(data);
      setImgStep(0);
    } catch (fetchError) {
      console.error(fetchError);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchApod();
  }, [fetchApod]);

  if (loading && !apod) {
    return (
      <div className="glass-card p-6 animate-pulse">
        <div className="h-64 bg-white/5 rounded" />
      </div>
    );
  }

  if (error || !apod) {
    return (
      <div className="glass-card p-6">
        <h3 className="text-lg font-bold text-white mb-2">🌌 Astronomy Picture of the Day</h3>
        <p className="text-white/40 text-sm">NASA media is temporarily unavailable.</p>
        <button
          onClick={() => void fetchApod()}
          className="mt-2 text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-mono"
        >
          Retry
        </button>
      </div>
    );
  }

  const mediaUrl = apod.media_type === "video" ? apod.url : apod.hdurl || apod.url;

  // Display the ~960px `url` first — the card is only 256px tall, and APOD `hdurl`
  // originals are routinely 10-30 MB, which can exceed the image optimizer's source
  // limits or time out on cold load. Fall back to hdurl, then a styled placeholder.
  const imageCandidates = [apod.url, apod.hdurl].filter(
    (u, i, arr): u is string => Boolean(u) && arr.indexOf(u) === i
  );
  const imgSrc = imageCandidates[imgStep];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden">
      <div className="relative h-64 overflow-hidden bg-black">
        {apod.media_type === "video" ? (
          <iframe
            src={apod.url}
            title={apod.title}
            className="h-full w-full"
            allow="fullscreen; encrypted-media"
            allowFullScreen
          />
        ) : imgSrc ? (
          <Image
            key={imgSrc}
            src={imgSrc}
            alt={apod.title}
            fill
            className="object-cover"
            sizes="(min-width: 1280px) 420px, (min-width: 768px) 50vw, 100vw"
            onError={() => setImgStep((step) => step + 1)}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-indigo-950/60 via-black to-purple-950/40">
            <Telescope size={48} className="text-white/15" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
        <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full border border-white/10 bg-black/40 text-[10px] text-white/70 font-mono">
              {apod.media_type === "video" ? "NASA VIDEO" : "NASA APOD"}
            </span>
            <p className="text-xs text-white/70">{apod.date}</p>
          </div>
          <h3 className="text-lg font-bold text-white">{apod.title}</h3>
        </div>
      </div>
      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.p
            key={expanded ? "expanded" : "collapsed"}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`text-sm text-white/70 leading-relaxed mb-4 ${expanded ? "" : "line-clamp-2"}`}
          >
            {apod.explanation}
          </motion.p>
        </AnimatePresence>
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => setExpanded((value) => !value)}
            className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-mono"
          >
            {expanded ? "Show less" : "Read more"}
          </button>
          <a
            href={mediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-white/40 hover:text-white/70 transition-colors font-mono"
          >
            Open original ↗
          </a>
        </div>
      </div>
    </motion.div>
  );
}
