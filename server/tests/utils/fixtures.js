import { readFile } from "node:fs/promises";

async function readJson(path) {
  const fileUrl = new URL(path, import.meta.url);
  const json = JSON.parse(await readFile(fileUrl, "utf8"));
  return json;
}

export async function FormationsCatalogue() {
  return readJson("../fixtures/files/catalogueApprentissage/formations.json");
}

export async function EtablissementsCatalogue() {
  return readJson("../fixtures/files/catalogueApprentissage/etablissements.json");
}

export async function EtablissementCatalogue() {
  return readJson("../fixtures/files/catalogueApprentissage/etablissement.json");
}

export async function EtablissementsInserSup() {
  return readJson("../fixtures/files/inserSup/etablissements.json");
}

export async function FormationsInserSup(twoMillesimes = false) {
  if (twoMillesimes) {
    return readJson("../fixtures/files/inserSup/formationsTwoMillesimes.json");
  }

  return readJson("../fixtures/files/inserSup/formations.json");
}

export async function FormationsInserSupInvalid() {
  return readJson("../fixtures/files/inserSup/formationsInvalid.json");
}
