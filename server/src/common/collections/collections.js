// @ts-check

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

/**
 * @typedef {import("mongodb").Collection<import("./formationsStats.js").FormationsStats>} FormationsStatsCollection
 * @returns {FormationsStatsCollection}
 */
export function formationsStats() {
  return dbCollection(formationsStatsDescriptor.name);
}

/**
 * @typedef {import("mongodb").Collection<import("./certificationsStats.js").CertificationsStats>} CertificationsStatsCollection
 * @returns {CertificationsStatsCollection}
 */
export function certificationsStats() {
  return dbCollection(certificationsStatsDescriptor.name);
}

/**
 * @typedef {import("mongodb").Collection<import("./cfds.js").CodeFormationDiplomes>} CodeFormationDiplomesCollection
 * @returns {CodeFormationDiplomesCollection}
 */
export function cfds() {
  return dbCollection(cfdsDescriptor.name);
}

/**
 * @typedef {import("mongodb").Collection<import("./cfds.js").CodeFormationDiplomes>} CodeFormationDiplomesCollection
 * @returns {CodeFormationDiplomesCollection}
 */
export function mefs() {
  return dbCollection(mefsDescriptor.name);
}

/**
 * @typedef {import("mongodb").Collection<import("./logs.js").Logs>} LogsCollection
 * @returns {LogsCollection}
 */
export function logs() {
  return dbCollection(logsDescriptor.name);
}

/**
 * @typedef {import("mongodb").Collection<import("./metrics.js").Metrics>} MetricsCollection
 * @returns {MetricsCollection}
 */
export function metrics() {
  return dbCollection(metricsDescriptor.name);
}

export function migrations() {
  return dbCollection(migrationsDescriptor.name);
}
