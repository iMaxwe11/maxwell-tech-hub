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
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-lg"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
            className="mb-8"
          >
            <span className="text-[8rem] sm:text-[10rem] font-bold leading-none gradient-text">
              404
            </span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-white/70 text-lg sm:text-xl mb-2"
          >
            Lost in the void.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-white/40 text-sm font-mono mb-10"
          >
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </motion.p>

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
              <span>Back Home</span>
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
