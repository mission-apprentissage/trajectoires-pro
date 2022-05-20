import { fetchStream } from "../common/utils/httpUtils.js";
import logger from "../common/logger.js";
import { compose, oleoduc, transformData, writeData } from "oleoduc";
import { parseCsv } from "../common/utils/csvUtils.js";
import { pick } from "lodash-es";
import iconv from "iconv-lite";
import { codesFormations } from "../common/collections/index.js";

async function getTableFromBCN(table) {
  return compose(
    await fetchStream(`https://infocentre.pleiade.education.fr/bcn/index.php/export/CSV?n=${table}&separator=%7C`),
    iconv.decodeStream("iso-8859-1")
  );
}

async function getTable(table, options) {
  let stream = options[table] || (await getTableFromBCN(table));

  return compose(
    stream,
    transformData(
      (data) => {
        return data.toString().replace(/"/g, "'");
      },
      { objectMode: false }
    ),
    parseCsv({ delimiter: "|" })
  );
}

async function loadNiveaux(options) {
  const niveaux = [];
  const table = await getTable("N_NIVEAU_FORMATION_DIPLOME", options);

  for await (const data of table) {
    niveaux.push(pick(data, ["NIVEAU_FORMATION_DIPLOME", "NIVEAU_INTERMINISTERIEL"]));
  }

  return niveaux;
}

async function loadDispositifs(niveaux, options = {}) {
  const dispositifs = [];
  const table = await getTable("N_DISPOSITIF_FORMATION", options);

  for await (const data of table) {
    const niveau = niveaux.find((n) => n.NIVEAU_FORMATION_DIPLOME === data.NIVEAU_FORMATION_DIPLOME);

    dispositifs.push({
      DISPOSITIF_FORMATION: data.DISPOSITIF_FORMATION,
      NIVEAU_INTERMINISTERIEL: niveau?.NIVEAU_INTERMINISTERIEL,
    });
  }

  return dispositifs;
}

const NIVEAUX_LABELS = {
  0: "MENTION COMPLEMENTAIRE",
  1: "MASTER",
  2: "LICENCE",
  3: "BTS",
  4: "BAC",
  5: "CAP",
  6: "DIPLOME NATIONAL DU BREVET",
  7: "PREELEMENTAIRE ET ELEMENTAIRE",
  9: "BREVET D'APTITUDE",
};

async function importCodesFormations(options = {}) {
  const stats = { total: 0, created: 0, updated: 0, failed: 0, missing: 0 };
  const niveaux = await loadNiveaux(options);
  const dispositifs = await loadDispositifs(niveaux, options);
  const mef = await getTable("N_MEF", options);

  await oleoduc(
    mef,
    writeData(async (data) => {
      const codeFormation = data.MEF_STAT_11;
      const found = dispositifs.find((d) => d.DISPOSITIF_FORMATION === data.DISPOSITIF_FORMATION);

      if (!found) {
        logger.error(`Impossible d'importer le code formation ${codeFormation}`);
        stats.missing++;
      }

      try {
        stats.total++;
        const code = found?.NIVEAU_INTERMINISTERIEL;
        const res = await codesFormations().updateOne(
          {
            code_formation: codeFormation,
          },
          {
            $setOnInsert: {
              "_meta.date_import": new Date(),
            },
            $set: {
              code_formation: codeFormation,
              ...(code ? { niveau: { code, diplome: NIVEAUX_LABELS[code] } } : {}),
            },
          },
          { upsert: true }
        );

        stats.updated += res.modifiedCount;
        stats.created += res.upsertedCount;
      } catch (e) {
        logger.error(e, `Impossible d'importer le code formation  ${codeFormation}`);
        stats.failed++;
      }
    })
  );

  return stats;
}

export { importCodesFormations };
