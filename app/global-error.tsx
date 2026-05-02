"use client";

import { useEffect } from "react";

/**
 * global-error.tsx replaces the root layout when the layout itself throws.
 * It MUST render its own <html> and <body>. No Tailwind classes are guaranteed
 * to be available here, so we inline the bare-minimum styles needed.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app/global-error] root layout error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          background: "#020204",
          color: "#f5f5f5",
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
        }}
      >
        <div style={{ maxWidth: 560, textAlign: "center" }}>
          <h1
            style={{
              fontSize: "3rem",
              fontFamily: "monospace",
              letterSpacing: "0.08em",
              margin: 0,
              color: "#ef4444",
            }}
          >
            500
          </h1>
          <h2 style={{ fontSize: "1.5rem", margin: "1rem 0 0.5rem" }}>
            Something blew up at the root.
          </h2>
          <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>
            The application failed to load its layout. This usually means a build
            artifact got corrupted — refreshing usually fixes it.
          </p>
          <pre
            style={{
              marginTop: "1rem",
              padding: "1rem",
              background: "rgba(0,0,0,0.4)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 8,
              fontSize: "0.85rem",
              color: "rgba(255,255,255,0.6)",
              textAlign: "left",
              overflow: "auto",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {error.message || "Unknown error"}
            {error.digest ? `\ndigest: ${error.digest}` : ""}
          </pre>
          <div style={{ marginTop: "1.5rem", display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={reset}
              style={{
                padding: "0.6rem 1.2rem",
                background: "linear-gradient(90deg, #06b6d4, #a855f7)",
                color: "white",
                border: "none",
                borderRadius: 8,
                fontSize: "0.9rem",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                padding: "0.6rem 1.2rem",
                background: "transparent",
                color: "white",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 8,
                fontSize: "0.9rem",
                textDecoration: "none",
              }}
            >
              Back home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
