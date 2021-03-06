import axios from "axios";
import { compose, transformData } from "oleoduc";
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
  let response = await _fetch(url, { ...options, responseType: "json" });
  return response.data;
}

export { fetchJson, fetchStream };
