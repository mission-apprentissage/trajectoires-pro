import { dbCollection, migrateMongodb } from "../common/db/mongodb.js";
import { promiseAllProps } from "../common/utils/asyncUtils.js";

const VERSION = 1;

export async function migrate(options = {}) {
  return migrateMongodb(
    VERSION,
    () => {
      return promiseAllProps({
        codeFormationDiplomes: dbCollection("codeFormationDiplomes").drop(),
        certificationsStats: dbCollection("certificationsStats").drop(),
        formationsStats: dbCollection("formationsStats").drop(),
      });
    },
    options
  );
}
