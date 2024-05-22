import { MongoRepository } from "./base.js";
import { name } from "#src/common/db/collections/bcn_sise.js";

export class BCNSiseRepository extends MongoRepository {
  constructor() {
    super(name);
  }
}

export default new BCNSiseRepository();
