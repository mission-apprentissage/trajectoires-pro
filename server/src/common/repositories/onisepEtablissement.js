import { MongoRepository } from "./base.js";
import { name } from "#src/common/db/collections/onisepEtablissements.js";

export class OnisepEtablissementRepository extends MongoRepository {
  constructor() {
    super(name);
  }
}

export default new OnisepEtablissementRepository();
