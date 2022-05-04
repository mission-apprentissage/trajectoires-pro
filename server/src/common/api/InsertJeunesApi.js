const RateLimitedApi = require("./RateLimitedApi");
const config = require("../../config");
const { fetchStream, fetchJson } = require("../utils/httpUtils");
const { compose, transformData } = require("oleoduc");
const { streamNestedJsonArray } = require("../utils/streamUtils");

function fixJsonResponse() {
  return transformData(
    (data) => {
      return data
        .toString()
        .replaceAll(/"{/g, "{")
        .replaceAll(/}"/g, "}")
        .replaceAll(/\\\\\\"/g, "'")
        .replaceAll(/\\/g, "")
        .replaceAll(/u00/g, "\\u00");
    },
    { objectMode: false }
  );
}

class InsertJeunesApi extends RateLimitedApi {
  constructor(options = {}) {
    super("InsertJeunesApi", { nbRequests: 5, durationInSeconds: 1, ...options });
    this.access_token = null;
    this.access_token_duration = 60000 * 2; //minutes
  }

  static get baseApiUrl() {
    return "https://www.inserjeunes.education.gouv.fr/api/v1.0";
  }

  isAuthenticated() {
    return !!this.access_token;
  }

  isAccesTokenExpired() {
    return !this.access_token_time || Date.now() - this.access_token_time < this.access_token_duration;
  }

  getAuthHeaders() {
    return {
      Authorization: `Bearer ${this.access_token}`,
    };
  }

  async login() {
    let data = await fetchJson(`${InsertJeunesApi.baseApiUrl}/login`, {
      method: "POST",
      headers: {
        username: config.insertJeunes.api.username,
        password: config.insertJeunes.api.password,
      },
    });

    this.access_token = data.access_token;
    this.access_token_time = Date.now();
  }

  async statsParEtablissement(uai, millesime) {
    return this.execute(async () => {
      if (!this.isAuthenticated() || this.isAccesTokenExpired()) {
        await this.login();
      }

      let response = await fetchStream(`${InsertJeunesApi.baseApiUrl}/UAI/${uai}/millesime/${millesime}`, {
        headers: {
          ...this.getAuthHeaders(),
        },
      });

      return compose(response, fixJsonResponse(), streamNestedJsonArray("data"));
    });
  }
}

module.exports = InsertJeunesApi;
