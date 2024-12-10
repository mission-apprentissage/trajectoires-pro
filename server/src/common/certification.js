import { bcn } from "#src/common/db/collections/collections.js";
import { pickWithNil } from "#src/common/utils/objectUtils.js";
import BCNSiseRepository from "#src/common/repositories/bcnSise.js";

export const CERTIFICATION_UNIVERSE = ["secondaire", "superieur"];

export async function getCertificationInfo(code_certification) {
  const certification = await bcn().findOne({ code_certification });
  if (!certification) {
    return null;
  }

  return {
    code_certification: code_certification,
    code_certification_type: certification?.type === "mef" ? "mef11" : "cfd",
    code_formation_diplome: certification?.code_formation_diplome,
    libelle: certification?.libelle_long,
    libelle_ancien: certification?.libelle_long_ancien,
    diplome: pickWithNil(certification?.diplome, ["code", "libelle"]),
    date_fermeture: certification?.date_fermeture,
    familleMetier: pickWithNil(certification?.familleMetier, ["code", "libelle", "isAnneeCommune"]),
  };
}

export async function getCertificationSupInfo(code_certification) {
  const certification = await BCNSiseRepository.first({
    diplome_sise: code_certification,
  });

  if (!certification) {
    return null;
  }

  return {
    code_certification: code_certification,
    code_certification_type: "sise",
    libelle: certification?.libelle_intitule_1,
    libelle_ancien: null,
    diplome: pickWithNil(certification?.diplome, ["code", "libelle"]),
    date_fermeture: certification?.date_fermeture,
  };
}
