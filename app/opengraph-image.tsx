import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";

/**
 * Share card for links to the site (WhatsApp, iMessage, X, Facebook): the
 * white logo on bottle green with the tagline. Pages that set their own
 * Open Graph image, like products, override it.
 */
export const alt = "DJDN. Everything you need, nothing you don't.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logo = await readFile(
    path.join(process.cwd(), "public/brand/logo/djdn-logo-white.png"),
  );
  const src = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "#1f3d2b",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} width={620} height={274} alt="" />
        <div
          style={{
            marginTop: 56,
            fontSize: 34,
            letterSpacing: "-0.01em",
            color: "#b8c4bb",
          }}
        >
          Everything you need, nothing you don&apos;t
        </div>
      </div>
    ),
    size,
  );
}
