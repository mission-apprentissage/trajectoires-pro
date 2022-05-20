import { isPlainObject, zipObject, keys, values } from "lodash-es";

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(() => resolve(), milliseconds));
}

async function promiseAllProps(data) {
  if (isPlainObject(data)) {
    return zipObject(keys(data), await Promise.all(values(data)));
  }
  return Promise.all(data);
}

export { delay, promiseAllProps };
