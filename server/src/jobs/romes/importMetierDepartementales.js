import { oleoduc, flattenArray, transformData, writeData, filterData } from "oleoduc";
import { upsert } from "#src/common/db/mongodb.js";
import { metierDepartementales } from "#src/common/db/collections/collections.js";
import { getLoggerWithContext } from "#src/common/logger.js";
import { merge } from "lodash-es";
import { MetierAvenirApi } from "#src/services/diagoriente/MetierAvenirApi.js";
import { Readable } from "stream";
import { omitNil } from "#src/common/utils/objectUtils.js";
import { getDepartements } from "#src/services/regions.js";
import RomeMetierRepository from "#src/common/repositories/romeMetier.js";

const logger = getLoggerWithContext("import");

function normalizeAppelations(data) {
  const fieldBoolean = [
    "metier_avenir",
    "metier_en_tension",
    "transition_ecologique",
    "transition_numerique",
    "transition_demographique",
    "metier_art",
  ];
  const toBoolean = (data) => {
    if (data === "TRUE" || data === "VRAI") return true;
    if (data === "FALSE" || data === "FAUX" || data === null) return false;
    return data;
  };

  return {
    ...data,
    ...Object.assign(
      {},
      ...Object.keys(data)
        .filter((k) => fieldBoolean.includes(k))
        .map((k) => ({
          [k]: toBoolean(data[k]),
        }))
    ),
  };
}

export async function importMetierDepartementales(options = {}) {
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };

  const sizeByPage = 50;
  // Set a default retry for Diagoriente API
  const diagorienteOptions = merge({ apiOptions: { retry: { retries: 5 } } }, options.diagorienteOptions || {});
  const diagoriente = options.diagoriente || new MetierAvenirApi(diagorienteOptions);

  function handleError(e, context) {
    logger.error({ err: e, ...context }, `Impossible d'importer les métiers`);
    stats.failed++;
    return null; //ignore chunk
  }

  const getPages = async (departement, code_ogr) => {
    const result = await diagoriente.appellationsOgr({ departement, code_ogr, page: 1, size: 1 });
    const nbPages = Math.ceil(result.resultats / sizeByPage);
    return new Array(nbPages).fill(0).map((v, i) => i + 1);
  };

  const getCodesOgr = async () => {
    let codesOgr = [];
    await oleoduc(
      await RomeMetierRepository.findAll({ sort: { code_ogr: 1 } }),
      writeData((metier) => {
        metier.code_ogr && codesOgr.push(metier.code_ogr);
      })
    );
    return codesOgr;
  };
  const codesOgr = await getCodesOgr();

  await oleoduc(
    Readable.from(codesOgr),
    transformData((codeOgr) => {
      return getDepartements().map((departement) => {
        const code = departement.code.substring(0, 2);
        return {
          departement: code,
          code_ogr: codeOgr,
        };
      });
    }),
    flattenArray(),
    transformData(async (data) => {
      const pages = await getPages(data.departement, data.code_ogr).catch((e) => handleError(e, { data }));
      if (!pages) {
        return [];
      }
      return pages.map((page) => ({ ...data, page }));
    }),
    flattenArray(),
    filterData((data) => data.page),
    transformData(
      async ({ departement, code_ogr, page }) => {
        const result = await diagoriente
          .appellationsOgr({ departement: departement, code_ogr, page: page, size: sizeByPage })
          .catch((e) => handleError(e, { page, departement, code_ogr }));
        return result.data;
      },
      { parallel: 5 }
    ),
    flattenArray(),
    transformData((data) => normalizeAppelations(data)),
    writeData(
      async (data) => {
        stats.total++;

        try {
          const res = await upsert(
            metierDepartementales(),
            { code_ogr: `${data.code_ogr_appellation}`, code_naf: `${data.code_naf}`, departement: data.departement },
            {
              $setOnInsert: {
                "_meta.date_import": new Date(),
                "_meta.created_on": new Date(),
                "_meta.updated_on": new Date(),
              },
              $set: omitNil({
                code_rome: data.code_rome,
                title: data.libelle_appellation,
                title_old: data.ancien_nom_appellation,
                provenance: data.provenance,
                isMetierAvenir: data.metier_avenir,
                isMetierEnTension: data.metier_en_tension,
                isTransitionEcologique: data.transition_ecologique,
                isTransitionNumerique: data.transition_numerique,
                isTransitionDemographique: data.transition_demographique,
                isMetierArt: data.metier_art,
                code_ogr: `${data.code_ogr_appellation}`,
                code_naf: `${data.code_naf}`,
                departement: data.departement,
                indiceTensionRecrutement: data.indice_tension_recrutement,
              }),
            }
          );

          if (res.upsertedCount) {
            logger.info(`Métier ${data.libelle_appellation} ajouté`);
            stats.created++;
          } else if (res.modifiedCount) {
            logger.debug(`Métier ${data.libelle_appellation} mis à jour`);
            stats.updated++;
          } else {
            logger.trace(`Métier ${data.libelle_appellation} déjà à jour`);
          }
        } catch (e) {
          logger.error(e, `Impossible d'importer le métier ${data.libelle_appellation}`);
          stats.failed++;
        }
      },
      { parallel: 10 }
    )
  );

  return stats;
}
