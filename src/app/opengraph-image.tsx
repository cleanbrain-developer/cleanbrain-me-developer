import { ImageResponse } from "next/og";
import { profile } from "@/content/profile";

export const alt = `${profile.name} — ${profile.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-static";

// Next.js's file-based metadata convention (same mechanism already used for
// favicon/icon/apple-icon) — prerendered to a static PNG at build time, so
// it works under output: "export" with no runtime image generation needed.
// Falls back to serving as both og:image and twitter:image automatically
// (no separate twitter-image.tsx needed) since no twitter-image file exists.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#0b0d10",
          color: "#e7e9ec",
        }}
      >
        <div style={{ display: "flex", width: 56, height: 6, background: "#5b8def" }} />

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontFamily: "monospace",
              fontSize: 32,
              color: "#5b8def",
              marginBottom: 20,
            }}
          >
            {profile.name}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 56,
              fontWeight: 700,
              lineHeight: 1.15,
              maxWidth: 980,
            }}
          >
            {profile.tagline}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontSize: 26, color: "#9aa3ad" }}>
            {profile.role} &middot; {profile.yearsOfExperience}+ years
          </div>
          <div style={{ display: "flex", fontFamily: "monospace", fontSize: 22, color: "#9aa3ad" }}>
            developer.cleanbrain.me
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
