import { logger } from "#src/common/logger.js";
import { objectId, object, string, date } from "#src/common/db/collections/jsonSchema/jsonSchemaTypes.js";

const name = "acceEtablissements";

function indexes() {
  return [[{ numero_uai: 1 }, { unique: true }]];
}

function schema() {
  return object(
    {
      _id: objectId(),
      numero_uai: string(),
      nature_uai: string(),
      nature_uai_libe: string(),
      type_uai: string(),
      type_uai_libe: string(),
      etat_etablissement: string(),
      etat_etablissement_libe: string(),
      ministere_tutelle: string(),
      ministere_tutelle_libe: string(),
      tutelle_2: string(),
      tutelle_2_libe: string(),
      secteur_public_prive: string(),
      secteur_public_prive_libe: string(),
      sigle_uai: string(),
      categorie_juridique: string(),
      categorie_juridique_libe: string(),
      contrat_etablissement: string(),
      contrat_etablissement_libe: string(),
      categorie_financiere: string(),
      categorie_financiere_libe: string(),
      situation_comptable: string(),
      situation_comptable_libe: string(),
      niveau_uai: string(),
      niveau_uai_libe: string(),
      commune: string(),
      commune_libe: string(),
      academie: string(),
      academie_libe: string(),
      pays: string(),
      pays_libe: string(),
      departement_insee_3: string(),
      departement_insee_3_libe: string(),
      denomination_principale: string(),
      appellation_officielle: string(),
      patronyme_uai: string(),
      hebergement_etablissement: string(),
      hebergement_etablissement_libe: string(),
      numero_siren_siret_uai: string(),
      numero_finess_uai: string(),
      date_ouverture: date(),
      date_fermeture: date(),
      date_derniere_mise_a_jour: date(),
      lieu_dit_uai: string(),
      adresse_uai: string(),
      boite_postale_uai: string(),
      code_postal_uai: string(),
      etat_sirad_uai: string(),
      localite_acheminement_uai: string(),
      pays_etranger_acheminement: string(),
      numero_telephone_uai: string(),
      numero_telecopieur_uai: string(),
      mention_distribution: string(),
      mel_uai: string(),
      site_web: string(),
      coordonnee_x: string(),
      coordonnee_y: string(),
      appariement: string(),
      appariement_complement: string(),
      localisation: string(),
      localisation_complement: string(),
      date_geolocalisation: date(),
      source: string(),
      _meta: object(
        {
          created_on: date(),
          updated_on: date(),
          date_import: date(),
        },
        { required: ["date_import"] }
      ),
    },
    {
      required: ["numero_uai", "_meta"],
      additionalProperties: false,
    }
  );
}

export const up = async (db) => {
  let collections = await db.listCollections().toArray();
  if (!collections.find((c) => c.name === name)) {
    await db.createCollection(name);
  }

  logger.debug(`Configuring indexes for collection ${name}...`);
  let dbCol = db.collection(name);

  await Promise.all(
    indexes().map(([index, options]) => {
      return dbCol.createIndex(index, options);
    })
  );

  logger.debug(`Configuring validation for collection ${name}...`);
  await db.command({
    collMod: name,
    validationLevel: "strict",
    validationAction: "error",
    validator: {
      $jsonSchema: schema(),
    },
  });
};

export const down = async () => {
  // We do not remove the collection to avoid deleting data by error
};
