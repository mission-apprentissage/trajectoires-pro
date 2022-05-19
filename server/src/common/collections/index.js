const { dbCollection } = require("../mongodb");

module.exports = {
  /**
   * @typedef {import("mongodb").Collection<import("./logs").Logs>} LogsCollection
   * @returns {LogsCollection}
   */
  logs: () => dbCollection("logs"),
  /**
   * @typedef {import("mongodb").Collection<import("./formationsStats").FormationsStats>} FormationsStatsCollection
   * @returns {FormationsStatsCollection}
   */
  formationsStats: () => dbCollection("formationsStats"),
  /**
   * @typedef {import("mongodb").Collection<import("./certificationsStats").CertificationsStats>} CertificationsStatsCollection
   * @returns {CertificationsStatsCollection}
   */
  certificationsStats: () => dbCollection("certificationsStats"),
};
