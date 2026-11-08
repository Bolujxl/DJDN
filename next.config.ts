import type { NextConfig } from "next";

/**
 * Baseline security headers for every route. No Content-Security-Policy yet:
 * a useful one has to name the payment provider's domains, which aren't
 * settled, and a loose one (default-src *) adds nothing. Add it with checkout.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  // Product photos from Sanity, once the storefront reads from it.
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // Contact folded into Customer care, which carries the contact details.
  async redirects() {
    return [
      {
        source: "/contact",
        destination: "/customer-care#contact",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
