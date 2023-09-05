import { RateLimitedApi } from "#src/common/api/RateLimitedApi.js";
import config from "#src/config.js";
import { fetchJsonWithRetry } from "#src/common/utils/httpUtils.js";
import { getLoggerWithContext } from "#src/common/logger.js";
import { request, gql } from "graphql-request";

const logger = getLoggerWithContext("api/diagoriente");

class DiagorienteApi extends RateLimitedApi {
  constructor(options = {}) {
    super("DiagorienteApi", { nbRequests: 5, durationInSeconds: 1, ...options });
    this.access_token = null;
    this.access_token_timestamp = null;
    this.access_token_timeout = options.access_token_timeout || 60000 * 2; //minutes

    // Disable retry by default
    this.retry = options.retry || { retries: 0 };
  }

  static get baseApiUrl() {
    return config.diagoriente.api.baseUrl;
  }

  static get baseApiLoginUrl() {
    return config.diagoriente.api.loginUrl;
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
    const params = new URLSearchParams();
    params.append("grant_type", config.diagoriente.api.grandType);
    params.append("client_id", config.diagoriente.api.clientId);
    params.append("client_secret", config.diagoriente.api.clientSecret);

    const data = await fetchJsonWithRetry(DiagorienteApi.baseApiLoginUrl, {
      method: "POST",
      data: params.toString(),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    logger.info(`Le token d'authentification a été renouvelé`);
    this.access_token = data.access_token;
    this.access_token_timestamp = Date.now();

    return data.access_token;
  }

  async fetchRomes(cfds) {
    return this.execute(async () => {
      if (!this.isAuthenticated() || this.isAccessTokenExpired()) {
        await this.login();
      }

      const query = gql`
        query SousDomainesVoisinsViaCodesCFD($codesCfd: [String!]!) {
          sousDomainesVoisinsViaCodesCFD(codesCFD: $codesCfd) {
            codeROME
          }
        }
      `;

      return await request(DiagorienteApi.baseApiUrl, query, { codesCfd: cfds }, { ...this.getAuthHeaders() }).then(
        (results) => results.sousDomainesVoisinsViaCodesCFD || []
      );
    });
  }

  async fetchMetiersAvenir(secteursRome) {
    return this.execute(async () => {
      if (!this.isAuthenticated() || this.isAccessTokenExpired()) {
        await this.login();
      }

      const query = gql`
        query SuggestionsMetiersAvenir($secteurRome: CodeSecteurROME) {
          suggestionsMetiersAvenir(secteurROME: $secteurRome) {
            id
            codeROME
            flagAValoriser
            title
          }
        }
      `;

      return await request(
        DiagorienteApi.baseApiUrl,
        query,
        { secteurRome: secteursRome },
        { ...this.getAuthHeaders() }
      ).then((results) => results.suggestionsMetiersAvenir || []);
    });
  }
}

export { DiagorienteApi };
