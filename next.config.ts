import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
