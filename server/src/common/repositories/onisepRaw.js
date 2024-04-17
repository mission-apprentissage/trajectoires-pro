import { MongoRepository } from "./base.js";
import { name } from "#src/common/db/collections/onisepRaw.js";

export class OnisepRawRepository extends MongoRepository {
  constructor() {
    super(name);
  }
}

export default new OnisepRawRepository();
