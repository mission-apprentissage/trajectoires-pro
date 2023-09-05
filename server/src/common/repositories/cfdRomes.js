import { MongoRepository } from "./base.js";
import { name } from "#src/common/db/collections/cfdRomes.js";

export class CfdRomesRepository extends MongoRepository {
  constructor() {
    super(name);
  }
}

export default new CfdRomesRepository();
