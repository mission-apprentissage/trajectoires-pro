const env = require("env-var");

module.exports = {
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
      .default("mongodb://127.0.0.1:27017/referentiel?retryWrites=true&w=majority")
      .asString(),
  },
};
