import { ImageResponse } from "next/og";

export const alt =
  "Maletas United — Where Soccer and Laughter Never Get Old. Pickup soccer in Jacksonville, FL.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#10261c",
          color: "#f4ead8",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 36,
            border: "2px solid #c9a227",
            display: "flex",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "72px 80px",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 28,
              marginBottom: 28,
            }}
          >
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: 999,
                background: "#1f6b45",
                border: "6px solid #c9a227",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 54,
              }}
            >
              ⚽
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  fontSize: 22,
                  letterSpacing: 8,
                  textTransform: "uppercase",
                  color: "#e8d48a",
                }}
              >
                Jacksonville, FL
              </div>
              <div
                style={{
                  fontSize: 72,
                  fontWeight: 700,
                  lineHeight: 1,
                  marginTop: 8,
                }}
              >
                Maletas United
              </div>
            </div>
          </div>
          <div
            style={{
              fontSize: 36,
              lineHeight: 1.25,
              color: "#e8d48a",
              maxWidth: 920,
            }}
          >
            Where Soccer and Laughter Never Get Old
          </div>
          <div
            style={{
              marginTop: 28,
              display: "flex",
              gap: 16,
              fontSize: 22,
              color: "#dce6d8",
            }}
          >
            <span>No fixed schedule</span>
            <span>·</span>
            <span>No entrance fees</span>
            <span>·</span>
            <span>Not a nonprofit</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
