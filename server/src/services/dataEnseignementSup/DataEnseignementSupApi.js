import odsApi from "@opendatasoft/api-client";
import asyncRetry from "async-retry";
import { getLoggerWithContext } from "#src/common/logger.js";
import { RateLimitedApi } from "#src/common/api/RateLimitedApi.js";
import config from "#src/config.js";

const { ApiClient, fromCatalog } = odsApi;
const logger = getLoggerWithContext("api/dataenseignementsup");

class DataEnseignementSupApi extends RateLimitedApi {
  constructor(options = {}) {
    super("DataEnseignementSupApi", { nbRequests: 5, durationInSeconds: 1, ...options });

    // Disable retry by default
    this.retry = options.retry || { retries: 0 };

    this.client = new ApiClient({ domain: config.dataenseignementsup.api.domain });
  }

  async getWithRetry(query) {
    return this.execute(() =>
      asyncRetry(() => this.client.get(query), {
        ...(this.retry || {}),
        onRetry: (err) => {
          logger.error({ err: err }, `Retrying ${query}...`);
        },
      })
    );
  }

  async fetchEtablissements() {
    const query = fromCatalog()
      .dataset(config.dataenseignementsup.datasets.insersup)
      .export("json")
      .refine('source:"insersup"')
      .where("NOT etablissement:'UNIV'")
      .groupBy("etablissement")
      .toString();

    const results = await this.getWithRetry(query);
    return results;
  }

  async fetchEtablissementStats(uai) {
    const query = fromCatalog()
      .dataset(config.dataenseignementsup.datasets.insersup)
      .export("json")
      .refine('source:"insersup"')
      .where(`etablissement:'${uai}'`)
      .toString();

    const results = await this.getWithRetry(query);
    return results;
  }
}

export { DataEnseignementSupApi };
