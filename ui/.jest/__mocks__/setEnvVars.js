import { v4 } from "uuid";

process.env.METABASE_SITE_URL = "https://exposition.inserjeunes.beta.gouv.fr/metabase";
process.env.METABASE_SECRET_KEY = v4();
process.env.METABASE_DASHBOARD_STATS_ID = "53";
process.env.METABASE_DASHBOARD_STATS_DETAILS_ID = "47";
