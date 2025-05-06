import env from "env-var";
import path from "path";
import { getDirname } from "#src/common/utils/esmUtils.js";

const config = {
  env: env.get("TRAJECTOIRES_PRO_ENV").default("local").asString(),
  publicUrl: env.get("TRAJECTOIRES_PRO_PUBLIC_URL").default("http://localhost").asString(),
  log: {
    level: env.get("TRAJECTOIRES_PRO_LOG_LEVEL").default("info").asString(),
    format: env.get("TRAJECTOIRES_PRO_LOG_FORMAT").default("pretty").asString(),
    destinations: env.get("TRAJECTOIRES_PRO_LOG_DESTINATIONS").default("stdout").asArray(),
  },
  slackWebhookUrl: env.get("TRAJECTOIRES_PRO_SLACK_WEBHOOK_URL").asString(),
  auth: {
    jwtSecret: env.get("TRAJECTOIRES_PRO_AUTH_JWT_SECRET").required().asString(),
    jwtIssuer: "exposition-ij",
    jwtExpirationTime: "1d",
  },
  mongodb: {
    uri: env
      .get("TRAJECTOIRES_PRO_MONGODB_URI")
      .default("mongodb://127.0.0.1:27017/trajectoires-pro?retryWrites=true&w=majority")
      .asString(),
  },
  inserJeunes: {
    api: {
      username: env.get("TRAJECTOIRES_PRO_INSERJEUNES_USERNAME").required().asString(),
      password: env.get("TRAJECTOIRES_PRO_INSERJEUNES_PASSWORD").required().asString(),
      key: env.get("TRAJECTOIRES_PRO_API_KEY").required().asString(),
    },
  },
  inserSup: {
    api: {
      baseUrl: env.get("TRAJECTOIRES_PRO_INSERSUP_BASE_URL").required().asString(),
      key: env.get("TRAJECTOIRES_PRO_INSERSUP_API_KEY").required().asString(),
    },
  },
  dataenseignementsup: {
    api: {
      domain: env
        .get("DATAENSEIGNEMENTSUP_DOMAIN")
        .default("https://data.enseignementsup-recherche.gouv.fr")
        .asString(),
    },
    datasets: {
      insersup: "fr-esr-insersup",
    },
  },
  catalogueApprentissage: {
    api: {
      baseUrl: env
        .get("CATALOGUE_APPRENTISSAGE_BASE_URL")
        .default("https://catalogue.apprentissage.education.gouv.fr/api/v1")
        .asString(),
      username: env.get("CATALOGUE_APPRENTISSAGE_USERNAME").required().asString(),
      password: env.get("CATALOGUE_APPRENTISSAGE_PASSWORD").required().asString(),
    },
  },
  acce: {
    files: {
      etablissements: path.join(getDirname(import.meta.url), "../data/", "acce_etablissements.csv"),
    },
  },
  bcn: {
    files: {
      familleMetier: path.join(getDirname(import.meta.url), "..", "data", "bcn", "n_famille_metier_spec_pro.csv"),
      lienFamilleMetier: path.join(getDirname(import.meta.url), "..", "data", "bcn", "n_lien_mef_famille_metier.csv"),
    },
  },
  millesimes: {
    default: env.get("TRAJECTOIRES_PRO_MILLESIMES").default("2020,2021,2022,2023").asArray(),
    defaultSup: env.get("MILLESIMES_SUP").default("2019,2020,2021,2022,2023").asArray(),
    formations: env
      .get("TRAJECTOIRES_PRO_MILLESIMES_FORMATIONS")
      .default("2019_2020,2020_2021,2021_2022,2022_2023")
      .asArray(),
    formationsSup: env.get("MILLESIMES_FORMATIONS_SUP").default("2019_2020,2020_2021,2021_2022,2022_2023").asArray(),
    regionales: env
      .get("TRAJECTOIRES_PRO_MILLESIMES_REGIONALES")
      .default("2019_2020,2020_2021,2021_2022,2022_2023")
      .asArray(),
  },
};

export default config;
