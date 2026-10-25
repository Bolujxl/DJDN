import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

/**
 * Switzer: headings and display type. Self-hosted from app/fonts (Fontshare
 * free licence allows self-hosting). Three weights only: Regular, Medium
 * (the default heading weight) and Semibold.
 */
const switzer = localFont({
  src: [
    { path: "./fonts/Switzer-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Switzer-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/Switzer-Semibold.woff2", weight: "600", style: "normal" },
  ],
  display: "swap",
  variable: "--font-switzer",
});

/** Inter: subtext, body copy, navigation and all cart/checkout/account UI. */
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
    <html lang="en" className={`${switzer.variable} ${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
