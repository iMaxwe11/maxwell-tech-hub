import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tesla Hub",
  description: "In-car launcher for streaming, cloud gaming, and Plex.",
};

export default function TeslaPage() {
  // NOTE: no position:fixed here. The root layout's PageTransition wraps
  // pages in a motion.div with will-change/transform/filter, which makes it
  // the containing block for fixed descendants — a fixed iframe collapses to
  // 0 height and renders blank. In-flow + viewport units sidesteps that.
  return (
    <iframe
      src="/tesla-hub.html"
      title="Tesla Hub"
      allow="fullscreen"
      allowFullScreen
      style={{
        display: "block",
        width: "100%",
        height: "100dvh",
        minHeight: "600px",
        border: 0,
        background: "#0a0a0c",
      }}
    />
  );
}
