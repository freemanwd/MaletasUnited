import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };

export function playOgImage(opts: {
  kicker: string;
  title: string;
  lines?: string[];
}) {
  const lines = (opts.lines ?? []).filter(Boolean).slice(0, 5);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0f5c3a",
          color: "#f2f5ec",
          padding: "64px 72px",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              display: "flex",
              fontSize: 28,
              letterSpacing: 2,
              textTransform: "uppercase",
              opacity: 0.85,
            }}
          >
            {opts.kicker}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: opts.title.length > 70 ? 52 : 64,
              lineHeight: 1.1,
              fontWeight: 700,
              maxWidth: 1000,
            }}
          >
            {opts.title}
          </div>
          {lines.map((line) => (
            <div key={line} style={{ display: "flex", fontSize: 32, opacity: 0.92 }}>
              {line}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", fontSize: 28, opacity: 0.85 }}>via Maletas Play</div>
      </div>
    ),
    { ...ogSize },
  );
}
