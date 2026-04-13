"use client";

import dynamic from "next/dynamic";

const ToolSuite = dynamic(() => import("./ToolSuite"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#020204] pt-24 pb-20 px-4 sm:px-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="glass-card p-8 animate-pulse">
          <div className="h-4 w-40 bg-white/10 rounded mb-4" />
          <div className="h-10 w-72 bg-white/10 rounded mb-3" />
          <div className="h-4 w-full max-w-xl bg-white/10 rounded mb-8" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-48 rounded-2xl bg-white/[0.03] border border-white/[0.05]" />
            <div className="h-48 rounded-2xl bg-white/[0.03] border border-white/[0.05]" />
          </div>
        </div>
      </div>
    </div>
  ),
});

export function ToolsClientShell() {
  return <ToolSuite />;
}
