const { object, objectId, string, integer } = require("./schemas/jsonSchemaTypes");

module.exports = {
  name: "inserJeunesNationals",
  schema: () => {
    return object(
      {
        _id: objectId(),
        millesime: string(),
        type: string({ enum: ["apprentissage", "pro"] }),
        code_formation: string(),
        type_de_diplome: string(),
        libelle_de_la_formation: string(),
        duree_de_formation: integer(),
        diplome_renove_ou_nouveau: string(),
        taux_de_poursuite_etudes: integer(),
        nb_en_poursuite_etudes: integer(),
        nb_en_annee_terminale: integer(),
        taux_emploi_6_mois_apres_la_sortie: integer(),
        nb_en_emploi_6_mois_apres_la_sortie: integer(),
        nb_sortants_6_mois_apres_la_sortie: integer(),
        taux_emploi_12_mois_apres_la_sortie: integer(),
        nb_en_emploi_12_mois_apres_la_sortie: integer(),
      },
      {
        required: [
          "millesime",
          "type",
          "code_formation",
          "type_de_diplome",
          "libelle_de_la_formation",
          "diplome_renove_ou_nouveau",
        ],
      }
    );
  },

  indexes: () => {
    return [[{ millesime: 1, code_formation: 1 }, { unique: true }]];
  },
};
