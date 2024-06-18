import { FORMATION_TAG } from "#src/common/constants/formationEtablissement.js";
import { object, objectId, string, arrayOf, enumOf, number } from "./jsonSchema/jsonSchemaTypes.js";
import { metaSchema, metaImportSchema } from "./jsonSchema/metaSchema.js";

export const name = "formationEtablissement";

export function indexes() {
  return [[{ uai: 1, cfd: 1, codeDispositif: 1, voie: 1 }, { unique: true }], [{ uai: 1 }], [{ cfd: 1 }]];
}

export function schema() {
  return object(
    {
      _id: objectId(),
      uai: string(),
      cfd: string(),
      codeDispositif: string(),
      mef11: string(),
      voie: enumOf(["scolaire", "apprentissage"]),
      millesime: arrayOf(string()),
      tags: arrayOf(enumOf(Object.values(FORMATION_TAG))),
      indicateurEntree: object(
        {
          rentreeScolaire: string(),
          capacite: number(),
          premiersVoeux: number(),
          effectifs: number(),
          tauxPression: number(),
        },
        {}
      ),
      _meta: metaSchema([metaImportSchema()]),
    },
    {
      required: ["uai", "cfd", "voie", "millesime"],
      additionalProperties: false,
    }
  );
}
