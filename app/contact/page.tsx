"use client";

import { motion } from "framer-motion";
import { GrokStarfield } from "@/components/GrokStarfield";
import { Navbar } from "@/components/Navbar";
import { useState } from "react";
import { SocialIcon } from "@/components/SocialIcon";
import { siteConfig, socialLinks } from "@/lib/site-config";

export default function ContactPage() {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const copyEmail = () => {
    navigator.clipboard.writeText(siteConfig.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const quickFacts = [
    { label: "Location", value: siteConfig.location, icon: "📍" },
    { label: "Timezone", value: "EST (UTC-5)", icon: "🕐" },
    { label: "Response Time", value: "Within 24h", icon: "⚡" },
    { label: "Availability", value: "Open to projects", icon: "✅" },
  ];

  return (
    <>
      <GrokStarfield />
      <div className="aurora-bg"><div className="aurora-band" /><div className="aurora-band" /></div>
      
      <Navbar breadcrumb={["contact"]} />

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
                    <div className="text-2xl font-semibold text-white">{siteConfig.email}</div>
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
                    href={`mailto:${siteConfig.email}`}
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
              {socialLinks.filter((social) => social.name !== "Email").map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-card p-6 flex items-center gap-4 hover:scale-[1.02] transition-all group"
                >
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white ${
                    social.name === "GitHub" ? "bg-gradient-to-br from-gray-600 to-gray-800" : "bg-gradient-to-br from-blue-600 to-blue-800"
                  }`}>
                    <SocialIcon name={social.name} className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-white/50 mb-1">{social.name}</div>
                    <div className="text-lg font-semibold text-white">{social.label}</div>
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
