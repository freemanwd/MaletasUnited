import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f2f5ec",
        }}
      >
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: 999,
            border: "3px solid #0f5c3a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              background: "#ff5a1f",
            }}
          />
        </div>
      </div>
    ),
    size,
  );
}
