import { dbCollection, migrateMongodb } from "../common/db/mongodb.js";
import { promiseAllProps } from "../common/utils/asyncUtils.js";
import { certificationsStats, formationsStats } from "../common/db/collections/collections.js";

const VERSION = 2;

export async function migrate(options = {}) {
  return migrateMongodb(
    VERSION,
    () => {
      return promiseAllProps({
        codeFormationDiplomes: dbCollection("codeFormationDiplomes").drop(),
        certificationsStats: certificationsStats().remove({}),
        formationsStats: formationsStats().remove(),
      });
    },
    options
  );
}
