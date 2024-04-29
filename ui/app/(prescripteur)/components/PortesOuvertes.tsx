import React from "react";
import Tag from "#/app/components/Tag";
import { fr } from "@codegouvfr/react-dsfr";
import { Etablissement } from "#/types/formation";
import moment from "moment";
import "moment/locale/fr";

moment.locale("fr");

export function formatPortesOuvertes(etablissement: Etablissement) {
  const journeesPortesOuvertes = etablissement.journeesPortesOuvertes;
  if (!journeesPortesOuvertes) {
    return null;
  }

  // Only details
  if (!journeesPortesOuvertes.dates || journeesPortesOuvertes.dates.length === 0) {
    return {
      ended: false,
      str: `Portes ouvertes le ${journeesPortesOuvertes.details}`,
    };
  }

  // Date
  // TODO : gérer les détails, les dates à trou, etc...
  // TODO: porte ouverte deja passé
  let strPortesOuvertes = "";
  let ended = true;
  let first = true;
  const currentDate = new Date();

  for (const key in journeesPortesOuvertes.dates) {
    const date = journeesPortesOuvertes.dates[key];

    if (date.from > currentDate || date.to > currentDate) {
      ended = false;
      strPortesOuvertes +=
        (!first ? ", " : "Portes ouvertes ") +
        moment(date.from).format("DD MMMM YYYY") +
        (date.details ? ` ${date.details}` : "");
      first = false;
    }
  }

  return {
    ended,
    str: ended ? `Portes ouvertes déjà passées` : `${strPortesOuvertes}`,
  };
}

export function TagPortesOuvertes({ etablissement }: { etablissement: Etablissement }) {
  const strPortesOuvertes = formatPortesOuvertes(etablissement);
  if (!strPortesOuvertes) {
    return <></>;
  }

  return (
    <Tag style={{ marginTop: fr.spacing("5v") }} variant={strPortesOuvertes.ended ? "grey" : "white"}>
      {strPortesOuvertes.str}
    </Tag>
  );
}
