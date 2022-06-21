const getMetadataCertifications = (statsList) => {
  return statsList.reduce(
    (acc, { code_certification, diplome, filiere }, index) => {
      acc.title = `${acc.title}${index === 0 ? " " : ", "}${code_certification}`;
      acc.description = `${acc.description}${index === 0 ? " " : ", "}${code_certification} (${
        diplome.libelle
      } filière ${filiere})`;
      return acc;
    },
    {
      title: "Certifications:",
      description: `Données InserJeunes du millesime ${statsList[0].millesime} aggrégées pour les certifications:`,
    }
  );
};

export const getMetadata = (type, stats) => {
  if (type === "certifications") {
    return getMetadataCertifications(stats);
  }

  const { code_certification, filiere, uai, millesime, diplome } = stats;
  return {
    title: `${type} ${code_certification}${uai ? `, établissement ${uai}` : ""}`,
    description: `Données InserJeunes pour la ${type} ${code_certification} (${diplome.libelle} filière ${filiere})${
      uai ? ` dispensée par l'établissement ${uai},` : ""
    } pour le millesime ${millesime}`,
  };
};
