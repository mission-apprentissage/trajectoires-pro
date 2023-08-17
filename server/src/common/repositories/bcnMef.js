import { MongoRepository } from "./base.js";
import { dbCollection } from "../db/mongodb.js";
import { name } from "../db/collections/bcn_mef.js";

export class BCNMefRepository extends MongoRepository {
  constructor() {
    super(name);
  }

  async exist({ mef_stat_11, formation_diplome }) {
    return (await this.first({ mef_stat_11, formation_diplome })) ? true : false;
  }

  async first({ mef_stat_11, formation_diplome, ...rest }) {
    const query = this.prepare({ mef_stat_11, formation_diplome, ...rest });
    return dbCollection(this.getCollection()).find(query).limit(1).next();
  }

  async find({ mef_stat_11, formation_diplome, ...rest }) {
    const query = this.prepare({ mef_stat_11, formation_diplome, ...rest });
    return dbCollection(this.getCollection()).find(query).stream();
  }

  async findAndPaginate({ mef_stat_11, formation_diplome }, options = { page: 1, limit: 10 }) {
    const query = this.prepare({ mef_stat_11, formation_diplome });
    return await this._findAndPaginate(query, {
      ...options,
    });
  }
}

export default new BCNMefRepository();
