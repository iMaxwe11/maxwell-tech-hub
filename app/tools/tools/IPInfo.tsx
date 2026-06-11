"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { copyToClipboard } from "@/lib/toast";
import { Section } from "../shared";

interface IpLookup {
  ip?: string;
  city?: string;
  region?: string;
  country_name?: string;
  org?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
}

export function IPInfo() {
  const [info, setInfo] = useState<IpLookup | null>(null); const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("https://ipapi.co/json/").then(r => r.json()).then(data => { setInfo(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);
  const fields = info ? [
    ["IP", info.ip], ["City", info.city], ["Region", info.region], ["Country", info.country_name],
    ["ISP", info.org], ["Timezone", info.timezone], ["Latitude", info.latitude], ["Longitude", info.longitude],
  ].filter(([,v]) => v) : [];
  return (
    <Section id="ipinfo" title="IP Address Info" desc="Your public IP and geolocation details." accent="cyan" index={17}>
      {loading ? (<div className="h-32 bg-white/5 rounded-lg animate-pulse" />) : info ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {fields.map(([label, val]) => (
            <motion.div key={label} whileHover={{ y: -2, scale: 1.03 }} className="rounded-lg p-3 bg-black/20 border border-white/[0.04] cursor-pointer group" onClick={() => copyToClipboard(String(val))}>
              <div className="text-[0.6rem] text-[var(--text-muted)] font-[family-name:var(--font-mono)] uppercase tracking-wider">{label}</div>
              <div className="text-sm text-[var(--text-primary)] font-[family-name:var(--font-mono)] mt-1 break-all">{String(val)}</div>
              <div className="text-[0.5rem] text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity mt-1">copy</div>
            </motion.div>
          ))}
        </div>
      ) : (<div className="text-xs text-[var(--text-muted)]">Could not fetch IP info.</div>)}
    </Section>
  );
}
