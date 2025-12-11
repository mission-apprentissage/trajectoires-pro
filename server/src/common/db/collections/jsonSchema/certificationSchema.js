import { string, date } from "./jsonSchemaTypes.js";
import { diplomeSchema } from "./diplomeSchema.js";
import { familleMetierSchema } from "./familleMetierSchema.js";
import { certificationsTerminalesSchema } from "./certificationsTerminalesSchema.js";

export function indexes() {
  return [[{ code_certification: 1 }], [{ code_formation_diplome: 1 }]];
}

export function fields() {
  return {
    code_certification: string(),
    code_certification_type: string({ enum: ["cfd", "mef11", "sise"] }),
    code_formation_diplome: string(),
    libelle: string(),
    libelle_ancien: string(),
    filiere: string({ enum: ["apprentissage", "pro", "superieur", "agricole"] }),
    diplome: diplomeSchema(),
    date_fermeture: date(),
    familleMetier: familleMetierSchema(),
    certificationsTerminales: certificationsTerminalesSchema(),
  };
}

export function required() {
  return ["code_certification", "code_certification_type", "filiere", "libelle", "diplome"];
}
