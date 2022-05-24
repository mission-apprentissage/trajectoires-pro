import * as logs from "./logs.js";
import * as codeFormationDiplomes from "./codeFormationDiplomes.js";
import * as formationsStats from "./formationsStats.js";
import * as certificationsStats from "./certificationsStats.js";

const collections = { logs, codeFormationDiplomes, formationsStats, certificationsStats };

export function getCollections() {
  return Object.values(collections);
}
