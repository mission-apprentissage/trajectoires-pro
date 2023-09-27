import { RateLimitedApi } from "#src/common/api/RateLimitedApi.js";
import config from "#src/config.js";
import { fetchJsonWithRetry } from "#src/common/utils/httpUtils.js";

class OmogenApi extends RateLimitedApi {
  constructor(options = {}) {
    super("OmogenApi", { nbRequests: 5, durationInSeconds: 1, ...options });
    this.access_token = config.omogenApi.api.key;

    // Disable retry by default
    this.retry = options.retry || { retries: 0 };
  }

  static get baseApiUrl() {
    return config.omogenApi.api.basePath;
  }

  getAuthHeaders() {
    return {
      "X-Omogen-Api-Key": `${this.access_token}`,
    };
  }

  async fetchInserSup() {
    return this.execute(async () => {
      const response = await fetchJsonWithRetry(
        `${OmogenApi.baseApiUrl}/api_parcoursup`,
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

export { OmogenApi };
