import * as logsDescriptor from "./logs.js";
import * as cfdsDescriptor from "./cfds.js";
import * as mefsDescriptor from "./mefs.js";
import * as formationsStatsDescriptor from "./formationsStats.js";
import * as certificationsStatsDescriptor from "./certificationsStats.js";
import * as metricsDescriptor from "./metrics.js";
import * as migrationsDescriptor from "./migrations.js";
import { dbCollection } from "../mongodb.js";

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

export function formationsStats() {
  return dbCollection(formationsStatsDescriptor.name);
}

export function certificationsStats() {
  return dbCollection(certificationsStatsDescriptor.name);
}

export function cfds() {
  return dbCollection(cfdsDescriptor.name);
}

export function mefs() {
  return dbCollection(mefsDescriptor.name);
}

export function logs() {
  return dbCollection(logsDescriptor.name);
}

export function metrics() {
  return dbCollection(metricsDescriptor.name);
}

export function migrations() {
  return dbCollection(migrationsDescriptor.name);
}
