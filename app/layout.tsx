import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

/**
 * Fraunces — headlines, product names, the logotype. Loaded self-hosted via
 * next/font/google (no external CDN call, no FOUC). Optical-sizing + a touch
 * of "soft" keeps it characterful without tipping into decorative.
 */
const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  style: ["normal", "italic"],
});

/** Inter — body copy, navigation, all cart / checkout / account UI. */
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://djdn.com"),
  title: {
    default: "DJDN — Considered everyday wear",
    template: "%s · DJDN",
  },
  description:
    "DJDN makes sophisticated, everyday clothing for men and women — quietly made, honestly priced.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
