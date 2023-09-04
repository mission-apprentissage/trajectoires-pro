import { MongoRepository } from "./base.js";
import { name } from "#src/common/db/collections/romeMetier.js";

export class RomeMetierRepository extends MongoRepository {
  constructor() {
    super(name);
  }
}

export default new RomeMetierRepository();
