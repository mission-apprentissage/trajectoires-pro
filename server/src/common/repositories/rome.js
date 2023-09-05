import { MongoRepository } from "./base.js";
import { name } from "#src/common/db/collections/rome.js";

export class RomeRepository extends MongoRepository {
  constructor() {
    super(name);
  }
}

export default new RomeRepository();
