import { ImageResponse } from "next/og";

export const alt = "Jev 8 Ball — The worlds most powerful Magic 8 Ball powered by Jev";
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
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #09090b 0%, #18181b 50%, #0c1929 100%)",
          color: "#fafafa",
          padding: 64,
        }}
      >
        <div style={{ fontSize: 120, marginBottom: 24 }}>🎱</div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            letterSpacing: -1,
            marginBottom: 16,
          }}
        >
          Jev 8 Ball
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#a1a1aa",
            textAlign: "center",
            maxWidth: 900,
            lineHeight: 1.35,
          }}
        >
          The worlds most powerful Magic 8 Ball powered by Jev
        </div>
      </div>
    ),
    { ...size }
  );
}
