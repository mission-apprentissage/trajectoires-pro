import axios from "axios";
import asyncRetry from "async-retry";
import { getLoggerWithContext } from "#src/common/logger.js";
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
  return response.data;
}

async function fetchJson(url, options = {}) {
  let response = await _fetch(url, { ...options, responseType: "text" });
  return JSON.parse(response.data);
}

async function ignoreRetry(cb, bail, ignoreWhen) {
  try {
    return await cb();
  } catch (err) {
    if (ignoreWhen && ignoreWhen(err)) {
      bail(err);
      return;
    }
    throw err;
  }
}

async function fetchJsonWithRetry(url, options = {}, retryOptions = { retries: 3, ignoreWhen: () => false }) {
  return asyncRetry(
    (bail) => {
      return ignoreRetry(async () => fetchJson(url, options), bail, retryOptions.ignoreWhen);
    },
    {
      ...(retryOptions || {}),
      onRetry: (err) => {
        logger.error({ err: err, request: err.request, response: err.response }, `Retrying ${url}...`);
      },
    }
  );
}

async function fetchWithRetry(url, options = {}, retryOptions = { retries: 3, ignoreWhen: () => false }) {
  return asyncRetry(
    async (bail) => {
      return ignoreRetry(
        async () => {
          let response = await _fetch(url, { ...options, responseType: "text" });
          return response.data;
        },
        bail,
        retryOptions.ignoreWhen
      );
    },
    {
      ...(retryOptions || {}),
      onRetry: (err) => {
        logger.error({ err: err, request: err.request, response: err.response }, `Retrying ${url}...`);
      },
    }
  );
}

async function fetchStreamWithRetry(url, options = {}, retryOptions = { retries: 3, ignoreWhen: () => false }) {
  return asyncRetry(
    (bail) => {
      return ignoreRetry(
        async () => {
          return fetchStream(url, options);
        },
        bail,
        retryOptions.ignoreWhen
      );
    },
    {
      ...(retryOptions || {}),
      onRetry: (err) => {
        logger.error({ err: err, request: err.request, response: err.response }, `Retrying ${url}...`);
      },
    }
  );
}

async function fetch(url, options = {}) {
  let response = await _fetch(url, { ...options });
  return response;
}

export { fetch, fetchJson, fetchJsonWithRetry, fetchWithRetry, fetchStream, fetchStreamWithRetry };
