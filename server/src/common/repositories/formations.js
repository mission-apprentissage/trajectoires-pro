import { MongoRepository } from "./base.js";
import { dbCollection } from "../db/mongodb.js";
import { name } from "../db/collections/formationsStats.js";

export class FormationsRepository extends MongoRepository {
  constructor() {
    super(name);
  }

  async exist({ uai, region, code_certification }) {
    return (await this.find({ uai, "region.code": region, code_certification })) ? true : false;
  }

  async find({ uai, region, code_certification, millesime }) {
    const query = this.prepare({ uai, "region.code": region, code_certification, millesime });
    return dbCollection(this.getCollection()).find(query).sort({ millesime: -1 }).limit(1).next();
  }

  async findAndPaginate({ uai, region, millesime, code_certification }, options = { page: 1, limit: 10 }) {
    const query = this.prepare({ uai, "region.code": region, millesime, code_certification });
    return await this._findAndPaginate(query, {
      ...options,
    });
  }

  async findMillesime({ uai, region, code_certification }) {
    const query = this.prepare({ uai, "region.code": region, code_certification });
    const result = await dbCollection(this.getCollection())
      .find(query)
      .project({ _id: 0, millesime: 1 })
      .sort({ millesime: -1 })
      .toArray();

    return result ? result.map((data) => data.millesime) : [];
  }
}

export default new FormationsRepository();