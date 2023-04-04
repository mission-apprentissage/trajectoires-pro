import * as logsDescriptor from "./logs.js";
import * as formationsStatsDescriptor from "./formationsStats.js";
import * as regionalesStatsDescriptor from "./regionalesStats.js";
import * as departementalesStatsDescriptor from "./departementalesStats.js";
import * as certificationsStatsDescriptor from "./certificationsStats.js";
import * as metricsDescriptor from "./metrics.js";
import * as migrationsDescriptor from "./migrations.js";
import * as bcnDescriptor from "./bcn.js";
import * as caEtablissementsDescriptor from "./caEtablissements.js";
import * as acceEtablissementsDescriptor from "./acceEtablissements.js";
import { dbCollection } from "../mongodb.js";

export function getCollectionDescriptors() {
  return [
    logsDescriptor,
    formationsStatsDescriptor,
    regionalesStatsDescriptor,
    departementalesStatsDescriptor,
    certificationsStatsDescriptor,
    metricsDescriptor,
    migrationsDescriptor,
    bcnDescriptor,
    caEtablissementsDescriptor,
    acceEtablissementsDescriptor,
  ];
}

export function formationsStats() {
  return dbCollection(formationsStatsDescriptor.name);
}

export function regionalesStats() {
  return dbCollection(regionalesStatsDescriptor.name);
}

export function departementalesStats() {
  return dbCollection(departementalesStatsDescriptor.name);
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

export function caEtablissements() {
  return dbCollection(caEtablissementsDescriptor.name);
}

export function acceEtablissements() {
  return dbCollection(acceEtablissementsDescriptor.name);
}
