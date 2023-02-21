import { RateLimitedApi } from "../api/RateLimitedApi.js";
import config from "../../config.js";
import { fetchJsonWithRetry } from "../utils/httpUtils.js";
import { getLoggerWithContext } from "../logger.js";

const logger = getLoggerWithContext("api/inserjeunes");

class InserJeunesApi extends RateLimitedApi {
  constructor(options = {}) {
    super("InserJeunesApi", { nbRequests: 5, durationInSeconds: 1, ...options });
    this.access_token = null;
    this.access_token_timestamp = null;
    this.access_token_timeout = options.access_token_timeout || 60000 * 2; //minutes

    // Disable retry by default
    this.retry = options.retry || { retries: 0 };
  }

  static get baseApiUrl() {
    return "https://www.inserjeunes.education.gouv.fr/api/v1.0";
  }

  isAuthenticated() {
    return !!this.access_token;
  }

  isAccessTokenExpired() {
    return !this.access_token_timestamp || this.access_token_timeout < Date.now() - this.access_token_timestamp;
  }

  getAuthHeaders() {
    return {
      Authorization: `Bearer ${this.access_token}`,
    };
  }

  async login() {
    const data = await fetchJsonWithRetry(
      `${InserJeunesApi.baseApiUrl}/login`,
      {
        method: "POST",
        headers: {
          username: config.inserJeunes.api.username,
          password: config.inserJeunes.api.password,
        },
      },
      { ...this.retry }
    );

    logger.info(`Le token d'authentification a été renouvelé`);
    this.access_token = data.access_token;
    this.access_token_timestamp = Date.now();

    return data;
  }

  async fetchEtablissementStats(uai, millesime) {
    return this.execute(async () => {
      if (!this.isAuthenticated() || this.isAccessTokenExpired()) {
        await this.login();
      }

      // /!\ L'API Inserjeunes retourne un json dans un json, on retourne le json en string ici
      const response = await fetchJsonWithRetry(
        `${InserJeunesApi.baseApiUrl}/UAI/${uai}/millesime/${millesime}`,
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

  async fetchCertificationStats(millesime, filiere) {
    return this.execute(async () => {
      if (!this.isAuthenticated() || this.isAccessTokenExpired()) {
        await this.login();
      }

      // /!\ L'API Inserjeunes retourne un json dans un json, on retourne le json en string ici
      const response = await fetchJsonWithRetry(
        `${InserJeunesApi.baseApiUrl}/france/millesime/${millesime}/filiere/${filiere}`,
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
}

export { InserJeunesApi };
