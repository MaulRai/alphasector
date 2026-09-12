import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/copilot',
        destination: '/alpha-agent',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
