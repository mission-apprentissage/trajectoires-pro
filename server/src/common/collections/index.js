const { dbCollection } = require("../mongodb");

module.exports = {
  /**
   * @typedef {import("mongodb").Collection<import("./logs").Logs>} LogsCollection
   * @returns {LogsCollection}
   */
  logs: () => dbCollection("logs"),
  /**
   * @typedef {import("mongodb").Collection<import("./inserJeunesNationals").InserJeunesNationals>}InserJeunesNationalsCollection
   *  @returns {InserJeunesNationalsCollection}
   */
  inserJeunesNationals: () => dbCollection("inserJeunesNationals"),
  /**
   * @typedef {import("mongodb").Collection<import("./formationsStats").FormationsStats>} FormationsStatsCollection
   * @returns {FormationsStatsCollection}
   */
  formationsStats: () => dbCollection("formationsStats"),
};
