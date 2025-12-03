import { compose } from "oleoduc";
import { Readable } from "stream";
import { RateLimitedApi } from "#src/common/api/RateLimitedApi.js";
import config from "#src/config.js";
import { streamNestedJsonArray } from "#src/common/utils/streamUtils.js";
import { fetchJsonWithRetry, fetchWithRetry } from "#src/common/utils/httpUtils.js";
import { getLoggerWithContext } from "#src/common/logger.js";

const logger = getLoggerWithContext("api/bcn");

class BCNApi extends RateLimitedApi {
  constructor(options = {}) {
    super("BCNApi", { nbRequests: 5, durationInSeconds: 1, ...options });
    this.access_token = null;
    this.access_token_timestamp = null;
    this.access_token_timeout = options.access_token_timeout || 60000 * 60; //minutes

    // Disable retry by default
    this.retry = options.retry || { retries: 0 };
  }

  static get baseApiUrl() {
    return config.bcn.api.baseUrl;
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
      `${BCNApi.baseApiUrl}/auth/login-extraction`,
      {
        method: "POST",
        data: {
          login: config.bcn.api.login,
          password: config.bcn.api.password,
        },
        headers: {
          "X-Omogen-Api-Key": config.bcn.api.omogenKey,
          "Content-Type": "application/json",
        },
      },
      { ...this.retry }
    );

    logger.info(`Le token d'authentification a été renouvelé`);
    this.access_token = data.token;
    this.access_token_timestamp = Date.now();

    return data;
  }

  async fetchNomenclature(name) {
    return this.execute(async () => {
      if (!this.isAuthenticated() || this.isAccessTokenExpired()) {
        await this.login();
      }

      // We don't use streams here, they fail too often with BCN API
      const response = await fetchWithRetry(
        `${BCNApi.baseApiUrl}/nomenclature/${name}?schema=consultation`,
        {
          headers: {
            "X-Omogen-Api-Key": config.bcn.api.omogenKey,
            ...this.getAuthHeaders(),
          },
        },
        { ...this.retry }
      );

      return compose(Readable.from(Buffer.from(response, "utf8")), streamNestedJsonArray("data"));
    });
  }
}

export { BCNApi };
