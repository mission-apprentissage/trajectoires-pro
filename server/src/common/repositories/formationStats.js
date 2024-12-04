import { StatsRepository } from "./base.js";
import { dbCollection } from "#src/common/db/mongodb.js";
import { name } from "#src/common/db/collections/formationsStats.js";
import { getMillesimeFormationsYearFrom } from "#src/common/stats.js";

export class FormationStatsRepository extends StatsRepository {
  constructor() {
    super(name);
  }

  async exist({ uai, region, code_certification, ...rest }) {
    return (await this.first({ uai, "region.code": region, code_certification, ...rest })) ? true : false;
  }

  async first({ uai, region, code_certification, millesime, ...rest }) {
    const query = this.prepare({ uai, "region.code": region, code_certification, millesime, ...rest });
    return dbCollection(this.getCollection()).find(query).sort({ millesime: -1 }).limit(1).next();
  }

  async findAndPaginate({ uai, region, millesime, code_certification, ...rest }, options = { page: 1, limit: 10 }) {
    const query = this.prepare({ uai, "region.code": region, millesime, code_certification, ...rest });
    return await this._findAndPaginate(query, {
      ...options,
    });
  }

  async findMillesime({ uai, region, code_certification, ...rest }) {
    const query = this.prepare({ uai, "region.code": region, code_certification, ...rest });
    const result = await dbCollection(this.getCollection())
      .find(query)
      .project({ _id: 0, millesime: 1 })
      .sort({ millesime: -1 })
      .toArray();

    return result ? result.map((data) => data.millesime) : [];
  }

  // Retourne les formations du supérieur possédant un millésime aggregé et un millésime unique
  async findMillesimeInDouble(millesime, filiere = "superieur") {
    const millesimeYear = getMillesimeFormationsYearFrom(millesime);

    return await dbCollection(this.getCollection())
      .aggregate([
        { $match: { filiere, millesime: millesimeYear } },
        {
          $lookup: {
            from: this.getCollection(),
            localField: "uai",
            foreignField: "uai",
            as: "others",
            let: { code_certification_base: "$code_certification" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$filiere", filiere] },
                      { $eq: ["$$code_certification_base", "$code_certification"] },
                      { $eq: ["$millesime", millesime] },
                    ],
                  },
                },
              },
            ],
          },
        },
        {
          $match: {
            "others.0": { $exists: true },
          },
        },
      ])
      .toArray();
  }

  async findUniqueUAI(millesime) {
    return await dbCollection(this.getCollection())
      .aggregate([
        { $match: { millesime } },
        {
          $group: {
            _id: "$uai",
            uai: { $first: "$uai" },
            region: { $first: "$region" },
            academie: { $first: "$academie" },
          },
        },
      ])
      .stream();
  }
}

export default new FormationStatsRepository();
