import { migrateMongodb } from "../common/db/mongodb.js";
import { promiseAllProps } from "../common/utils/asyncUtils.js";
import {
  certificationsStats,
  formationsStats,
  regionalesStats,
  departementalesStats,
} from "../common/db/collections/collections.js";

const VERSION = 3;

export async function migrate(options = {}) {
  return migrateMongodb(
    VERSION,
    () => {
      return promiseAllProps({
        regionalesStats: regionalesStats().deleteMany({}),
        departementalesStats: departementalesStats().deleteMany({}),
        certificationsStats: certificationsStats().deleteMany({}),
        formationsStats: formationsStats().deleteMany({}),
      });
    },
    options
  );
}
