import { date, string, object, integer } from "#src/common/db/collections/jsonSchema/jsonSchemaTypes.js";
import * as MongoDB from "#src/common/db/mongodb.js";

const oldSchema = {
  properties: {
    _meta: object(
      {
        date_import: date(),
        created_on: date(),
        updated_on: date(),
        insersup: object({
          etablissement_libelle: string(),
          etablissement_actuel_libelle: string(),
          type_diplome: string(),
          domaine_disciplinaire: string(),
          secteur_disciplinaire: string(),
          discipline: string(),
        }),
        inserjeunes: object(
          {
            taux_poursuite_etudes: integer(),
            taux_emploi_24_mois: integer(),
            taux_emploi_18_mois: integer(),
            taux_emploi_12_mois: integer(),
            taux_emploi_6_mois: integer(),
            DEVENIR_part_autre_situation_6_mois: integer(),
            DEVENIR_part_en_emploi_6_mois: integer(),
            DEVENIR_part_poursuite_etudes: integer(),
          },
          { additionalProperties: false }
        ),
      },
      { required: ["date_import"] }
    ),
  },
};

const schema = {
  properties: {
    _meta: object(
      {
        date_import: date(),
        created_on: date(),
        updated_on: date(),
        insersup: object({
          etablissement_libelle: string(),
          etablissement_actuel_libelle: string(),
          type_diplome: string(),
          domaine_disciplinaire: string(),
          secteur_disciplinaire: string(),
          discipline: string(),
        }),
        inserjeunes: object(
          {
            taux_poursuite_etudes: integer(),
            taux_emploi_24_mois: integer(),
            taux_emploi_18_mois: integer(),
            taux_emploi_12_mois: integer(),
            taux_emploi_6_mois: integer(),
            DEVENIR_part_autre_situation_6_mois: integer(),
            DEVENIR_part_en_emploi_6_mois: integer(),
            DEVENIR_part_poursuite_etudes: integer(),
          },
          { additionalProperties: true }
        ),
      },
      { required: ["date_import"] }
    ),
  },
};

export const up = async (db, client) => {
  MongoDB.setMongoDBClient(client);
  await Promise.all(
    ["certificationsStats", "formationsStats", "regionalesStats"].map(async (collection) => {
      await MongoDB.removeFromSchema(collection, oldSchema);
      await Promise.all([MongoDB.mergeSchema(collection, schema)]);
    })
  );
};

export const down = async (db, client) => {
  MongoDB.setMongoDBClient(client);
  await Promise.all(
    ["certificationsStats", "formationsStats", "regionalesStats"].map(async (collection) => {
      await Promise.all([MongoDB.removeFromSchema(collection, schema)]);
      await MongoDB.mergeSchema(collection, oldSchema);
    })
  );
};
