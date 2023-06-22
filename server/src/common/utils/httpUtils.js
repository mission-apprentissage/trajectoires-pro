import axios from "axios";
import { compose, transformData } from "oleoduc";
import asyncRetry from "async-retry";
import { getLoggerWithContext } from "../logger.js";

const logger = getLoggerWithContext("http");

async function _fetch(url, options = {}) {
  let { method = "GET", ...rest } = options;
  logger.debug(`${method} ${url}...`);

  return axios.request({
    url,
    method,
    ...rest,
  });
}

async function fetchStream(url, options = {}) {
  let response = await _fetch(url, { ...options, responseType: "stream" });
  return compose(
    response.data,
    transformData((d) => d.toString())
  );
}

async function fetchJson(url, options = {}) {
  let response = await _fetch(url, { ...options, responseType: "text" });
  return JSON.parse(response.data);
}

async function fetchJsonWithRetry(url, options = {}, retryOptions = { retries: 3 }) {
  return asyncRetry(
    () => {
      return fetchJson(url, options);
    },
    {
      ...(retryOptions || {}),
      onRetry: (err) => {
        logger.error({ err: err, request: err.request, response: err.response }, `Retrying ${url}...`);
      },
    }
  );
}

export { fetchJson, fetchJsonWithRetry, fetchStream };
