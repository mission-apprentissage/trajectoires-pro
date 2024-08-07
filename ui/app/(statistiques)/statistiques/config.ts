const Config = {
  METABASE: {
    dashboards: {
      stats: {
        id: parseInt(process.env.METABASE_DASHBOARD_STATS_ID || "53"), //53,
        defaultQueryParams: {
          adresse_ip: [],
          consommateur: "Toutes",
        },
        hideParams: ["adresse_ip", "consommateur"],
      },
      statsDetails: {
        id: parseInt(process.env.METABASE_DASHBOARD_STATS_DETAILS_ID || "47"), //47,
        hideParams: ["adresse_ip"],
      },
      statsRegion: {
        id: parseInt(process.env.METABASE_DASHBOARD_STATS_REGION_ID || "58"), // 58
      },
    },
    metrics: {
      views: process.env.METABASE_METRICS_VIEWS || "32817efa-ebc7-4250-b0de-6c18db1ebc12",
    },
  },
};

export default Config;
