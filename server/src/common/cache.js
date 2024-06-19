import NodeCache from "node-cache";
export const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

export async function getOrSet(key, cb, ttl = 600) {
  const value = cache.get(key);
  if (value !== undefined) {
    return value;
  }

  const newValue = await cb();
  cache.set(key, newValue, ttl);
  return newValue;
}

export default cache;
