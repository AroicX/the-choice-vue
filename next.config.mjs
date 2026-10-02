/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["remotion", "@remotion/player"],
  experimental: {
    // OG image routes read their fonts and halftone art from disk at runtime.
    outputFileTracingIncludes: {
      "/**/opengraph-image*": ["./src/lib/og-assets/**/*"]
    }
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" }
    ]
  }
};

export default nextConfig;
