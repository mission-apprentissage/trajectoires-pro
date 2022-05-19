import { dbCollection } from "../mongodb.js";

export async function findAndPaginate(collectionName, query, options = {}) {
  let collection = dbCollection(collectionName);
  let page = options.page || 1;
  let limit = options.limit || 10;
  let skip = (page - 1) * limit;

  let total = await collection.countDocuments(query);

  return {
    find: collection
      .find(query, options.projection ? { projection: options.projection } : {})
      .sort(options.sort || {})
      .skip(skip)
      .limit(limit),
    pagination: {
      page,
      items_par_page: limit,
      nombre_de_page: Math.ceil(total / limit) || 1,
      total,
    },
  };
}
