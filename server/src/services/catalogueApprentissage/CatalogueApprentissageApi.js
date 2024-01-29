import { RateLimitedApi } from "#src/common/api/RateLimitedApi.js";
import config from "#src/config.js";
import { fetchJsonWithRetry, fetch } from "#src/common/utils/httpUtils.js";
import { getLoggerWithContext } from "#src/common/logger.js";

const logger = getLoggerWithContext("api/catalogue_apprentissage");

class CatalogueApprentissageApi extends RateLimitedApi {
  constructor(options = {}) {
    super("CatalogueApprentissageApi", { nbRequests: 5, durationInSeconds: 1, ...options });
    this.access_token = null;
    this.access_token_timestamp = null;
    this.access_token_timeout = options.access_token_timeout || 3600000 * 6; //6 heures

    // Disable retry by default
    this.retry = options.retry || { retries: 0 };
  }

  static get baseApiUrl() {
    return config.catalogueApprentissage.api.baseUrl;
  }

  isAuthenticated() {
    return !!this.access_token;
  }

  isAccessTokenExpired() {
    return !this.access_token_timestamp || this.access_token_timeout < Date.now() - this.access_token_timestamp;
  }

  getAuthHeaders() {
    return {
      cookie: this.access_token,
    };
  }

  async login() {
    const response = await fetch(`${CatalogueApprentissageApi.baseApiUrl}/auth/login`, {
      method: "POST",
      data: JSON.stringify({
        username: config.catalogueApprentissage.api.username,
        password: config.catalogueApprentissage.api.password,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    logger.info(`Le token d'authentification a été renouvelé`);
    this.access_token = response.headers["set-cookie"];
    this.access_token_timestamp = Date.now();

    return this.access_token;
  }

  async fetchEntities(entityName, query, pagination = { page: 1, limit: 100 }) {
    return this.execute(async () => {
      if (!this.isAuthenticated() || this.isAccessTokenExpired()) {
        await this.login();
      }

      const params = new URLSearchParams();
      params.set("page", pagination.page);
      params.set("limit", pagination.limit);
      params.set("query", JSON.stringify(query));

      const response = await fetchJsonWithRetry(
        `${CatalogueApprentissageApi.baseApiUrl}/entity/${entityName}?${params.toString()}`,
        {
          headers: {
            ...this.getAuthHeaders(),
          },
        },
        { ...this.retry }
      );

      return response;
    });
  }

  async fetchEntity(entityName, id) {
    return this.execute(async () => {
      if (!this.isAuthenticated() || this.isAccessTokenExpired()) {
        await this.login();
      }

      const response = await fetchJsonWithRetry(
        `${CatalogueApprentissageApi.baseApiUrl}/entity/${entityName}/${id}`,
        {
          headers: {
            ...this.getAuthHeaders(),
          },
        },
        { ...this.retry }
      );

      return response;
    });
  }

  /**
   * @param {Array.<{cfd: String} & Object.<string, any>>} formations
   */
  async fetchFormations(query = {}, pagination = { page: 1, limit: 100 }) {
    return this.fetchEntities("formations", query, pagination);
  }

  async fetchEtablissements(query = {}, pagination = { page: 1, limit: 100 }) {
    return this.fetchEntities("etablissements", query, pagination);
  }

  async fetchEtablissement(id) {
    return this.fetchEntity("etablissement", id);
  }
}

export { CatalogueApprentissageApi };
