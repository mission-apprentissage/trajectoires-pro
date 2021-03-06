// @ts-check

import * as logsDescriptor from "./logs.js";
import * as codeFormationDiplomesDescriptor from "./codeFormationDiplomes.js";
import * as formationsStatsDescriptor from "./formationsStats.js";
import * as certificationsStatsDescriptor from "./certificationsStats.js";
import * as metricsDescriptor from "./metrics.js";
import { dbCollection } from "../mongodb.js";

export function getCollectionDescriptors() {
  return [
    logsDescriptor,
    codeFormationDiplomesDescriptor,
    formationsStatsDescriptor,
    certificationsStatsDescriptor,
    metricsDescriptor,
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
 * @typedef {import("mongodb").Collection<import("./codeFormationDiplomes.js").CodeFormationDiplomes>} CodeFormationDiplomesCollection
 * @returns {CodeFormationDiplomesCollection}
 */
export function codeFormationDiplomes() {
  return dbCollection(codeFormationDiplomesDescriptor.name);
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
