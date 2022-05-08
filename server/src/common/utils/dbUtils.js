const { dbCollection } = require("../mongodb");
module.exports = {
  findAndPaginate: async ({ collectionName, query }, options = {}) => {
    let collection = dbCollection(collectionName);
    let page = options.page || 1;
    let limit = options.limit || 10;
    let skip = (page - 1) * limit;

    let total = await collection.count(query);

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
  },
  aggregateAndPaginate: async ({ collectionName, query, stages, pagination = {} }) => {
    let collection = dbCollection(collectionName);
    let page = pagination.page || 1;
    let limit = pagination.limit || 10;
    let skip = (page - 1) * limit;

    let total = await collection.count(query);
    let pipeline = [{ $match: query }, ...stages, { $skip: skip }, { $limit: limit }];

    return {
      aggregate: await collection.aggregate(pipeline),
      pagination: {
        page,
        items_par_page: limit,
        nombre_de_page: Math.ceil(total / limit) || 1,
        total,
      },
    };
  },
};
