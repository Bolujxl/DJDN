import type { Metadata } from "next";
import { Inter, Unbounded } from "next/font/google";
import "./globals.css";

/**
 * Unbounded — headlines, product names, the logotype. Bold, geometric,
 * blocky — uniform thick strokes, not a thin/thick contrast serif. Went
 * through Fraunces (too soft/indie) then Bodoni Moda (a Didone — the
 * opposite of blocky, all hairline-vs-heavy-stem contrast) before landing
 * here. Also just fits what the actual product photography shows better:
 * an oval JDM-badge logo and streetwear silhouettes read as contemporary-
 * confident, not old-world fashion-magazine — Unbounded matches that.
 * Self-hosted via next/font/google — no external CDN call, no FOUC.
 */
const displayFont = Unbounded({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-unbounded",
  weight: ["500", "600", "700", "800"],
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
      className={`${displayFont.variable} ${inter.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
