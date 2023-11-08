import { MongoRepository } from "./base.js";
import { name } from "#src/common/db/collections/users.js";

export class UserRepository extends MongoRepository {
  constructor() {
    super(name);
  }
}

export default new UserRepository();
