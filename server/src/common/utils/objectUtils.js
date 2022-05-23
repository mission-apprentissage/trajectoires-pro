import { pickBy, isNil, sortBy } from "lodash-es";

export function omitNil(obj) {
  return pickBy(obj, (v) => !isNil(v));
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
