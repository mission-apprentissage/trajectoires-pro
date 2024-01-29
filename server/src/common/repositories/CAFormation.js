import { MongoRepository } from "./base.js";
import { name } from "#src/common/db/collections/catalogueApprentissageFormations.js";

export class CAFormationRepository extends MongoRepository {
  constructor() {
    super(name);
  }
}

export default new CAFormationRepository();
