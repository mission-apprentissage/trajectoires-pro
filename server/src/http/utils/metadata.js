export const getMetadata = (type, stats) => {
  const { code_certification, filiere, uai, millesime, diplome } = stats;
  return {
    title: `${type} ${code_certification}${uai ? ` ${uai}` : ""}`,
    description: `Données InserJeunes pour la ${type} ${code_certification} (${diplome.libelle} filière ${filiere})${
      uai ? ` dispensée par l'établissement ${uai},` : ""
    } pour le millesime ${millesime}`,
  };
};
