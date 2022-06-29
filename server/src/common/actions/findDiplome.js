import { codeFormationDiplomes, mefs } from "../collections/collections.js";

export async function findDiplome(code) {
  const res = await Promise.all([
    mefs().findOne({ mef_stat_11: code }),
    codeFormationDiplomes().findOne({ code_formation: code }),
  ]);

  return res.find((r) => r)?.diplome;
}
