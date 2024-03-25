import { MongoRepository } from "./base.js";
import { name } from "#src/common/db/collections/formationEtablissement.js";

export class FormationEtablissementRepository extends MongoRepository {
  constructor() {
    super(name);
  }
}

export default new FormationEtablissementRepository();
