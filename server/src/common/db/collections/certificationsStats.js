import { object, objectId, string } from "./jsonSchema/jsonSchemaTypes.js";
import { diplomeSchema } from "./jsonSchema/diplomeSchema.js";
import { metaSchema, metaIJSchema } from "./jsonSchema/metaSchema.js";
import { statsSchema } from "./jsonSchema/statsSchema.js";

export const name = "certificationsStats";

export function indexes() {
  return [
    [{ millesime: 1, code_certification: 1 }, { unique: true }],
    [{ millesime: 1 }],
    [{ code_certification: 1 }],
    [{ code_formation_diplome: 1 }],
  ];
}

export function schema() {
  return object(
    {
      _id: objectId(),
      millesime: string(),
      code_certification: string(),
      code_formation_diplome: string(),
      filiere: string({ enum: ["apprentissage", "pro"] }),
      diplome: diplomeSchema(),
      ...statsSchema(),
      _meta: metaSchema([metaIJSchema()]),
    },
    {
      required: ["millesime", "code_certification", "code_formation_diplome", "filiere", "diplome"],
      additionalProperties: false,
    }
  );
}
