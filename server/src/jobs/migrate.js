import { migrateMongodb } from "../common/db/mongodb.js";
import { promiseAllProps } from "../common/utils/asyncUtils.js";
import { certificationsStats, formationsStats, regionalesStats } from "../common/db/collections/collections.js";

const VERSION = 4;

export async function migrate(options = {}) {
  return migrateMongodb(
    VERSION,
    () => {
      if (!options.removeAll) {
        return async () => {};
      }

      return promiseAllProps({
        certificationsStats: certificationsStats().remove({}),
        formationsStats: formationsStats().remove({}),
        regionalesStats: regionalesStats().remove({}),
      });
    },
    options
  );
}
