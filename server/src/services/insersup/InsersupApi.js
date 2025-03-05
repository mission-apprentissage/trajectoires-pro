import { RateLimitedApi } from "#src/common/api/RateLimitedApi.js";
import config from "#src/config.js";
import { fetchWithRetry } from "#src/common/utils/httpUtils.js";
import { compose } from "oleoduc";
import { streamNestedJsonArray } from "#src/common/utils/streamUtils.js";
import { Readable } from "stream";
import { Buffer } from "node:buffer";

class InserSupApi extends RateLimitedApi {
  constructor(options = {}) {
    super("InserSupApi", { nbRequests: 5, durationInSeconds: 1, ...options });
    this.api_key = null;

    // Disable retry by default
    this.retry = options.retry || { retries: 0 };
  }

  static get baseApiUrl() {
    return config.inserSup.api.baseUrl;
  }

  getAuthHeaders() {
    return {
      "X-Omogen-Api-Key": `${config.inserSup.api.key}`,
    };
  }

  async fetchEtablissementStats() {
    return this.execute(async () => {
      // /!\ L'API Inserjeunes retourne un json dans un json, on retourne le json en string ici
      const response = await fetchWithRetry(
        `${InserSupApi.baseApiUrl}`,
        {
          headers: {
            ...this.getAuthHeaders(),
          },
        },
        { ...this.retry }
      );

      return compose(Readable.from(Buffer.from(response, "utf8")), streamNestedJsonArray("results"));
    });
  }
}

export { InserSupApi };
