import { cfds, mefs } from "../db/collections.js";

export async function findCodeCertification(code) {
  const res = await Promise.all([mefs().findOne({ mef_stat_11: code }), cfds().findOne({ code_formation: code })]);

  return res.find((r) => r);
}
