import { object, objectId, string } from "./jsonSchema/jsonSchemaTypes.js";
import { diplomeSchema } from "./jsonSchema/diplomeSchema.js";
import { regionSchema } from "./jsonSchema/regionSchema.js";
import { statsSchema } from "./jsonSchema/statsSchema.js";
import { metaSchema, metaIJSchema } from "./jsonSchema/metaSchema.js";
import { continuumSchema } from "./jsonSchema/continuumSchema.js";

export const name = "regionalesStats";

export function indexes() {
  return [
    [{ "region.code": 1, code_certification: 1, millesime: 1 }, { unique: true }],
    [{ "region.code": 1 }],
    [{ millesime: 1 }],
    [{ code_certification: 1 }],
  ];
}

export function schema() {
  return object(
    {
      _id: objectId(),
      region: regionSchema(),
      millesime: string(),
      code_certification: string(),
      code_formation_diplome: string(),
      filiere: string({ enum: ["apprentissage", "pro"] }),
      diplome: diplomeSchema(),
      ...statsSchema(),
      ...continuumSchema(),
      _meta: metaSchema([metaIJSchema()]),
    },
    {
      required: [
        "region",
        "millesime",
        "code_certification",
        "code_formation_diplome",
        "filiere",
        "diplome",
        "donnee_source",
      ],
      additionalProperties: false,
    }
  );
}
