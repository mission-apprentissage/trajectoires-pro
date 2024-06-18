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
import { importStats, importSupStats } from "./jobs/stats/importStats.js";
import { importCfdRomes } from "./jobs/romes/importCfdRomes.js";
import { importRomes } from "./jobs/romes/importRomes.js";
import { importCfdMetiers } from "./jobs/romes/importCfdMetiers.js";
import { importRomeMetiers } from "./jobs/romes/importRomeMetiers.js";
import { importACCEEtablissements } from "./jobs/etablissements/importACCEEtablissements.js";
import { importEtablissements } from "./jobs/etablissements/importEtablissements.js";
import { importFormations as importCAFormations } from "./jobs/catalogueApprentissage/importFormations.js";
import { importFormationEtablissement } from "./jobs/formations/importFormationEtablissement.js";
import { importOnisep } from "./jobs/onisep/importOnisep.js";
import { backfillMetrics } from "./jobs/backfillMetrics.js";
import { asArray } from "./common/utils/stringUtils.js";
import { computeContinuumStats } from "./jobs/stats/computeContinuumStats.js";
import { computeUAI } from "./jobs/stats/computeUAI.js";
import * as UserJob from "./jobs/user/user.js";
import { importBCNSise } from "./jobs/bcn/importBCNSise.js";
import { importIndicateurEntree } from "./jobs/formations/importIndicateurEntree.js";
import { computeFormationTag } from "./jobs/formations/tag/computeFormationTag.js";

async function importBCNCommand() {
  const statsBCN = await importBCN();
  const statsMef = await importBCNMEF();
  const statsSise = await importBCNSise();
  const statsContinuum = await importBCNContinuum();
  const statsMefContinuum = await computeBCNMEFContinuum();
  const statsBCNLibelle = await importLibelle();

  return {
    statsBCN,
    statsMef,
    statsSise,
    statsContinuum,
    statsMefContinuum,
    statsBCNLibelle,
  };
}

async function importRomesCommand() {
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
}

async function importOnisepCommand() {
  return {
    importTablePassage: await importOnisep("tablePassageCodesCertifications", ["certif_info_ci_identifiant"]),
    importFormationsLycee: await importOnisep("ideoActionsFormationInitialeUniversLycee", [
      "action_de_formation_af_identifiant_onisep",
      "ens_code_uai",
    ]),
    importStructuresSecondaire: await importOnisep("ideoStructuresEnseignementSecondaire", ["code_uai"]),
    importFormationsInitiales: await importOnisep("ideoFormationsInitiales", ["url_et_id_onisep", "duree"]),
  };
}

cli
  .command("importBCN")
  .description("Import les CFD et MEF depuis la BCN")
  .action(() => {
    runScript(importBCNCommand);
  });

cli
  .command("importOnisep")
  .description("Importe les données de l'onisep")
  .action(() => {
    runScript(importOnisepCommand);
  });

cli
  .command("importRomes")
  .description("Import les codes ROME depuis Data.gouv et Diagoriente")
  .action(() => {
    runScript(importRomesCommand);
  });

cli
  .command("importEtablissements")
  .description("Importe les données d'établissements")
  .action(() => {
    runScript(async () => {
      return {
        importACCEEtablissements: await importACCEEtablissements(),
        importEtablissements: await importEtablissements(),
      };
    });
  });

cli
  .command("importCatalogueApprentissage")
  .description("Importe les données du catalogue de l'apprentissage")
  .action(() => {
    runScript(importCAFormations);
  });

cli
  .command("importFormationEtablissement")
  .description("Importe les formations dans les établissements")
  .action(() => {
    runScript(async () => {
      return {
        importFormationEtablissement: await importFormationEtablissement(),
        importIndicateurEntree: await importIndicateurEntree(),
        computeFormationTag: await computeFormationTag(),
      };
    });
  });

cli
  .command("importStats")
  .description("Importe les données statistiques de l'API InserJeunes")
  .argument("[stats]", "Le nom des stats à importer (formations,certifications,regionales)", asArray)
  .option(
    "--millesime [millesime]",
    "Spécifie un millésime à importer (attention les millésimes nationales et formations/regionales sont différents"
  )
  .action((stats, options) => {
    runScript(() => {
      const millesimes = options.millesime ? [options.millesime] : null;
      return importStats({ stats, millesimes });
    });
  });

cli
  .command("importSupStats")
  .description("Importe les données statistiques de l'API InserSup")
  .argument("[stats]", "Le nom des stats à importer (formations)", asArray)
  .option(
    "--millesime [millesime]",
    "Spécifie un millésime à importer (attention les millésimes nationales et formations/regionales sont différents"
  )
  .action((stats, options) => {
    runScript(() => {
      const millesimes = options.millesime ? [options.millesime] : null;
      return importSupStats({ stats, millesimes });
    });
  });

cli
  .command("computeContinuumStats")
  .description("Calcule les données statistiques manquantes pour les anciens/nouveaux diplomes")
  .argument("[stats]", "Le nom des stats à importer (formations,certifications,regionales)", asArray)
  .action((stats) => {
    runScript(() => computeContinuumStats({ stats }));
  });

cli
  .command("computeUAI")
  .description("Associe les UAIs gestionnaires, formateurs et lieux de formation aux stats de formations")
  .option("--millesime [millesime]", "Spécifie un millésime à importer")
  .action((options) => {
    runScript(() => computeUAI({ millesime: options.millesime }));
  });

cli
  .command("importAll")
  .description("Effectue toute les taches d'importations et de calculs des données")
  .action(() => {
    runScript(async () => {
      return {
        importBCN: await importBCNCommand(),
        importOnisep: await importOnisepCommand(),
        importEtablissements: await importEtablissements(),
        importStats: await importStats(),
        importSupStats: await importSupStats(),
        computeContinuumStats: await computeContinuumStats(),
        importCatalogueApprentissage: await importCAFormations(),
        computeUAI: await computeUAI(),
        importRomes: await importRomesCommand(),
        importFormationEtablissement: await importFormationEtablissement(),
      };
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
