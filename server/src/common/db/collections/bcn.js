import { date, object, objectId, string } from "./jsonSchema/jsonSchemaTypes.js";
import { diplomeSchema } from "./jsonSchema/diplomeSchema.js";
import { metaSchema, metaBCNSchema } from "./jsonSchema/metaSchema.js";

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
      diplome: diplomeSchema(),
      _meta: metaSchema([metaBCNSchema()]),
      date_ouverture: date(),
      date_premiere_session: date(),
      date_derniere_session: date(),
    },
    {
      required: [
        "type",
        "code_certification",
        "code_formation_diplome",
        "libelle",
        "libelle_long",
        "date_ouverture",
        "_meta",
      ],
      additionalProperties: true,
    }
  );
}
