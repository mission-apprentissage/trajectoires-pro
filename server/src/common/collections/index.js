import { dbCollection } from "../mongodb.js";

/**
 * @typedef {import("mongodb").Collection<import("./certificationsStats").CertificationsStats>} CertificationsStatsCollection
 * @returns {CertificationsStatsCollection}
 */
function certificationsStats() {
  return dbCollection("certificationsStats");
}

/**
 * @typedef {import("mongodb").Collection<import("./formationsStats").FormationsStats>} FormationsStatsCollection
 * @returns {FormationsStatsCollection}
 */
function formationsStats() {
  return dbCollection("formationsStats");
}

/**
 * @typedef {import("mongodb").Collection<import("./logs").Logs>} LogsCollection
 * @returns {LogsCollection}
 */
function logs() {
  return dbCollection("logs");
}

/**
 * @typedef {import("mongodb").Collection<import("./codesFormations.js").Mefs>} LogsCollection
 * @returns {LogsCollection}
 */
function codesFormations() {
  return dbCollection("codesFormations");
}

export { logs, codesFormations, formationsStats, certificationsStats };
