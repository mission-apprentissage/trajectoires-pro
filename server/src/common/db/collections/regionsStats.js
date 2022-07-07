import { object, objectId, string } from "./jsonSchema/jsonSchemaTypes.js";
import { diplomeSchema } from "./jsonSchema/diplomeSchema.js";
import { regionSchema } from "./jsonSchema/regionSchema.js";
import { statsSchema } from "./jsonSchema/statsSchema.js";
import { metaSchema } from "./jsonSchema/metaSchema.js";

export const name = "regionsStats";

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
      _meta: metaSchema(),
    },
    {
      required: ["region", "millesime", "code_certification", "code_formation_diplome", "filiere", "diplome"],
      additionalProperties: false,
    }
  );
}
