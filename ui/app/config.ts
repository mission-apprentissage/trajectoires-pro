const Config = {
  METABASE: {
    dashboards: {
      stats: {
        id: parseInt(process.env.METABASE_DASHBOARD_STATS_ID || ""), //53,
        defaultQueryParams: {
          adresse_ip: ["213.91.3.170", "213.91.3.180", "195.83.117.34"],
          consommateur: "ONISEP",
        },
        hideParams: ["adresse_ip", "consommateur"],
      },
      statsDetails: {
        id: parseInt(process.env.METABASE_DASHBOARD_STATS_DETAILS_ID || ""), //47,
        hideParams: ["adresse_ip"],
      },
    },
  },
};

export default Config;
