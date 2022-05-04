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
  }

  static get baseApiUrl() {
    return "https://www.inserjeunes.education.gouv.fr/api/v1.0";
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
  }

  isAuthenticated() {
    return !!this.access_token;
  }

  getAuthHeaders() {
    return {
      Authorization: `Bearer ${this.access_token}`,
    };
  }

  async statsParEtablissement(uai, millesime) {
    return this.execute(async () => {
      if (!this.isAuthenticated()) {
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
