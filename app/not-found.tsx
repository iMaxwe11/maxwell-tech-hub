"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { GrokStarfield } from "@/components/GrokStarfield";

export default function NotFound() {
  return (
    <>
      <GrokStarfield />
      <div className="aurora-bg">
        <div className="aurora-band" />
        <div className="aurora-band" />
      </div>

      <style>{`
        @keyframes glitch {
          0%, 100% {
            text-shadow:
              -2px 0 #06b6d4,
              2px 0 #a855f7,
              0 0 20px rgba(6, 182, 212, 0.5);
          }
          50% {
            text-shadow:
              2px 0 #06b6d4,
              -2px 0 #a855f7,
              0 0 20px rgba(168, 85, 247, 0.5);
          }
        }

        .glitch-404 {
          font-size: 8rem;
          font-weight: 900;
          font-family: monospace;
          letter-spacing: 0.1em;
          color: #f5f5f5;
          animation: glitch 0.3s infinite;
          text-transform: uppercase;
          line-height: 1;
          margin-bottom: 1rem;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
            opacity: 0.6;
          }
        }

        .floating-emoji {
          position: absolute;
          font-size: 3rem;
          animation: float 6s infinite;
          pointer-events: none;
        }

        .emoji-1 { left: 10%; top: 20%; animation-delay: 0s; }
        .emoji-2 { right: 15%; top: 30%; animation-delay: 2s; }
        .emoji-3 { left: 20%; bottom: 20%; animation-delay: 4s; }
        .emoji-4 { right: 10%; bottom: 15%; animation-delay: 1s; }
      `}</style>

      {/* Floating emojis */}
      <div className="floating-emoji emoji-1">🚀</div>
      <div className="floating-emoji emoji-2">💀</div>
      <div className="floating-emoji emoji-3">🔥</div>
      <div className="floating-emoji emoji-4">⚡</div>

      <div className="min-h-screen flex items-center justify-center px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-2xl"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
            className="mb-8"
          >
            <span className="glitch-404">404</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-2xl md:text-3xl font-bold text-white mb-4"
          >
            This page got lost in the void.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-white/70 text-base md:text-lg mb-8"
          >
            Either you typed something wrong, or I broke something. Both are possible.
          </motion.p>

          {/* Terminal box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="bg-black/40 border border-cyan-500/30 rounded-lg p-6 mb-8 font-mono text-sm text-left max-w-md mx-auto backdrop-blur-sm"
          >
            <div className="text-cyan-400">$ curl maxwellnixon.com/[your-path]</div>
            <div className="text-red-400 mt-2">→ 404 NOT FOUND</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Link href="/" className="glow-btn glow-btn-filled">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span>Take me home</span>
            </Link>
            <Link href="/tools" className="glow-btn">
              <span>Developer Tools</span>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-16 text-white/15 text-xs font-mono"
          >
            error_code: PAGE_NOT_FOUND · status: 404
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}
