import { MongoRepository } from "./base.js";
import { dbCollection } from "../db/mongodb.js";
import { name } from "../db/collections/certificationsStats.js";

export class CertificationRepository extends MongoRepository {
  constructor() {
    super(name);
  }

  async exist({ code_certification }) {
    return (await this.find({ code_certification })) ? true : false;
  }

  async find({ code_certification, millesime }) {
    const query = this.prepare({ code_certification, millesime });
    return dbCollection(this.getCollection()).find(query).sort({ millesime: -1 }).limit(1).next();
  }

  async findAndPaginate({ millesime, code_certification }, options = { page: 1, limit: 10 }) {
    const query = this.prepare({ millesime, code_certification });
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

export default new CertificationRepository();