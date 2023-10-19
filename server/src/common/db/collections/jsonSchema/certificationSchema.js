import { string } from "./jsonSchemaTypes.js";
import { diplomeSchema } from "./diplomeSchema.js";

export function indexes() {
  return [[{ code_certification: 1 }], [{ code_formation_diplome: 1 }]];
}

export function fields() {
  return {
    code_certification: string(),
    code_formation_diplome: string(),
    libelle: string(),
    libelle_ancien: string(),
    filiere: string({ enum: ["apprentissage", "pro"] }),
    diplome: diplomeSchema(),
  };
}

export function required() {
  return ["code_certification", "code_formation_diplome", "filiere", "libelle", "diplome"];
}
