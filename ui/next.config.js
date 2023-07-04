/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  experimental: {
    appDir: true,
  },
  output: "standalone",
  basePath: "/ui",
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
  env: {
    METABASE: {
      dashboards: {
        stats: {
          id: parseInt(process.env.METABASE_DASHBOARD_STATS_ID), //53,
          defaultQueryParams: {
            adresse_ip: ["213.91.3.170", "213.91.3.180", "195.83.117.34"],
          },
        },
        statsDetails: {
          id: parseInt(process.env.METABASE_DASHBOARD_STATS_DETAILS_ID), //47,
        },
      },
    },
  },
};

module.exports = nextConfig;
