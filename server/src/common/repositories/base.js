import { dbCollection } from "../db/mongodb.js";
import { $field, $sumOf } from "../utils/mongodbUtils.js";
import * as Stats from "../stats.js";

export class Repository {}

export class MongoRepository extends Repository {
  constructor(collection) {
    super();
    this.collection = collection;
  }

  getCollection() {
    return this.collection;
  }

  prepare(parameters) {
    return Object.keys(parameters).reduce((query, parameterName) => {
      const value = parameters[parameterName];

      if (!value || (Array.isArray(value) && value.length === 0)) {
        return query;
      }

      if (Array.isArray(value)) {
        return {
          ...query,
          [parameterName]: { $in: [...value] },
        };
      }

      return { ...query, [parameterName]: parameters[parameterName] };
    }, {});
  }

  // eslint-disable-next-line no-unused-vars
  find(query) {
    throw new Error("Not implemented.");
  }

  async _findAndPaginate(query, options) {
    let page = options.page || 1;
    let limit = options.limit || 10;
    let skip = (page - 1) * limit;

    let total = await dbCollection(this.getCollection()).countDocuments(query);

    return {
      find: dbCollection(this.getCollection())
        .find(query, options.projection ? { projection: options.projection } : {})
        .sort(options.sort || {})
        .skip(skip)
        .limit(limit)
        .stream(),
      pagination: {
        page,
        items_par_page: limit,
        nombre_de_page: Math.ceil(total / limit) || 1,
        total,
      },
    };
  }

  // eslint-disable-next-line no-unused-vars
  findAndPaginate(query, options = { page: 1, limit: 10 }) {
    throw new Error("Not implemented");
  }

  // eslint-disable-next-line no-unused-vars
  exist(query) {
    throw new Error("Not implemented");
  }

  async _getFilieresStats(query) {
    const result = await dbCollection(this.getCollection())
      .aggregate([
        { $match: query },
        {
          $group: {
            _id: { filiere: "$filiere", millesime: "$millesime" },
            codes_certifications: { $addToSet: "$code_certification" },
            code_formation_diplome: { $first: "$code_formation_diplome" },
            filiere: { $first: "$filiere" },
            millesime: { $first: "$millesime" },
            diplome: { $first: "$diplome" },
            ...(query["region.code"] ? { region: { $first: "$region" } } : {}),
            ...Stats.getStats(Stats.VALEURS, (statName) => $sumOf($field(statName))),
          },
        },
        {
          $addFields: {
            ...Stats.computeCustomStats("aggregate"),
          },
        },
        {
          $project: {
            _id: 0,
          },
        },
        {
          $group: {
            _id: "$millesime",
            stats: { $push: "$$ROOT" },
          },
        },
        {
          $sort: { _id: -1 },
        },
      ])
      .limit(1)
      .next();

    return {
      pro: result?.stats?.find((s) => s.filiere === "pro"),
      apprentissage: result?.stats?.find((s) => s.filiere === "apprentissage"),
    };
  }
}