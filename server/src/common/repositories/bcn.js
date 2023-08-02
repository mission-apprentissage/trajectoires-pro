import { MongoRepository } from "./base.js";
import { dbCollection } from "../db/mongodb.js";
import { name } from "../db/collections/bcn.js";
import { castArray } from "lodash-es";

export class BCNRepository extends MongoRepository {
  constructor() {
    super(name);
  }

  async exist({ code_certification }) {
    return (await this.find({ code_certification })) ? true : false;
  }

  async find({ code_certification }) {
    const query = this.prepare({ code_certification });
    return dbCollection(this.getCollection()).find(query).limit(1).next();
  }

  async findCodesFormationDiplome(codeCertification) {
    const found = await dbCollection(this.getCollection())
      .find({ code_certification: { $in: castArray(codeCertification) } })
      .toArray();
    return found.map((f) => f.code_formation_diplome);
  }

  async findAndPaginate({ code_formation_diplome }, options = { page: 1, limit: 10 }) {
    const query = this.prepare({ code_formation_diplome });
    return await this._findAndPaginate(query, {
      ...options,
    });
  }
}

export default new BCNRepository();
