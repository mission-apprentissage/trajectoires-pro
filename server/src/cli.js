import "dotenv/config";
import { program as cli } from "commander";
import { createWriteStream } from "fs";
import passwordPrompt from "@inquirer/password";
import { runScript } from "./common/runScript.js";
import { writeToStdout } from "oleoduc";
import { exportCodeCertifications } from "./jobs/exportCodeCertifications.js";
import { importBCN } from "./jobs/bcn/importBCN.js";
import { importBCNMEF } from "./jobs/bcn/importBCNMEF.js";
import { importBCNContinuum } from "./jobs/bcn/importBCNContinuum.js";
import { computeBCNMEFContinuum } from "./jobs/bcn/computeBCNMEFContinuum.js";
import { importLibelle } from "./jobs/bcn/importLibelle.js";
import { importStats } from "./jobs/stats/importStats.js";
import { importCfdRomes } from "./jobs/romes/importCfdRomes.js";
import { importRomes } from "./jobs/romes/importRomes.js";
import { importCfdMetiers } from "./jobs/romes/importCfdMetiers.js";
import { importRomeMetiers } from "./jobs/romes/importRomeMetiers.js";
import { importEtablissements } from "./jobs/etablissements/importEtablissements.js";
import { backfillMetrics } from "./jobs/backfillMetrics.js";
import { asArray } from "./common/utils/stringUtils.js";
import { computeContinuumStats } from "./jobs/stats/computeContinuumStats.js";
import * as UserJob from "./jobs/user/user.js";

cli
  .command("importBCN")
  .description("Import les CFD et MEF depuis la BCN")
  .action(() => {
    runScript(async () => {
      const statsBCN = await importBCN();
      const statsMef = await importBCNMEF();
      const statsContinuum = await importBCNContinuum();
      const statsMefContinuum = await computeBCNMEFContinuum();
      const statsBCNLibelle = await importLibelle();

      return {
        statsBCN,
        statsMef,
        statsContinuum,
        statsMefContinuum,
        statsBCNLibelle,
      };
    });
  });

cli
  .command("importRomes")
  .description("Import les codes ROME depuis Data.gouv et Diagoriente")
  .action(() => {
    runScript(async () => {
      const statsRomes = await importRomes();
      const statsCfdRomes = await importCfdRomes();
      const statsRomeMetiers = await importRomeMetiers();
      const statsCfdMetiers = await importCfdMetiers();

      return {
        statsRomes,
        statsCfdRomes,
        statsRomeMetiers,
        statsCfdMetiers,
      };
    });
  });

cli
  .command("importEtablissements")
  .description("Importe les données d'établissements")
  .action(() => {
    runScript(async () => {
      const statsEtablissements = await importEtablissements();

      return {
        statsEtablissements,
      };
    });
  });

cli
  .command("importStats")
  .description("Importe les données statistiques de l'API InserJeunes")
  .argument("[stats]", "Le nom des stats à importer (formations,certifications,regionales)", asArray)
  .action((stats) => {
    runScript(() => {
      return importStats({ stats });
    });
  });

cli
  .command("computeContinuumStats")
  .description("Calcule les données statistiques manquantes pour les anciens/nouveaux diplomes")
  .argument("[stats]", "Le nom des stats à importer (formations,certifications,regionales)", asArray)
  .action((stats) => {
    runScript(() => {
      return computeContinuumStats({ stats });
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
  .command("backfillMetrics")
  .description("Backfill les metrics (champs codes_certifications et regions)")
  .action((options) => {
    runScript(() => {
      return backfillMetrics(options);
    });
  });

const user = cli.command("user").description("Gestion des utilisateurs");
user
  .command("create")
  .description("Créer un utilisateur")
  .argument("username", "Nom d'utilisateur")
  .action((username) => {
    runScript(
      async () => {
        const password = await passwordPrompt({ message: "Entrer votre mot de passe" });
        const passwordRepeat = await passwordPrompt({ message: "Entrer votre mot de passe de nouveau" });
        return await UserJob.create({ username, password, passwordRepeat });
      },
      { withTimer: false }
    );
  });
user
  .command("remove")
  .description("Supprime un utilisateur")
  .argument("username", "Nom d'utilisateur")
  .action((username) => {
    runScript(() => UserJob.remove({ username }), { withTimer: false });
  });

cli.parse(process.argv);
