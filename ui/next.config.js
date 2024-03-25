/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  experimental: {
    appDir: true,
  },
  output: "standalone",
  async rewrites() {
    return [
      ...(process.env.HOST_REWRITE === "true"
        ? [
            {
              source: "/api/:path*",
              destination: "/api/:path*",
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

            {
              source: "/:path*",
              has: [
                {
                  type: "host",
                  value: process.env.DOCUMENTATION_SITE_HOST, //"documentation.*.inserjeunes.beta.gouv.fr",
                },
              ],
              destination: "/documentation/:path*",
            },

            {
              source: "/:path*",
              has: [
                {
                  type: "host",
                  value: process.env.PRESCRIPTEUR_SITE_HOST, //"prescripteur.*.inserjeunes.beta.gouv.fr",
                },
              ],
              destination: "/prescripteur/:path*",
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
