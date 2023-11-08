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
  ovh: {
    storage: {
      uri: env.get("TRAJECTOIRES_PRO_OVH_STORAGE_URI").required().asString(),
      storageName: env.get("TRAJECTOIRES_PRO_OVH_STORAGE_NAME").default("mna-trajectoires-pro").asString(),
    },
  },
  inserJeunes: {
    api: {
      username: env.get("TRAJECTOIRES_PRO_INSERJEUNES_USERNAME").required().asString(),
      password: env.get("TRAJECTOIRES_PRO_INSERJEUNES_PASSWORD").required().asString(),
      key: env.get("TRAJECTOIRES_PRO_API_KEY").required().asString(),
    },
  },
  diagoriente: {
    api: {
      baseUrl: env.get("DIAGORIENTE_BASE_URL").default("https://oplc.diagoriente.beta.gouv.fr/graphql").asString(),
      loginUrl: env
        .get("DIAGORIENTE_LOGIN_URL")
        .default("https://auth.diagoriente.beta.gouv.fr/auth/realms/oplc-production/protocol/openid-connect/token")
        .asString(),
      clientId: env.get("DIAGORIENTE_CLIENT_ID").required().asString(),
      clientSecret: env.get("DIAGORIENTE_CLIENT_SECRET").required().asString(),
      grandType: env.get("DIAGORIENTE_GRANT_TYPE").default("client_credentials").asString(),
    },
  },
  datagouv: {
    api: {
      baseUrl: env.get("DATAGOUV_BASE_URL").default("https://www.data.gouv.fr/api/1").asString(),
    },
    datasets: {
      rome: "1c893376-8476-4262-9a0e-8df519883e1e",
    },
  },
  acce: {
    files: {
      etablissements: path.join(getDirname(import.meta.url), "../data/", "acce_etablissements.csv"),
    },
  },
  millesimes: {
    default: env.get("TRAJECTOIRES_PRO_MILLESIMES").default("2019,2020,2021").asArray(),
    formations: env.get("TRAJECTOIRES_PRO_MILLESIMES_FORMATIONS").default("2018_2019,2019_2020,2020_2021").asArray(),
    regionales: env.get("TRAJECTOIRES_PRO_MILLESIMES_REGIONALES").default("2019_2020,2020_2021").asArray(),
  },
};

export default config;
