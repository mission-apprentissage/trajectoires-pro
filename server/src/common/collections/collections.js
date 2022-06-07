// @ts-check

import * as logsDescriptor from "./logs.js";
import * as codeFormationDiplomesDescriptor from "./codeFormationDiplomes.js";
import * as formationsStatsDescriptor from "./formationsStats.js";
import * as certificationsStatsDescriptor from "./certificationsStats.js";
import * as consumptionsDescriptor from "./consumptions.js";
import { dbCollection } from "../mongodb.js";

export function getCollectionDescriptors() {
  return [
    logsDescriptor,
    codeFormationDiplomesDescriptor,
    formationsStatsDescriptor,
    certificationsStatsDescriptor,
    consumptionsDescriptor,
  ];
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
 * @typedef {import("mongodb").Collection<import("./codeFormationDiplomes").CodeFormationDiplomes>} CodeFormationDiplomesCollection
 * @returns {CodeFormationDiplomesCollection}
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
/**
 * @typedef {import("mongodb").Collection<import("./consumptions").Consumptions>} ConsumptionsCollection
 * @returns {ConsumptionsCollection}
 */
export function consumptions() {
  return dbCollection(consumptionsDescriptor.name);
}
