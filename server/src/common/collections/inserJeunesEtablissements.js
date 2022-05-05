const { object, objectId, string, integer } = require("./schemas/jsonSchemaTypes");

module.exports = {
  name: "inserJeunesEtablissements",
  schema: () => {
    return object(
      {
        _id: objectId(),
        millesime: string(),
        type: string({ enum: ["apprentissage", "pro"] }),
        uai_de_etablissement: string(),
        libelle_de_etablissement: string(),
        region: object(
          {
            code: string(),
            nom: string(),
          },
          { required: ["code", "nom"] }
        ),
        code_formation: string(),
        type_de_diplome: string(),
        libelle_de_la_formation: string(),
        duree_de_formation: integer(),
        diplome_renove_ou_nouveau: string(),
        taux_de_poursuite_etudes: integer(),
        taux_emploi_6_mois_apres_la_sortie: integer(),
        taux_emploi_12_mois_apres_la_sortie: integer(),
      },
      {
        required: [
          "millesime",
          "type",
          "uai_de_etablissement",
          "libelle_de_etablissement",
          "region",
          "code_formation",
          "type_de_diplome",
          "libelle_de_la_formation",
          "diplome_renove_ou_nouveau",
        ],
      }
    );
  },
  indexes: () => {
    return [[{ millesime: 1, uai_de_etablissement: 1, code_formation: 1 }, { unique: true }]];
  },
};
