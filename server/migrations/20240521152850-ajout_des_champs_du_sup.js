import { date, string, object, integer } from "#src/common/db/collections/jsonSchema/jsonSchemaTypes.js";
import * as MongoDB from "#src/common/db/mongodb.js";

const oldSchema = {
  properties: {
    filiere: string({ enum: ["apprentissage", "pro"] }),
    _meta: object({
      date_import: date(),
      created_on: date(),
      updated_on: date(),

      inserjeunes: object({
        taux_poursuite_etudes: integer(),
        taux_emploi_24_mois: integer(),
        taux_emploi_18_mois: integer(),
        taux_emploi_12_mois: integer(),
        taux_emploi_6_mois: integer(),
        DEVENIR_part_autre_situation_6_mois: integer(),
        DEVENIR_part_en_emploi_6_mois: integer(),
        DEVENIR_part_poursuite_etudes: integer(),
      }),
    }),
  },
  required: ["code_formation_diplome"],
};

const schema = {
  properties: {
    code_certification_type: string({ enum: ["cfd", "mef11", "sise"] }),
    filiere: string({ enum: ["apprentissage", "pro", "superieur"] }),
    nb_diplome: integer(),
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
        inserjeunes: object({
          taux_poursuite_etudes: integer(),
          taux_emploi_24_mois: integer(),
          taux_emploi_18_mois: integer(),
          taux_emploi_12_mois: integer(),
          taux_emploi_6_mois: integer(),
          DEVENIR_part_autre_situation_6_mois: integer(),
          DEVENIR_part_en_emploi_6_mois: integer(),
          DEVENIR_part_poursuite_etudes: integer(),
        }),
      },
      { required: ["date_import"] }
    ),
  },
  required: ["code_certification_type"],
};

export const up = async (db, client) => {
  MongoDB.setMongoDBClient(client);
  await Promise.all(
    ["certificationsStats", "formationsStats", "regionalesStats"].map(async (collection) => {
      await MongoDB.removeFromSchema(collection, oldSchema);
      await Promise.all([MongoDB.mergeSchema(collection, schema)]);

      // Update code_certification_type
      await MongoDB.dbCollection(collection).updateMany(
        { $expr: { $eq: [{ $strLenCP: "$code_certification" }, 8] } },
        { $set: { code_certification_type: "cfd" } }
      );

      await MongoDB.dbCollection(collection).updateMany(
        { $expr: { $eq: [{ $strLenCP: "$code_certification" }, 11] } },
        { $set: { code_certification_type: "mef11" } }
      );
      await MongoDB.dbCollection(collection).updateMany(
        { filiere: "superieur", $expr: { $eq: [{ $strLenCP: "$code_certification" }, 7] } },
        { $set: { code_certification_type: "sise" } }
      );
    })
  );
};

export const down = async (db, client) => {
  MongoDB.setMongoDBClient(client);
  await Promise.all(
    ["certificationsStats", "formationsStats", "regionalesStats"].map(async (collection) => {
      await Promise.all([MongoDB.removeFromSchema(collection, schema)]);
      await MongoDB.mergeSchema(collection, oldSchema);

      // Remove code_certification_type
      await MongoDB.dbCollection(collection).updateMany(
        { filiere: "apprentissage" },
        { $unset: { code_certification_type: "" } }
      );
      await MongoDB.dbCollection(collection).updateMany(
        { filiere: "pro" },
        { $unset: { code_certification_type: "" } }
      );
    })
  );
};
