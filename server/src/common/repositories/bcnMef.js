import streamToArray from "stream-to-array";
import { MongoRepository } from "./base.js";
import { dbCollection } from "#src/common/db/mongodb.js";
import { name } from "#src/common/db/collections/bcn_mef.js";

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

  async isAnneeCommune(cfd) {
    // On considère qu'une formation est une année commune si :
    // Pour un code formation diplome :
    // - Elle n'a qu'un mefstat11 avec annee_dispositif = 1
    // - Elle n'a pas de mefstat11 avec annee_dispositif = 2 ou annee_dispositif = 3
    const formations = await streamToArray(await this.find({ formation_diplome: cfd }));
    const formationsAnnee1 = formations.filter((f) => f.annee_dispositif === "1");
    return formationsAnnee1.length > 0 && formations.length === formationsAnnee1.length;
  }
}

export default new BCNMefRepository();
