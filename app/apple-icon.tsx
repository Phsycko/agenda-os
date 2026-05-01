import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#050505",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 150,
            height: 150,
            borderRadius: 36,
            background: "#00c853",
            color: "#031d0d",
            fontSize: 64,
            fontWeight: 800,
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
          }}
        >
          CB
        </div>
      </div>
    ),
    { ...size },
  );
}
