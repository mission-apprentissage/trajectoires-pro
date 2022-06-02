import * as logsDescriptor from "./logs.js";
import * as codeFormationDiplomesDescriptor from "./codeFormationDiplomes.js";
import * as formationsStatsDescriptor from "./formationsStats.js";
import * as certificationsStatsDescriptor from "./certificationsStats.js";
import { dbCollection } from "../mongodb.js";

export function getCollectionDescriptors() {
  return [logsDescriptor, codeFormationDiplomesDescriptor, formationsStatsDescriptor, certificationsStatsDescriptor];
}

/**
 * @typedef {import("mongodb").Collection<import("./formationsStats").FormationsStats>} FormationsStatsCollection
 * @returns {FormationsStatsCollection}
 */
export function formationsStats() {
  return dbCollection(formationsStatsDescriptor.name);
}

/**
 * @typedef {import("mongodb").Collection<import("./certificationsStats").CertificationsStats>} CertificationsStatsCollection
 * @returns {CertificationsStatsCollection}
 */
export function certificationsStats() {
  return dbCollection(certificationsStatsDescriptor.name);
}

/**
 * @typedef {import("mongodb").Collection<import("./certifications.js").Mefs>} CertificationsCollection
 * @returns {CertificationsCollection}
 */
export function codeFormationDiplomes() {
  return dbCollection(codeFormationDiplomesDescriptor.name);
}

/**
 * @typedef {import("mongodb").Collection<import("./logs").Logs>} LogsCollection
 * @returns {LogsCollection}
 */
export function logs() {
  return dbCollection(logsDescriptor.name);
}
