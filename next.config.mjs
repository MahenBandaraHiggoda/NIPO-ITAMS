/** @type {import('next').NextConfig} */
const backendOrigin = process.env.ITAMS_API_URL || "http://localhost:8080";

const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendOrigin}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
