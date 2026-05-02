"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the error in the browser console for diagnosability.
    // Production telemetry (Vercel Analytics / Sentry) can hook in later.
    console.error("[app/error] runtime error:", error);
  }, [error]);

  return (
    <>
      <div className="aurora-bg">
        <div className="aurora-band" />
        <div className="aurora-band" />
      </div>

      <style>{`
        @keyframes glitch-err {
          0%, 100% {
            text-shadow:
              -2px 0 #ef4444,
              2px 0 #f59e0b,
              0 0 20px rgba(239, 68, 68, 0.5);
          }
          50% {
            text-shadow:
              2px 0 #ef4444,
              -2px 0 #f59e0b,
              0 0 20px rgba(245, 158, 11, 0.5);
          }
        }
        .glitch-err {
          font-size: 6rem;
          font-weight: 900;
          font-family: monospace;
          letter-spacing: 0.08em;
          color: #f5f5f5;
          animation: glitch-err 0.3s infinite;
          text-transform: uppercase;
          line-height: 1;
          margin-bottom: 1rem;
        }
      `}</style>

      <div className="min-h-screen flex items-center justify-center px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 100 }}
            className="mb-6"
          >
            <span className="glitch-err">500</span>
          </motion.div>

          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Something blew up on our end.
          </h2>
          <p className="text-white/70 text-base md:text-lg mb-7">
            An unexpected error fired while rendering this page. The kernel panicked,
            but everything else is still up.
          </p>

          <div className="bg-black/40 border border-red-500/30 rounded-lg p-5 mb-7 font-mono text-sm text-left max-w-lg mx-auto backdrop-blur-sm">
            <div className="text-red-400">$ runtime error</div>
            <div className="text-white/60 mt-2 break-words">
              {error.message || "Unknown error"}
            </div>
            {error.digest && (
              <div className="text-white/30 mt-2 text-xs">
                digest: {error.digest}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <button onClick={reset} className="glow-btn glow-btn-filled">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M8 16H3v5" />
              </svg>
              <span>Try again</span>
            </button>
            <Link href="/" className="glow-btn">
              <span>Back home</span>
            </Link>
          </div>

          <div className="mt-12 text-white/15 text-xs font-mono">
            error_code: RUNTIME_EXCEPTION · status: 500
          </div>
        </motion.div>
      </div>
    </>
  );
}
