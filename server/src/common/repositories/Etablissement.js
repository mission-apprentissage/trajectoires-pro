import { MongoRepository } from "./base.js";
import { name } from "#src/common/db/collections/etablissement.js";

export class EtablissementRepository extends MongoRepository {
  constructor() {
    super(name);
  }
}

export default new EtablissementRepository();
