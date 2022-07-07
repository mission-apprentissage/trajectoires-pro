import { object, objectId, string } from "./jsonSchema/jsonSchemaTypes.js";
import { diplomeSchema } from "./jsonSchema/diplomeSchema.js";
import { tauxFormationStatsSchema, valeursFormationStatsSchema } from "./jsonSchema/statsFormationSchema.js";
import { regionSchema } from "./jsonSchema/regionSchema.js";
import { metaSchema } from "./jsonSchema/metaSchema.js";

export const name = "formationsStats";

export function indexes() {
  return [
    [{ uai: 1, code_certification: 1, millesime: 1 }, { unique: true }],
    [{ uai: 1 }],
    [{ millesime: 1 }],
    [{ code_certification: 1 }],
    [{ filiere: 1 }],
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
      ...valeursFormationStatsSchema(),
      ...tauxFormationStatsSchema(),
      _meta: metaSchema(),
    },
    {
      required: ["uai", "millesime", "code_certification", "code_formation_diplome", "filiere", "diplome", "region"],
      additionalProperties: false,
    }
  );
}
