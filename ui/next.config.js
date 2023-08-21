/** @type {import('next').NextConfig} */
import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  experimental: {
    appDir: true,
  },
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "/api/:path*",
      },
      ...(process.env.NEXT_PUBLIC_HOST_REWRITE === "true"
        ? [
            {
              source: "/:path*",
              has: [
                {
                  type: "host",
                  value: process.env.INSERJEUNES_SITE_HOST, //"site.*.inserjeunes.beta.gouv.fr",
                },
              ],
              destination: "/inserjeunes/:path*",
            },

            {
              source: "/:path*",
              has: [
                {
                  type: "host",
                  value: process.env.INTERNAL_SITE_HOST, //"explorer.*.inserjeunes.beta.gouv.fr",
                },
              ],
              destination: "/explorer/:path*",
            },

            {
              source: "/:path*",
              has: [
                {
                  type: "host",
                  value: process.env.STATISTIQUES_SITE_HOST, //"statistiques.*.inserjeunes.beta.gouv.fr",
                },
              ],
              destination: "/statistiques/:path*",
            },
          ]
        : []),
    ];
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.woff2$/,
      type: "asset/resource",
    });

    return config;
  },
  modularizeImports: {
    "@mui/material": {
      transform: "@mui/material/{{member}}",
    },
    "@mui/icons-material": {
      transform: "@mui/icons-material/{{member}}",
    },
  },
};

module.exports = nextConfig;
