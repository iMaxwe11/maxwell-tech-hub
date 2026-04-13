import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title")?.slice(0, 70) || "Maxwell Nixon";
  const tag = searchParams.get("tag")?.slice(0, 24) || "Portfolio";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          position: "relative",
          background: "linear-gradient(135deg, #020204 0%, #05070d 50%, #020204 100%)",
          color: "white",
          fontFamily: "system-ui, sans-serif",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 18% 24%, rgba(6,182,212,0.28), transparent 38%), radial-gradient(circle at 84% 20%, rgba(168,85,247,0.24), transparent 34%), radial-gradient(circle at 52% 78%, rgba(245,158,11,0.20), transparent 30%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 32,
            borderRadius: 28,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.03)",
            backdropFilter: "blur(18px)",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            padding: "72px 84px",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
              }}
            >
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 16,
                  background: "linear-gradient(135deg, #06b6d4, #a855f7)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                  fontWeight: 700,
                  boxShadow: "0 0 36px rgba(6,182,212,0.22)",
                }}
              >
                M
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: 18, letterSpacing: 4, textTransform: "uppercase", color: "rgba(255,255,255,0.55)" }}>
                  maxwellnixon.com
                </div>
                <div style={{ fontSize: 24, color: "rgba(255,255,255,0.8)" }}>IT Systems • Cloud • DevOps</div>
              </div>
            </div>
            <div
              style={{
                borderRadius: 999,
                padding: "10px 20px",
                border: "1px solid rgba(6,182,212,0.35)",
                background: "rgba(6,182,212,0.08)",
                fontSize: 20,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: "#67e8f9",
              }}
            >
              {tag}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 920 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                color: "rgba(255,255,255,0.55)",
                fontSize: 20,
                letterSpacing: 3,
                textTransform: "uppercase",
              }}
            >
              <div style={{ width: 40, height: 2, background: "#06b6d4", borderRadius: 999 }} />
              Obsidian Luxe
            </div>
            <div
              style={{
                fontSize: 72,
                lineHeight: 1.02,
                fontWeight: 800,
                display: "flex",
                flexWrap: "wrap",
              }}
            >
              {title}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              alignItems: "center",
              color: "rgba(255,255,255,0.65)",
              fontSize: 22,
            }}
          >
            <div style={{ display: "flex", gap: 22 }}>
              <span>Live dashboards</span>
              <span>Custom tooling</span>
              <span>Portfolio engineering</span>
            </div>
            <div style={{ color: "#fbbf24" }}>maxwellnixon.com</div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
