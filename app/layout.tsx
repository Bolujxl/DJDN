import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

/**
 * Geist — one tight grotesque for everything (display, UI, body). The
 * editorial references (Rains, about:blank) all lean on a single neutral
 * grotesque with hierarchy carried by size and weight, not by pairing a
 * second family. Replaced Unbounded, whose wide geometric blocks read as
 * sporty/tech rather than fashion.
 */
const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
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
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
