import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.11", "192.168.1.0/24"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "danxospdekpkaitihjdt.supabase.co",
        pathname: "/storage/v1/object/public/listing-images/**",
      },
    ],
  },
};

export default nextConfig;
