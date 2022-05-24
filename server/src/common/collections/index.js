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
 * @typedef {import("mongodb").Collection<import("./certifications.js").Mefs>} CertificationsCollection
 * @returns {CertificationsCollection}
 */
function cfd() {
  return dbCollection("cfd");
}

export { logs, cfd, formationsStats, certificationsStats };
