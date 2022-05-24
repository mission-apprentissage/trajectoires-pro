import { codeFormationDiplomes } from "../collections/codeFormationDiplomes.js";

export function getCFD(code) {
  return codeFormationDiplomes().findOne({
    $or: [{ code_formation: code }, { mef: code }, { mef_stats_9: code }, { mef_stats_11: code }],
  });
}
