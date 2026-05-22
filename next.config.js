/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  devIndicators: {
    position: "top-right", // Options: 'bottom-left', 'bottom-right', 'top-left', 'top-right'
  },
};

module.exports = nextConfig;
