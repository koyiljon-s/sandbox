import { ImageResponse } from "next/og";

/** iOS home-screen icon, drawn from the same artwork as app/icon.svg. */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const PATHS = [
  "M19 6.844a2.007 2.007 0 0 1 1 1.752v6.555c0 .728 -.394 1.399 -1.03 1.753l-6 3.844a2 2 0 0 1 -1.942 0l-6 -3.844a2.007 2.007 0 0 1 -1.029 -1.752v-6.556c0 -.729 .394 -1.4 1.029 -1.753l6 -3.583a2.05 2.05 0 0 1 2 0l6 3.584h-.03l.002 0",
  "M12 16.5v4.5",
  "M4.5 7.5l3.5 2.5",
  "M16 10l4 -2.5",
  "M12 7.5v4.5l-4 2",
  "M12 12l4 2",
  "M12 16.5l4 -2.5v-4l-4 -2.5l-4 2.5v4l4 2.5",
];

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#1f1f1f" }}>
        <svg width="112" height="112" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          {PATHS.map((d) => (
            <path key={d} d={d} />
          ))}
        </svg>
      </div>
    ),
    size,
  );
}
