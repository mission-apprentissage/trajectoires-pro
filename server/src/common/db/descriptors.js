// @ts-check
import * as logsDescriptor from "./descriptors/logs.js";
import * as cfdsDescriptor from "./descriptors/cfds.js";
import * as mefsDescriptor from "./descriptors/mefs.js";
import * as formationsStatsDescriptor from "./descriptors/formationsStats.js";
import * as certificationsStatsDescriptor from "./descriptors/certificationsStats.js";
import * as metricsDescriptor from "./descriptors/metrics.js";
import * as migrationsDescriptor from "./descriptors/migrations.js";

export {
  logsDescriptor,
  cfdsDescriptor,
  mefsDescriptor,
  formationsStatsDescriptor,
  certificationsStatsDescriptor,
  metricsDescriptor,
  migrationsDescriptor,
};

export function getCollectionDescriptors() {
  return [
    logsDescriptor,
    cfdsDescriptor,
    mefsDescriptor,
    formationsStatsDescriptor,
    certificationsStatsDescriptor,
    metricsDescriptor,
    migrationsDescriptor,
  ];
}
