import { RateLimitedApi } from "#src/common/api/RateLimitedApi.js";
import config from "#src/config.js";
import { fetchJsonWithRetry } from "#src/common/utils/httpUtils.js";

class MetierAvenirApi extends RateLimitedApi {
  constructor(options = {}) {
    super("MetierAvenirApi", { nbRequests: 5, durationInSeconds: 1, ...options });

    // Disable retry by default
    this.retry = options.retry || { retries: 0 };
  }

  static get baseApiUrl() {
    return config.diagoriente.metierAvenir.baseUrl;
  }

  async appellations({ page = 1, size = 20 }) {
    const url = `${MetierAvenirApi.baseApiUrl}/appellations/?page=${page}&size=${size}`;
    return this.execute(async () => {
      const response = await fetchJsonWithRetry(url, {}, { ...this.retry });
      return response;
    });
  }

  async appellationsOgr({ code_ogr, departement = null, page = 1, size = 20 }) {
    const url = `${MetierAvenirApi.baseApiUrl}/appellations/code_ogr/${code_ogr}?page=${page}&size=${size}&departement=${departement}`;
    return this.execute(async () => {
      const response = await fetchJsonWithRetry(url, {}, { ...this.retry });
      return response;
    });
  }
}

export { MetierAvenirApi };
