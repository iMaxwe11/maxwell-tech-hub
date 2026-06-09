import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tesla Hub",
  description: "In-car launcher for streaming, cloud gaming, and Plex.",
};

export default function TeslaPage() {
  return (
    <iframe
      src="/tesla-hub.html"
      title="Tesla Hub"
      allow="fullscreen"
      allowFullScreen
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        border: 0,
        zIndex: 9999,
        background: "#0a0a0c",
      }}
    />
  );
}
