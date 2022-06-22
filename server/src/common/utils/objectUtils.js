import { pickBy, isNil, isArray } from "lodash-es";

export function omitNil(obj) {
  if (isArray(obj)) {
    return obj.filter((v) => v);
  }

  return pickBy(obj, (v) => !isNil(v));
}

export function flattenObject(obj, parent, res = {}) {
  for (let key in obj) {
    const propName = parent ? parent + "." + key : key;
    if (typeof obj[key] == "object" && !Array.isArray(obj[key]) && !(obj[key] instanceof Date)) {
      flattenObject(obj[key], propName, res);
    } else {
      res[propName] = obj[key];
    }
  }
  return res;
}
