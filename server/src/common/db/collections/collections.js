import * as logsDescriptor from "./logs.js";
import * as formationsStatsDescriptor from "./formationsStats.js";
import * as regionalesStatsDescriptor from "./regionalesStats.js";
import * as certificationsStatsDescriptor from "./certificationsStats.js";
import * as metricsDescriptor from "./metrics.js";
import * as bcnDescriptor from "./bcn.js";
import * as bcnMefDescriptor from "./bcn_mef.js";
import * as bcnSiseDescriptor from "./bcn_sise.js";
import * as cfdRomesDescriptor from "./cfdRomes.js";
import * as romeDescriptor from "./rome.js";
import * as romeMetierDescriptor from "./romeMetier.js";
import * as cfdMetiersDescriptor from "./cfdMetiers.js";
import * as acceEtablissementsDescriptor from "./acceEtablissements.js";
import * as usersDescriptor from "./users.js";
import * as catalogueApprentissageFormationsDescriptor from "./catalogueApprentissageFormations.js";
import * as formationEtablissementDescriptor from "./formationEtablissement.js";
import * as etablissementDescriptor from "./etablissement.js";
import { dbCollection } from "#src/common/db/mongodb.js";

export function getCollectionDescriptors() {
  return [
    logsDescriptor,
    formationsStatsDescriptor,
    regionalesStatsDescriptor,
    certificationsStatsDescriptor,
    metricsDescriptor,
    bcnDescriptor,
    bcnMefDescriptor,
    bcnSiseDescriptor,
    cfdRomesDescriptor,
    romeDescriptor,
    romeMetierDescriptor,
    cfdMetiersDescriptor,
    acceEtablissementsDescriptor,
    usersDescriptor,
    catalogueApprentissageFormationsDescriptor,
    formationEtablissementDescriptor,
    etablissementDescriptor,
  ];
}

export function formationsStats() {
  return dbCollection(formationsStatsDescriptor.name);
}

export function regionalesStats() {
  return dbCollection(regionalesStatsDescriptor.name);
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

export function bcn() {
  return dbCollection(bcnDescriptor.name);
}

export function bcnMef() {
  return dbCollection(bcnMefDescriptor.name);
}

export function bcnSise() {
  return dbCollection(bcnSiseDescriptor.name);
}

export function cfdRomes() {
  return dbCollection(cfdRomesDescriptor.name);
}

export function rome() {
  return dbCollection(romeDescriptor.name);
}

export function romeMetier() {
  return dbCollection(romeMetierDescriptor.name);
}

export function cfdMetiers() {
  return dbCollection(cfdMetiersDescriptor.name);
}

export function acceEtablissements() {
  return dbCollection(acceEtablissementsDescriptor.name);
}

export function users() {
  return dbCollection(usersDescriptor.name);
}

export function CAFormations() {
  return dbCollection(catalogueApprentissageFormationsDescriptor.name);
}

export function formationEtablissement() {
  return dbCollection(formationEtablissementDescriptor.name);
}

export function etablissement() {
  return dbCollection(etablissementDescriptor.name);
}
