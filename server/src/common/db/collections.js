// @ts-check

import { dbCollection } from "./mongodb.js";
import {
  certificationsStatsDescriptor,
  cfdsDescriptor,
  formationsStatsDescriptor,
  logsDescriptor,
  mefsDescriptor,
  metricsDescriptor,
  migrationsDescriptor,
} from "./descriptors.js";

/**
 * @typedef {import("mongodb").Collection<import("./descriptors/formationsStats.js").FormationsStats>} FormationsStatsCollection
 * @returns {FormationsStatsCollection}
 */
export function formationsStats() {
  return dbCollection(formationsStatsDescriptor.name);
}

/**
 * @typedef {import("mongodb").Collection<import("./descriptors/certificationsStats.js").CertificationsStats>} CertificationsStatsCollection
 * @returns {CertificationsStatsCollection}
 */
export function certificationsStats() {
  return dbCollection(certificationsStatsDescriptor.name);
}

/**
 * @typedef {import("mongodb").Collection<import("./descriptors/cfds.js").Cfds>} Cfds
 * @returns {Cfds}
 */
export function cfds() {
  return dbCollection(cfdsDescriptor.name);
}

/**
 * @typedef {import("mongodb").Collection<import("./descriptors/mefs.js").Mefs>} Mefs
 * @returns {Mefs}
 */
export function mefs() {
  return dbCollection(mefsDescriptor.name);
}

/**
 * @typedef {import("mongodb").Collection<import("./descriptors/logs.js").Logs>} LogsCollection
 * @returns {LogsCollection}
 */
export function logs() {
  return dbCollection(logsDescriptor.name);
}

/**
 * @typedef {import("mongodb").Collection<import("./descriptors/metrics.js").Metrics>} MetricsCollection
 * @returns {MetricsCollection}
 */
export function metrics() {
  return dbCollection(metricsDescriptor.name);
}

export function migrations() {
  return dbCollection(migrationsDescriptor.name);
}
