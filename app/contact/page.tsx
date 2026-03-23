"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { GrokStarfield } from "@/components/GrokStarfield";
import { useState } from "react";

export default function ContactPage() {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const copyEmail = () => {
    navigator.clipboard.writeText("mnixon112@outlook.com");
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const socials = [
    {
      name: "GitHub",
      handle: "@iMaxwe11",
      href: "https://github.com/iMaxwe11",
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.430.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      ),
      color: "from-gray-600 to-gray-800",
    },
    {
      name: "LinkedIn",
      handle: "Maxwell Nixon",
      href: "https://linkedin.com/in/maxwell-nixon",
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
      color: "from-blue-600 to-blue-800",
    },
  ];

  const quickFacts = [
    { label: "Location", value: "Southampton, NJ", icon: "📍" },
    { label: "Timezone", value: "EST (UTC-5)", icon: "🕐" },
    { label: "Response Time", value: "Within 24h", icon: "⚡" },
    { label: "Availability", value: "Open to projects", icon: "✅" },
  ];

  return (
    <>
      <GrokStarfield />
      <div className="aurora-bg"><div className="aurora-band" /><div className="aurora-band" /></div>
      
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/[0.15]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 opacity-30 group-hover:opacity-50 transition-opacity" />
              <div className="absolute inset-[2px] rounded-[6px] bg-[#050505] flex items-center justify-center">
                <span className="text-xs font-bold gradient-text">M</span>
              </div>
            </div>
            <span className="text-base font-semibold text-white/90 hover:text-white transition-colors hidden sm:inline">
              maxwellnixon<span className="text-cyan-400">.</span>com
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <Link href="/" className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors font-mono">
              Home
            </Link>
            <Link href="/tools" className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors font-mono">
              Tools
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative min-h-screen pt-32 pb-16 px-4 sm:px-6">
        <div className="max-w-[1000px] mx-auto">
          
          {/* Hero */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="text-center mb-20"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.8 }}
              className="inline-block mb-6"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 p-1">
                <div className="w-full h-full rounded-full bg-[#0a0a0a] flex items-center justify-center">
                  <span className="text-4xl font-bold gradient-text">MN</span>
                </div>
              </div>
            </motion.div>
            
            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-4">
              Let's Build Something <span className="gradient-text">Amazing</span>
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Full-stack developer & designer crafting premium software experiences. 
              Open to collaborations, freelance work, and interesting tech conversations.
            </p>
          </motion.div>

          {/* Email Card (Primary CTA) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <div className="glass-card p-8 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center text-3xl">
                    📧
                  </div>
                  <div>
                    <div className="text-sm text-white/50 mb-1">Primary Email</div>
                    <div className="text-2xl font-semibold text-white">mnixon112@outlook.com</div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={copyEmail}
                    className="px-6 py-3 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium transition-all flex items-center gap-2"
                  >
                    {copiedEmail ? (
                      <>
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-green-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                  
                  <a
                    href="mailto:mnixon112@outlook.com"
                    className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-medium hover:from-cyan-400 hover:to-purple-500 transition-all flex items-center gap-2"
                  >
                    <span>Send Email</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Connect</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {socials.map((social, i) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-card p-6 flex items-center gap-4 hover:scale-[1.02] transition-all group"
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${social.color} flex items-center justify-center text-white`}>
                    {social.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-white/50 mb-1">{social.name}</div>
                    <div className="text-lg font-semibold text-white">{social.handle}</div>
                  </div>
                  <svg className="w-5 h-5 text-white/30 group-hover:text-white/60 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              ))}
            </div>
          </motion.div>

          {/* Quick Facts Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6">Quick Facts</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickFacts.map((fact, i) => (
                <div key={fact.label} className="glass-card p-6 text-center">
                  <div className="text-3xl mb-3">{fact.icon}</div>
                  <div className="text-sm text-white/50 mb-2">{fact.label}</div>
                  <div className="text-white font-semibold">{fact.value}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Footer CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-16 text-center glass-card p-8"
          >
            <p className="text-white/70 text-lg leading-relaxed max-w-2xl mx-auto">
              Whether you have a project in mind, need a developer for your team, or just want to chat about tech — 
              <span className="gradient-text font-semibold"> I'd love to hear from you.</span>
            </p>
          </motion.div>

        </div>
      </main>
    </>
  );
}
