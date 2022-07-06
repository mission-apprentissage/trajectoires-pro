const getMetadataCertifications = (statsArray) => {
  return statsArray.reduce(
    (acc, { code_certification, diplome, filiere }, index) => {
      acc.title = `${acc.title}${index === 0 ? " " : ", "}${code_certification}`;
      acc.description = `${acc.description}${index === 0 ? " " : ", "}${code_certification} (${
        diplome.libelle
      } filière ${filiere})`;
      return acc;
    },
    {
      title: "Certifications:",
      description: `Données InserJeunes du millesime ${statsArray[0].millesime} aggrégées pour les certifications:`,
    }
  );
};

export const getMetadata = (type, statsArray) => {
  if (statsArray.length === 0) {
    return null;
  }

  if (type === "certifications") {
    return getMetadataCertifications(statsArray);
  }

  const { code_certification, filiere, uai, millesime, diplome } = statsArray;
  return {
    title: `${type} ${code_certification}${uai ? `, établissement ${uai}` : ""}`,
    description: `Données InserJeunes pour la ${type} ${code_certification} (${diplome.libelle} filière ${filiere})${
      uai ? ` dispensée par l'établissement ${uai},` : ""
    } pour le millesime ${millesime}`,
  };
};
