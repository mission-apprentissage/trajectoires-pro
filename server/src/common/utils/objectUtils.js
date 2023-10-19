import { pickBy, pick, isNil, sortBy, isArray } from "lodash-es";

export function omitNil(obj) {
  if (isArray(obj)) {
    return obj.filter((v) => v);
  }

  return pickBy(obj, (v) => !isNil(v));
}

export function pickWithNil(obj, keys = []) {
  return obj ? pick(obj, keys) : null;
}

export function mergeArray(existingArray, newArray, discriminator, options = {}) {
  const updated = newArray.map((element) => {
    const previous = existingArray.find((e) => e[discriminator] === element[discriminator]) || {};
    return {
      ...previous,
      ...element,
      ...(options.merge ? options.merge(previous, element) : {}),
    };
  });

  const untouched = existingArray.filter((p) => {
    return !updated.map((u) => u[discriminator]).includes(p[discriminator]);
  });

  return sortBy([...updated, ...untouched], discriminator);
}
