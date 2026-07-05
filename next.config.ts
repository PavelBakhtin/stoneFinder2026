import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
