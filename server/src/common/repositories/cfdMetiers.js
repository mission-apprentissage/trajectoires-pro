import { MongoRepository } from "./base.js";
import { name } from "#src/common/db/collections/cfdMetiers.js";

export class CfdMetiersRepository extends MongoRepository {
  constructor() {
    super(name);
  }
}

export default new CfdMetiersRepository();
