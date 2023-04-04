import { objectId, string } from "./jsonSchemaTypes.js";
import { diplomeSchema } from "./diplomeSchema.js";
import { statsSchema } from "./statsSchema.js";
import { metaSchema } from "./metaSchema.js";

export function fields() {
  return {
    _id: objectId(),
    millesime: string(),
    code_certification: string(),
    code_formation_diplome: string(),
    filiere: string({ enum: ["apprentissage", "pro"] }),
    diplome: diplomeSchema(),
    ...statsSchema(),
    _meta: metaSchema(),
  };
}

export function required() {
  return ["millesime", "code_certification", "code_formation_diplome", "filiere", "diplome"];
}

export function indexes() {
  return [[{ millesime: 1 }], [{ code_certification: 1 }]];
}
