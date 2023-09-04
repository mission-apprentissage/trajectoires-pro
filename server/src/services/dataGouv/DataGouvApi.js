import { RateLimitedApi } from "#src/common/api/RateLimitedApi.js";
import config from "#src/config.js";
import { fetchStreamWithRetry } from "#src/common/utils/httpUtils.js";

class DataGouvApi extends RateLimitedApi {
  constructor(options = {}) {
    super("DataGouvApi", { nbRequests: 5, durationInSeconds: 1, ...options });

    // Disable retry by default
    this.retry = options.retry || { retries: 0 };
  }

  static get baseApiUrl() {
    return config.datagouv.api.baseUrl;
  }

  async datasets(id) {
    return this.execute(async () => {
      const response = await fetchStreamWithRetry(`${DataGouvApi.baseApiUrl}/datasets/r/${id}`, {}, { ...this.retry });
      return response;
    });
  }
}

export { DataGouvApi };
