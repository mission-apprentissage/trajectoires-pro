import { compose, transformData } from "oleoduc";
import { RateLimitedApi } from "#src/common/api/RateLimitedApi.js";
import config from "#src/config.js";
import { fetchStreamWithRetry } from "#src/common/utils/httpUtils.js";

import streamJson from "stream-json";
import streamers from "stream-json/streamers/StreamArray.js";

class OnisepApi extends RateLimitedApi {
  constructor(options = {}) {
    super("OnisepApi", { nbRequests: 5, durationInSeconds: 1, ...options });

    // Disable retry by default
    this.retry = options.retry || { retries: 0 };
  }

  static get baseApiUrl() {
    return config.onisep.api.baseUrl;
  }

  async datasets(id) {
    return this.execute(async () => {
      const response = await fetchStreamWithRetry(
        `${OnisepApi.baseApiUrl}/downloads/${id}/${id}.json`,
        {},
        { ...this.retry }
      );

      return compose(
        response,
        streamJson.parser(),
        streamers.streamArray(),
        transformData((data) => data.value)
      );
    });
  }
}

export { OnisepApi };
