import queryString from "query-string";
import { RateLimitedApi } from "./RateLimitedApi.js";
import { fetchJson } from "../utils/httpUtils.js";
import { getLoggerWithContext } from "../logger.js";

const logger = getLoggerWithContext("api/referentiel");

export class ReferentielApi extends RateLimitedApi {
  constructor(options = {}) {
    super("ReferentielApi", { nbRequests: 6, durationInSeconds: 1, ...options });
  }

  static get baseApiUrl() {
    return "https://referentiel.apprentissage.beta.gouv.fr/api/v1";
  }

  async getOrganisme(siret, params = {}) {
    return this.execute(async () => {
      logger.debug(`[${this.name}] Fetching organisme ${siret}...`);
      const url = `${ReferentielApi.baseApiUrl}/organismes/${siret}?${queryString.stringify(params)}`;
      return fetchJson(url);
    });
  }

  async searchOrganismes(params = {}) {
    return this.execute(async () => {
      logger.debug(`[${this.name}] Searching organismes...`, params);
      const url = `${ReferentielApi.baseApiUrl}/organismes?${queryString.stringify(params)}`;
      return fetchJson(url);
    });
  }
}

