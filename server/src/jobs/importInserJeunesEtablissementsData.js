const { getFromStorage } = require("../common/utils/ovhUtils");
const logger = require("../common/logger").child({ context: "import" });
const { compose, mergeStreams, writeData, oleoduc, transformData } = require("oleoduc");
const { readCSV } = require("../common/utils/streamUtils");
const { dbCollection } = require("../common/mongodb");
const { findRegionByName } = require("../common/regions");
const { pick } = require("lodash");
const { omitNil } = require("../common/utils/objectUtils");
const { asInteger } = require("../common/utils/stringUtils");

async function defaultStream() {
  return compose(
    mergeStreams([
      readCSV(await getFromStorage("depp-2022-etablissement-voie-pro-sco-2020-2019-maj2-112307.csv")),
      readCSV(await getFromStorage("depp-2022-etablissement-apprentissage-2020-2019-maj2-112304.csv")),
    ]),
    transformData((line) => {
      return { ...line, millesime: "2020-2019" };
    })
  );
}

async function importInserJeunesEtablissementsData(options = {}) {
  let stats = { total: 0, created: 0, updated: 0, failed: 0 };
  let stream = options.input ? readCSV(options.input) : await defaultStream();

  await oleoduc(
    stream,
    writeData(async (line) => {
      try {
        stats.total++;

        let codeFormation = line["Code formation apprentissage"] || line["Code formation Mefstat11"];
        let millesime = line.millesime || options.millesime;
        let region = findRegionByName(line["Région"]);
        let selector = {
          uai_de_etablissement: line["n°UAI de l'établissement"],
          code_formation: codeFormation,
          millesime,
        };

        let res = await dbCollection("inserJeunesEtablissements").updateOne(
          selector,
          {
            $setOnInsert: {
              millesime,
              type: line["Code formation apprentissage"] ? "apprentissage" : "pro",
              uai_de_etablissement: line["n°UAI de l'établissement"],
              code_formation: codeFormation,
            },
            $set: omitNil({
              libelle_de_etablissement: line["Libellé de l'établissement"],
              region: pick(region, ["code", "nom"]),
              type_de_diplome: line["Type de diplôme"],
              libelle_de_la_formation: line["Libellé de la formation"],
              duree_de_formation: asInteger(line["Durée de formation (en année)"]),
              diplome_renove_ou_nouveau: line["Diplôme renové ou nouveau"],
              taux_de_poursuite_etudes: asInteger(line["Taux de poursuite d'études"]),
              taux_emploi_6_mois_apres_la_sortie: asInteger(line["Taux d'emploi 6 mois après la sortie"]),
              taux_emploi_12_mois_apres_la_sortie: asInteger(line["Taux d'emploi 12 mois après la sortie"]),
            }),
          },
          { upsert: true }
        );

        if (res.upsertedCount) {
          logger.debug(`Nouvelles données ajoutées`, selector);
          stats.created += res.upsertedCount;
        } else if (res.modifiedCount) {
          stats.updated += res.modifiedCount;
          logger.debug(`Données mis à jour`, selector);
        } else {
          logger.trace(`Données déjà à jour`, selector);
        }
      } catch (e) {
        stats.failed++;
        logger.error(e, `Impossible d'ajouter les données`);
      }
    }),
    { parallel: 10 }
  );

  return stats;
}

module.exports = importInserJeunesEtablissementsData;
