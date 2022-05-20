import { pickBy, isNil } from "lodash-es";

export function omitNil(obj) {
  return pickBy(obj, (v) => !isNil(v));
}
