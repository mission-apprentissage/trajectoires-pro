import { object, objectId, string, arrayOf, enumOf } from "./jsonSchema/jsonSchemaTypes.js";
import * as Stats from "./jsonSchema/statsSchema.js";
import { regionSchema } from "./jsonSchema/regionSchema.js";
import { academieSchema } from "./jsonSchema/academieSchema.js";
import * as Continuum from "./jsonSchema/continuumSchema.js";
import { metaSchema, metaIJSchema, metaInserSupSchema } from "./jsonSchema/metaSchema.js";
import * as Certification from "./jsonSchema/certificationSchema.js";

export const name = "formationsStats";

export const UAI_TYPE = ["lieu_formation", "formateur", "gestionnaire", "inconnu"];

export function indexes() {
  return [
    [{ uai: 1, code_certification: 1, millesime: 1 }, { unique: true }],
    [{ uai: 1 }],
    [{ millesime: 1 }],
    ...Certification.indexes(),
  ];
}

export function schema() {
  return object(
    {
      _id: objectId(),
      uai: string(),
      uai_type: enumOf(UAI_TYPE),
      uai_lieu_formation: arrayOf(string()), // Dans le cas ou uai_type est formateur ou gestionnaire
      uai_formateur: arrayOf(string()), // Dans le cas ou uai_type est lieu_formation ou gestionnaire
      uai_gestionnaire: arrayOf(string()), // Dans le cas ou uai_type est lieu_formation ou formateur
      uai_donnee: string(),
      uai_donnee_type: enumOf(UAI_TYPE),
      libelle_etablissement: string(),
      millesime: string(),
      region: regionSchema(),
      academie: academieSchema(),
      ...Certification.fields(),
      ...Stats.fields(),
      ...Continuum.fields(),
      _meta: metaSchema([metaIJSchema(), metaInserSupSchema()]),
    },
    {
      required: ["uai", "millesime", "region", "academie", ...Certification.required(), ...Continuum.required()],
      additionalProperties: false,
    }
  );
}
