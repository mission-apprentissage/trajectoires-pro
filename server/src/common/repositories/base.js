import { merge } from "lodash-es";
import { omitNil } from "#src/common/utils/objectUtils.js";
import { dbCollection, upsert, updateOne } from "#src/common/db/mongodb.js";
import { $field, $sumOfArray } from "#src/common/utils/mongodbUtils.js";
import * as Stats from "#src/common/stats.js";

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

  async create(data) {
    return await dbCollection(this.getCollection()).insertOne({
      ...data,
      _meta: merge({}, { created_on: new Date(), updated_on: new Date() }, data._meta),
    });
  }

  async deleteOne(query) {
    const queryPrepared = this.prepare(query);
    return await dbCollection(this.getCollection()).deleteOne(queryPrepared);
  }

  async updateOne(query, data) {
    const queryPrepared = this.prepare(query);
    return await updateOne(dbCollection(this.getCollection()), queryPrepared, {
      $set: data,
    });
  }

  async upsert(query, data, onInsertData = null) {
    const queryPrepared = this.prepare(query);
    return await upsert(dbCollection(this.getCollection()), queryPrepared, {
      ...(onInsertData ? { $setOnInsert: onInsertData } : {}),
      $set: data,
    });
  }

  async findAll() {
    return dbCollection(this.getCollection()).find({}).stream();
  }

  // eslint-disable-next-line no-unused-vars
  async first(query) {
    const queryPrepared = this.prepare(query);
    return dbCollection(this.getCollection()).find(queryPrepared).limit(1).next();
  }

  async _findAndPaginate(query, options) {
    let page = options.page || 1;
    let limit = options.limit || 10;
    let skip = (page - 1) * limit;

    let total = await dbCollection(this.getCollection()).countDocuments(query);

    return {
      // return the collections as a stream
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

  async findAndPaginate(query, options = { page: 1, limit: 10 }) {
    const queryPrepared = this.prepare(query);
    return await this._findAndPaginate(queryPrepared, {
      ...options,
    });
  }

  async exist(query) {
    const queryPrepared = this.prepare(query);
    return (await this.first(queryPrepared)) ? true : false;
  }

  async find(query) {
    const queryPrepared = this.prepare(query);
    return dbCollection(this.getCollection()).find(queryPrepared).stream();
  }
}

export class StatsRepository extends MongoRepository {
  constructor(collection) {
    super();
    this.collection = collection;
  }

  async _getFilieresStats(query) {
    const result = await dbCollection(this.getCollection())
      .aggregate([
        { $match: query },
        {
          $group: {
            _id: { filiere: "$filiere", millesime: "$millesime" },
            codes_certifications: { $addToSet: "$code_certification" },
            codes_formation_diplome: { $addToSet: "$code_formation_diplome" },
            code_formation_diplome: { $first: "$code_formation_diplome" },
            libelle: { $first: "$libelle" },
            libelle_ancien: { $first: "$libelle_ancien" },
            filiere: { $first: "$filiere" },
            millesime: { $first: "$millesime" },
            diplome: { $first: "$diplome" },
            diplomes: { $addToSet: "$diplome" },
            ...(query["region.code"] ? { region: { $first: "$region" } } : {}),
            ...Stats.getStats(Stats.VALEURS, (statName) => ({
              $push: $field(statName),
            })),
          },
        },
        {
          $addFields: {
            ...Stats.getStats(Stats.VALEURS, (statName) => $sumOfArray($field(statName))),
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
          $addFields: {
            diplome: {
              $cond: [{ $gt: [{ $size: "$diplomes" }, 1] }, "$$REMOVE", "$diplome"],
            },
            diplomes: "$$REMOVE",
            code_formation_diplome: {
              $cond: [{ $eq: [{ $size: "$codes_formation_diplome" }, 1] }, "$code_formation_diplome", "$$REMOVE"],
            },
            libelle: {
              $cond: [{ $eq: [{ $size: "$codes_formation_diplome" }, 1] }, "$libelle", "$$REMOVE"],
            },
            libelle_ancien: {
              $cond: [
                {
                  $and: [{ $eq: [{ $size: "$codes_formation_diplome" }, 1] }, { $ne: ["$libelle_ancien", null] }],
                },
                "$libelle_ancien",
                "$$REMOVE",
              ],
            },
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

    return omitNil({
      pro: result?.stats?.find((s) => s.filiere === "pro"),
      apprentissage: result?.stats?.find((s) => s.filiere === "apprentissage"),
    });
  }
}
