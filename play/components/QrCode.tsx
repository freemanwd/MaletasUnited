"use client";

import { useEffect, useState } from "react";

export function QrCode({ value, size = 168 }: { value: string; size?: number }) {
  const [svg, setSvg] = useState("");

  useEffect(() => {
    let cancelled = false;
    void import("qrcode").then((mod) =>
      mod.toString(value, { type: "svg", margin: 1, width: size }).then((markup) => {
        if (!cancelled) setSvg(markup);
      }),
    );
    return () => {
      cancelled = true;
    };
  }, [value, size]);

  if (!svg) {
    return (
      <div className="qr-ph" style={{ width: size, height: size }} aria-hidden>
        QR
      </div>
    );
  }

  return (
    <div
      className="qr"
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
