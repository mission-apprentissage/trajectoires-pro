import "dotenv/config";
import { program as cli } from "commander";
import { createReadStream, createWriteStream } from "fs";
import { runScript } from "./common/runScript.js";
import { importFormationsStats } from "./jobs/importFormationsStats.js";
import { importCertificationsStats } from "./jobs/importCertificationsStats.js";
import { promiseAllProps } from "./common/utils/asyncUtils.js";
import { InserJeunes } from "./common/InserJeunes.js";
import { migrate } from "./jobs/migrate.js";
import { oleoduc, transformData, transformIntoCSV, writeToStdout } from "oleoduc";
import { exportCodeCertifications } from "./jobs/exportCodeCertifications.js";
import { importBCN } from "./jobs/importBCN.js";
import { parseCsv } from "./common/utils/csvUtils.js";
import { ReferentielApi } from "./common/api/ReferentielApi.js";
import { removeDiacritics } from "./common/utils/stringUtils.js";

function asArray(v) {
  return v.split(",");
}

cli
  .command("importBCN")
  .description("Import les CFD et MEF depuis la BCN")
  .action(() => {
    runScript(() => {
      return importBCN();
    });
  });

cli
  .command("importStats")
  .description("Importe les données statistiques de l'API InserJeunes")
  .argument("[stats]", "Le nom des stats à importer (formations,certifications)", asArray, [
    "certifications",
    "formations",
  ])
  .option("--file", "Un fichier CSV avec la liste des UAI dans une colonne ayant pour nom 'uai'", createReadStream)
  .action((stats, { file }) => {
    runScript(async () => {
      const inserjeunes = new InserJeunes(); //Permet de partager le rate limiter entre les deux imports
      await inserjeunes.login();

      return promiseAllProps({
        ...(stats.includes("formations") ? { formations: importFormationsStats({ input: file, inserjeunes }) } : {}),
        ...(stats.includes("certifications") ? { certifications: importCertificationsStats({ inserjeunes }) } : {}),
      });
    });
  });

cli
  .command("exportCodeCertifications")
  .description("Permet de savoir si des codes certifications sont fermés")
  .option("--out [out]", "Fichier cible dans lequel sera stocké l'export (defaut: stdout)", createWriteStream)
  .action(({ out }) => {
    runScript(async () => {
      const output = out || writeToStdout();

      await exportCodeCertifications(output);
    });
  });

cli
  .command("migrate")
  .description("Execute les scripts de migration")
  .option("--dropIndexes", "Supprime les anciens indexes")
  .action((options) => {
    runScript(() => {
      return migrate(options);
    });
  });

cli
  .command("region")
  .argument("<file>", "Le fichier des établissements", createReadStream)
  .option("--out [out]", "Fichier cible dans lequel sera stocké l'export (defaut: stdout)", createWriteStream)
  .action((file, { out }) => {
    runScript(async () => {
      const referentielApi = new ReferentielApi();
      const output = out || writeToStdout();

      await oleoduc(
        file,
        parseCsv(),
        transformData(
          async (data) => {
            const uai = data["n°UAI de l'établissement"];
            const { organismes } = await referentielApi.searchOrganismes({ uais: uai, uai_potentiels: uai });
            const organisme = organismes.find((o) => o.uai === uai) || organismes[0];
            const region = organisme?.adresse?.region.nom.toUpperCase();

            return {
              uai,
              region: data["Région"],
              référentiel: region || "",
              identique: !region
                ? "Inconnu"
                : removeDiacritics(region) === removeDiacritics(data["Région"])
                ? "Oui"
                : "Non",
            };
          },
          { parallel: 5 }
        ),
        transformIntoCSV(),
        output
      );
    });
  });

cli.parse(process.argv);
