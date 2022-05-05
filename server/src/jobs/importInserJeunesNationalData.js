const { getFromStorage } = require("../common/utils/ovhUtils");
const logger = require("../common/logger").child({ context: "import" });
const { compose, mergeStreams, writeData, oleoduc, transformData } = require("oleoduc");
const { readCSV } = require("../common/utils/streamUtils");
const { dbCollection } = require("../common/mongodb");
const { omitNil } = require("../common/utils/objectUtils");
const { asInteger } = require("../common/utils/stringUtils");

const defaultStream = async () => {
  return mergeStreams([
    compose(
      readCSV(await getFromStorage("depp-2022-france-voie-pro-sco-educ-nat-id-mefstat11-2020-maj2-112295-2020.csv")),
      transformData((line) => {
        return { ...line, type: "pro", millesime: "2020-2019" };
      })
    ),
    compose(
      readCSV(await getFromStorage("depp-2022-france-apprentissage-id-formation-2020-maj2-112292-2020.csv")),
      transformData((line) => {
        return { ...line, type: "apprentissage", millesime: "2020-2019" };
      })
    ),
  ]);
};

const importInserJeunesNationalData = async (options = {}) => {
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };
  const stream = options.input ? readCSV(options.input) : await defaultStream();

  await oleoduc(
    stream,
    writeData(async (line) => {
      try {
        stats.total++;

        const codeFormation = line["Code Formation"];
        const millesime = line.millesime || options.millesime;
        const selector = {
          code_formation: codeFormation,
          millesime,
        };

        const res = await dbCollection("inserJeunesNationals").updateOne(
          selector,
          {
            $setOnInsert: {
              millesime,
              type: line.type ?? options.type,
              code_formation: codeFormation,
            },
            $set: omitNil({
              type_de_diplome: line["Type de diplôme"],
              libelle_de_la_formation: line["Libellé de la formation"],
              duree_de_formation: asInteger(line["Durée de formation (en année)"]),
              diplome_renove_ou_nouveau: line["Diplôme rénové ou nouveau"],
              taux_de_poursuite_etudes: asInteger(line["Taux de poursuite d'études"]),
              nb_en_poursuite_etudes: asInteger(line["nb en poursuite d'études"]),
              nb_en_annee_terminale: asInteger(line["nb en année terminale"]),
              taux_emploi_6_mois_apres_la_sortie: asInteger(line["Taux d'emploi 6 mois après la sortie"]),
              nb_en_emploi_6_mois_apres_la_sortie: asInteger(line["nb en emploi 6 mois après la sortie"]),
              nb_sortants_6_mois_apres_la_sortie: asInteger(line["nb de sortants 6 mois après la sortie"]),
              taux_emploi_12_mois_apres_la_sortie: asInteger(line["Taux d'emploi 12 mois après la sortie"]),
              nb_en_emploi_12_mois_apres_la_sortie: asInteger(line["nb en emploi 12 mois après la sortie"]),
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
};

module.exports = importInserJeunesNationalData;
