import { StatsRepository } from "./base.js";
import { dbCollection } from "#src/common/db/mongodb.js";
import { name } from "#src/common/db/collections/certificationsStats.js";

export class CertificationStatsRepository extends StatsRepository {
  constructor() {
    super(name);
  }

  async exist({ code_certification }) {
    return (await this.first({ code_certification })) ? true : false;
  }

  async first({ code_certification, millesime, ...rest }) {
    const query = this.prepare({ code_certification, millesime, ...rest });
    return dbCollection(this.getCollection()).find(query).sort({ millesime: -1 }).limit(1).next();
  }

  async findAndPaginate(
    { millesime, code_certification, millesimeSco = [], millesimeSup = [], ...rest },
    options = { page: 1, limit: 10 }
  ) {
    const millesimeCond = [];
    if (millesimeSco && millesimeSco.length > 0) {
      millesimeCond.push({
        filiere: { $ne: "superieur" },
        millesime: { $in: [...millesimeSco] },
      });
    }

    if (millesimeSup && millesimeSup.length > 0) {
      millesimeCond.push({
        filiere: "superieur",
        millesime: { $in: [...millesimeSup] },
      });
    }

    const query = this.prepare({
      millesime,
      code_certification,
      ...(millesimeCond.length > 0 ? { $or: millesimeCond } : {}),
      ...rest,
    });

    return await this._findAndPaginate(query, {
      ...options,
    });
  }

  async findMillesime({ code_certification }) {
    const query = this.prepare({ code_certification });
    const result = await dbCollection(this.getCollection())
      .find(query)
      .project({ _id: 0, millesime: 1 })
      .sort({ millesime: -1 })
      .toArray();

    return result ? result.map((data) => data.millesime) : [];
  }

  async getFilieresStats({ code_formation_diplome, millesime }) {
    const query = this.prepare({ code_formation_diplome, millesime });
    return await this._getFilieresStats(query);
  }
}

export default new CertificationStatsRepository();
