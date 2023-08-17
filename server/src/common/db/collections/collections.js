import * as logsDescriptor from "./logs.js";
import * as formationsStatsDescriptor from "./formationsStats.js";
import * as regionalesStatsDescriptor from "./regionalesStats.js";
import * as certificationsStatsDescriptor from "./certificationsStats.js";
import * as metricsDescriptor from "./metrics.js";
import * as bcnDescriptor from "./bcn.js";
import * as bcnMefDescriptor from "./bcn_mef.js";
import { dbCollection } from "../mongodb.js";

export function getCollectionDescriptors() {
  return [
    logsDescriptor,
    formationsStatsDescriptor,
    regionalesStatsDescriptor,
    certificationsStatsDescriptor,
    metricsDescriptor,
    bcnDescriptor,
    bcnMefDescriptor,
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
