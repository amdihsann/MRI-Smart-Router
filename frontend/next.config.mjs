/** @type {import('next').NextConfig} */
const backendUrl = process.env.BACKEND_URL?.replace(/\/+$/, "");

const nextConfig = {
  async rewrites() {
    if (!backendUrl) {
      console.warn("[next.config] BACKEND_URL is not configured. API rewrites are disabled.");
      return [];
    }
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
