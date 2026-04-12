export default function Loading() {
  return (
    <div className="min-h-screen bg-[#020204] flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 opacity-30 animate-spin" 
               style={{ animationDuration: '3s' }} />
          <div className="absolute inset-[3px] rounded-[10px] bg-[#050505] flex items-center justify-center">
            <span className="text-lg font-bold gradient-text">M</span>
          </div>
        </div>
        <div className="flex items-center gap-2 justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 animate-pulse" />
          <span className="text-white/40 text-xs font-mono tracking-wider">Loading</span>
          <div className="flex gap-0.5">
            <span className="w-1 h-1 rounded-full bg-white/20 animate-pulse" style={{ animationDelay: '0s' }} />
            <span className="w-1 h-1 rounded-full bg-white/20 animate-pulse" style={{ animationDelay: '0.2s' }} />
            <span className="w-1 h-1 rounded-full bg-white/20 animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
