"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { MusicPanel } from "@/components/MusicPanel";
import { ToolCard } from "@/components/ToolCard";

const tools = [
  { title: "JSON Formatter", href: "/tools#json", description: "Validate & prettify JSON quickly." },
  { title: "Regex Tester", href: "/tools#regex", description: "Try patterns with flags & matches." },
  { title: "Base64 / URL", href: "/tools#base64", description: "Encode/decode helpers." },
];

export default function Home() {
  return (
    <main className="pb-20">
      <Hero />
      <section className="grid md:grid-cols-3 gap-6 mt-10">
        {tools.map((t) => <ToolCard key={t.title} {...t} />)}
      </section>
      <div className="mt-12">
        <MusicPanel />
      </div>
    </main>
  );
}

function Hero() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 p-10 md:p-16 gradient-ring">
      <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-4xl md:text-6xl font-semibold">
        Building bridges between code, design, and curiosity.
      </motion.h1>
      <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }} className="mt-4 text-white/70 max-w-2xl">
        A living interface for projects, tools, sound, and experiments. Enter the hub or explore the console.
      </motion.p>
      <div className="mt-8 flex gap-4">
        <Link className="primary" href="/tools">Enter Hub</Link>
        <Link className="link" href="/terminal">Open Terminal</Link>
      </div>
    </div>
  );
}
