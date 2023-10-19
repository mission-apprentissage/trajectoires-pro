import { bcn } from "#src/common/db/collections/collections.js";
import { pickWithNil } from "#src/common/utils/objectUtils.js";

export async function getCertificationInfo(code_certification) {
  const certification = await bcn().findOne({ code_certification });
  if (!certification) {
    return null;
  }

  return {
    code_certification: code_certification,
    code_formation_diplome: certification?.code_formation_diplome,
    libelle: certification?.libelle_long,
    libelle_ancien: certification?.libelle_long_ancien,
    diplome: pickWithNil(certification?.diplome, ["code", "libelle"]),
  };
}
