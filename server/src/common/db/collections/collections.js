import * as logsDescriptor from "./logs.js";
import * as formationsStatsDescriptor from "./formationsStats.js";
import * as regionsStatsDescriptor from "./regionsStats.js";
import * as certificationsStatsDescriptor from "./certificationsStats.js";
import * as metricsDescriptor from "./metrics.js";
import * as migrationsDescriptor from "./migrations.js";
import * as bcnDescriptor from "./bcn.js";
import { dbCollection } from "../mongodb.js";

export function getCollectionDescriptors() {
  return [
    logsDescriptor,
    formationsStatsDescriptor,
    regionsStatsDescriptor,
    certificationsStatsDescriptor,
    metricsDescriptor,
    migrationsDescriptor,
    bcnDescriptor,
  ];
}

export function formationsStats() {
  return dbCollection(formationsStatsDescriptor.name);
}

export function regionStats() {
  return dbCollection(regionsStatsDescriptor.name);
}

export function certificationsStats() {
  return dbCollection(certificationsStatsDescriptor.name);
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

export function bcn() {
  return dbCollection(bcnDescriptor.name);
}
