export function buildDescription(stats) {
  const { code_certification, filiere, uai, millesime, diplome } = stats;
  return {
    titre: `Certification ${code_certification}${uai ? `, établissement ${uai}` : ""}`,
    details:
      `Données InserJeunes pour la certification ${code_certification} (${diplome.libelle} filière ${filiere})` +
      `${uai ? ` dispensée par l'établissement ${uai},` : ""} pour le millesime ${millesime}`,
  };
}
