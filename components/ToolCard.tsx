"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export function ToolCard({ title, href, description }:{ title:string; href:string; description:string }) {
  return (
    <motion.div whileHover={{ y: -3, scale: 1.01 }} className="card">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-white/70 mt-1">{description}</p>
      <Link className="link inline-block mt-3" href={href}>Open →</Link>
    </motion.div>
  );
}
