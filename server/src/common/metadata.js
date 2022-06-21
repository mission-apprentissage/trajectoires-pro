const getMetadataCertifications = (statsList) => {
  const result = statsList.reduce(
    (acc, { code_certification, diplome, filiere }, index) => {
      acc.title = `${acc.title}${index === 0 ? " " : ", "}${code_certification}`;
      acc.description = `${acc.description}${index === 0 ? " " : ", "}${code_certification} - ${
        diplome.libelle
      } filière ${filiere}`;
      return acc;
    },
    {
      ...statsList[0]._meta,
      title: "Certifications:",
      description: `Données InserJeunes du millesime ${statsList[0].millesime} aggrégées pour les certifications (maille nationale):`,
    }
  );
  result.description = `${result.description}. Date d'import: ${new Date(
    statsList[0]._meta.date_import
  ).toLocaleDateString("fr-FR")}.`;
  return result;
};

export const getMetadata = (type, stats) => {
  if (type === "certifications") {
    return getMetadataCertifications(stats);
  }

  const { code_certification, filiere, uai, millesime, diplome, _meta } = stats;
  return {
    title: `${type} ${code_certification}${uai ? `, établissement ${uai}` : ""}`,
    description: `Données InserJeunes pour la ${type}${
      type === "certification" ? " (maille nationale)" : " (maille établissement)"
    } ${code_certification} - ${diplome.libelle} filière ${filiere} ${
      uai ? ` dispensée par l'établissement ${uai},` : ""
    } pour le millesime ${millesime}. Date d'import ${new Date(_meta.date_import).toLocaleDateString("fr-FR")}.`,
  };
};
