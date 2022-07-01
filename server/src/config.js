/* eslint-disable import/no-named-as-default-member */ // disabled because env-var is still a commonJS module
import env from "env-var";

const config = {
  env: env.get("TRAJECTOIRES_PRO_ENV").default("local").asString(),
  publicUrl: env.get("TRAJECTOIRES_PRO_PUBLIC_URL").default("http://localhost").asString(),
  log: {
    level: env.get("TRAJECTOIRES_PRO_LOG_LEVEL").default("info").asString(),
    format: env.get("TRAJECTOIRES_PRO_LOG_FORMAT").default("pretty").asString(),
    destinations: env.get("TRAJECTOIRES_PRO_LOG_DESTINATIONS").default("stdout").asArray(),
  },
  slackWebhookUrl: env.get("TRAJECTOIRES_PRO_SLACK_WEBHOOK_URL").asString(),
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
      key: env.get("TRAJECTOIRES_PRO_INSERJEUNES_API_KEY").required().asString(),
    },
  },
};

export default config;
