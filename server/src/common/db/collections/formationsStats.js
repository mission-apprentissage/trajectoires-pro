import { object, objectId, string } from "./jsonSchema/jsonSchemaTypes.js";
import { diplomeSchema } from "./jsonSchema/diplomeSchema.js";
import { statsSchema } from "./jsonSchema/statsSchema.js";
import { regionSchema } from "./jsonSchema/regionSchema.js";
import { continuumSchema } from "./jsonSchema/continuumSchema.js";
import { metaSchema, metaIJSchema } from "./jsonSchema/metaSchema.js";

export const name = "formationsStats";

export function indexes() {
  return [
    [{ uai: 1, code_certification: 1, millesime: 1 }, { unique: true }],
    [{ uai: 1 }],
    [{ millesime: 1 }],
    [{ code_certification: 1 }],
  ];
}

export function schema() {
  return object(
    {
      _id: objectId(),
      uai: string(),
      millesime: string(),
      code_certification: string(),
      code_formation_diplome: string(),
      filiere: string({ enum: ["apprentissage", "pro"] }),
      diplome: diplomeSchema(),
      region: regionSchema(),
      ...statsSchema(),
      ...continuumSchema(),
      _meta: metaSchema([metaIJSchema()]),
    },
    {
      required: [
        "uai",
        "millesime",
        "code_certification",
        "code_formation_diplome",
        "filiere",
        "diplome",
        "region",
        "donnee_source",
      ],
      additionalProperties: false,
    }
  );
}
