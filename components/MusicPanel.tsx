"use client";
import { useState } from "react";

const DEFAULT_SPOTIFY = "https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M?utm_source=generator";
const DEFAULT_SOUNDCLOUD = "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/13158665&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true";

export function MusicPanel() {
  const [provider, setProvider] = useState<"spotify" | "soundcloud">("spotify");
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">Music</h2>
        <div className="flex gap-2">
          <button className={`px-3 py-1 rounded-lg ${provider==='spotify'?'bg-accent text-black':'bg-white/10'}`} onClick={()=>setProvider("spotify")}>Spotify</button>
          <button className={`px-3 py-1 rounded-lg ${provider==='soundcloud'?'bg-accent text-black':'bg-white/10'}`} onClick={()=>setProvider("soundcloud")}>SoundCloud</button>
        </div>
      </div>
      {provider === "spotify" ? (
        <iframe style={{ borderRadius: 12, width: "100%", height: 352 }} src={DEFAULT_SPOTIFY} allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" />
      ) : (
        <iframe width="100%" height="166" scrolling="no" frameBorder="no" allow="autoplay" src={DEFAULT_SOUNDCLOUD} />
      )}
      <p className="text-xs text-white/50 mt-3">Swap the playlist/track URLs in <code>components/MusicPanel.tsx</code>.</p>
    </div>
  );
}
