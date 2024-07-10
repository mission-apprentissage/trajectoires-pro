import { MongoRepository } from "./base.js";
import { name } from "#src/common/db/collections/formation.js";

export class FormationRepository extends MongoRepository {
  constructor() {
    super(name);
  }
}

export default new FormationRepository();
