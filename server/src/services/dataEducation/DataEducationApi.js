import { compose, transformData } from "oleoduc";
import streamJson from "stream-json";
import streamers from "stream-json/streamers/StreamArray.js";

import { RateLimitedApi } from "#src/common/api/RateLimitedApi.js";
import config from "#src/config.js";
import { fetchStreamWithRetry } from "#src/common/utils/httpUtils.js";

class DataEducationApi extends RateLimitedApi {
  constructor(options = {}) {
    super("DataEducationApi", { nbRequests: 5, durationInSeconds: 1, ...options });

    // Disable retry by default
    this.retry = options.retry || { retries: 0 };
  }

  static get baseApiUrl() {
    return config.dataeducation.api.baseUrl;
  }

  async datasets(id) {
    return this.execute(async () => {
      const response = await fetchStreamWithRetry(
        `${DataEducationApi.baseApiUrl}/datasets/${id}/exports/json`,
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

export { DataEducationApi };
