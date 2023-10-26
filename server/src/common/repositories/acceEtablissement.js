import { MongoRepository } from "./base.js";
import { name } from "#src/common/db/collections/acceEtablissements.js";

export class AcceEtablissementRepository extends MongoRepository {
  constructor() {
    super(name);
  }
}

export default new AcceEtablissementRepository();
