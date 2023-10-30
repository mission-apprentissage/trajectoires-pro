import { date, object, objectId, string, arrayOf } from "./jsonSchema/jsonSchemaTypes.js";
import { diplomeSchema } from "./jsonSchema/diplomeSchema.js";
import { metaSchema, metaImportSchema } from "./jsonSchema/metaSchema.js";

export const name = "bcn";

export function indexes() {
  return [[{ code_certification: 1 }, { unique: true }], [{ code_formation_diplome: 1 }]];
}

export function schema() {
  return object(
    {
      _id: objectId(),
      type: string({ enum: ["mef", "cfd"] }),
      code_certification: string(),
      code_formation_diplome: string(),
      date_fermeture: date(),
      libelle: string(),
      libelle_long: string(),
      libelle_long_ancien: string(),
      diplome: diplomeSchema(),
      _meta: metaSchema([metaImportSchema()]),
      date_ouverture: date(),
      date_premiere_session: string(),
      date_derniere_session: string(),
      nouveau_diplome: arrayOf(string()),
      ancien_diplome: arrayOf(string()),
    },
    {
      required: ["type", "code_certification", "code_formation_diplome", "libelle", "libelle_long", "_meta"],
      additionalProperties: true,
    }
  );
}
