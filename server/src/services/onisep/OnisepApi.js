import { RateLimitedApi } from "#src/common/api/RateLimitedApi.js";
import config from "#src/config.js";
import { fetchJsonWithRetry } from "#src/common/utils/httpUtils.js";
import { getLoggerWithContext } from "#src/common/logger.js";

class OnisepApi extends RateLimitedApi {
  constructor(options = {}) {
    super("OnisepApi", { nbRequests: 5, durationInSeconds: 1, ...options });

    // Disable retry by default
    this.retry = options.retry || { retries: 0 };
  }

  static get baseApiUrl() {
    return config.onisep.api.baseUrl;
  }

  async search(dataset, query, pagination = { from: 0, size: 1000 }) {
    return this.execute(async () => {
      const params = new URLSearchParams();
      params.set("from", pagination.from);
      params.set("size", pagination.size);
      params.set("q", query);

      const response = await fetchJsonWithRetry(
        `${OnisepApi.baseApiUrl}/dataset/${dataset}/search?${params.toString()}`,
        {},
        { ...this.retry }
      );

      return response;
    });
  }
}

export { OnisepApi };
