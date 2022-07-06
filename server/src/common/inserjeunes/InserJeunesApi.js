import { RateLimitedApi } from "../api/RateLimitedApi.js";
import config from "../../config.js";
import { fetchStream, fetchJson } from "../utils/httpUtils.js";
import { compose, transformData, accumulateData } from "oleoduc";
import { getLoggerWithContext } from "../logger.js";

const logger = getLoggerWithContext("api/inserjeunes");

function fixJsonResponse() {
  return compose(
    accumulateData(
      (trailingSlashes, chunk, flush) => {
        let current = trailingSlashes + chunk.toString();
        let newTrailingSlashes = "";

        for (let i = current.length - 1; i >= 0; i--) {
          if (current[i] === "\\") {
            newTrailingSlashes += "\\";
          } else {
            break;
          }
        }

        let nbCharactersToRemove = newTrailingSlashes.length * -1;
        flush(nbCharactersToRemove >= 0 ? current : current.slice(0, nbCharactersToRemove));
        return newTrailingSlashes;
      },
      { accumulator: "", objectMode: false }
    ),
    transformData(
      (chunk) => {
        let current = chunk.toString();
        return current
          .replaceAll(/"{/g, "{")
          .replaceAll(/}"/g, "}")
          .replaceAll(/\\\\\\"/g, "'")
          .replaceAll(/\\/g, "")
          .replaceAll(/u00/g, "\\\\u00");
      },
      { objectMode: false }
    )
  );
}

class InserJeunesApi extends RateLimitedApi {
  constructor(options = {}) {
    super("InserJeunesApi", { nbRequests: 5, durationInSeconds: 1, ...options });
    this.access_token = null;
    this.access_token_timestamp = null;
    this.access_token_timeout = options.access_token_timeout || 60000 * 2; //minutes
  }

  static get baseApiUrl() {
    return "https://www.inserjeunes.education.gouv.fr/api/v1.0";
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
    const data = await fetchJson(`${InserJeunesApi.baseApiUrl}/login`, {
      method: "POST",
      headers: {
        username: config.inserJeunes.api.username,
        password: config.inserJeunes.api.password,
      },
    });

    logger.info(`Le token d'authentification a été renouvelé`);
    this.access_token = data.access_token;
    this.access_token_timestamp = Date.now();
  }

  async fetchEtablissementStats(uai, millesime) {
    return this.execute(async () => {
      if (!this.isAuthenticated() || this.isAccessTokenExpired()) {
        await this.login();
      }

      const response = await fetchStream(`${InserJeunesApi.baseApiUrl}/UAI/${uai}/millesime/${millesime}`, {
        headers: {
          ...this.getAuthHeaders(),
        },
      });

      return compose(response, fixJsonResponse());
    });
  }

  async fetchCertificationStats(millesime, filiere) {
    return this.execute(async () => {
      if (!this.isAuthenticated() || this.isAccessTokenExpired()) {
        await this.login();
      }

      const response = await fetchStream(
        `${InserJeunesApi.baseApiUrl}/france/millesime/${millesime}/filiere/${filiere}`,
        {
          headers: {
            ...this.getAuthHeaders(),
          },
        }
      );

      return compose(response, fixJsonResponse());
    });
  }
}

export { InserJeunesApi };
