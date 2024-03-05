import axiosist from "axiosist"; // eslint-disable-line node/no-unpublished-import
import { Readable } from "stream"; // eslint-disable-line node/no-unpublished-require
import server from "#src/http/server.js";
// eslint-disable-next-line node/no-unpublished-import
import { faker } from "@faker-js/faker";

export async function startServer() {
  const app = await server();
  const httpClient = axiosist(app);

  return {
    httpClient,
  };
}

export function createStream(content) {
  let stream = new Readable({
    objectMode: true,
    read() {},
  });

  stream.push(content);
  stream.push(null);

  return stream;
}

export function generateStatValue() {
  return parseInt(faker.string.numeric(2));
}

export function generateCodeCertification(prefix = "#") {
  return faker.helpers.replaceSymbols(`${prefix}#######`);
}
