import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 96,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 360,
            height: 360,
            borderRadius: 72,
            background: "#00c853",
            color: "#031d0d",
            fontSize: 160,
            fontWeight: 800,
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
            letterSpacing: "-0.05em",
          }}
        >
          CB
        </div>
      </div>
    ),
    { ...size },
  );
}
