// /** @type {import('next').NextConfig} */
// const nextConfig = {};

// export default nextConfig;
// /** @type {import('next').NextConfig} */
// const nextConfig = {};

// export default nextConfig;
/* next.config.js */
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
  //   async rewrites() {
  //     return [
  //       {
  //         source: "/api/:path*",
  //         destination: "http://localhost:4000/app/:path*",
  //       },
  //     ];
  //   },
};

export default nextConfig;
