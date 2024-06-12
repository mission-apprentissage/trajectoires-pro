import React from "react";
import Tag from "#/app/components/Tag";
import { fr } from "@codegouvfr/react-dsfr";
import { Etablissement } from "#/types/formation";
import moment from "moment";
import "moment/locale/fr";
import MockDate from "mockdate";

moment.locale("fr");

export function formatPortesOuvertes(etablissement: Etablissement) {
  // TODO: remove after review
  MockDate.set("2024-01-01");
  const journeesPortesOuvertes = etablissement.journeesPortesOuvertes;
  if (!journeesPortesOuvertes) {
    return null;
  }

  // Only details
  if (!journeesPortesOuvertes.dates || journeesPortesOuvertes.dates.length === 0) {
    return {
      ended: false,
      str: `En savoir plus sur les journées portes ouvertes`,
    };
  }

  // Date
  // TODO : gérer les détails, les dates à trou, etc...
  let strPortesOuvertes = "";
  let ended = true;
  let first = true;
  const currentDate = new Date();

  for (const key in journeesPortesOuvertes.dates) {
    const date = journeesPortesOuvertes.dates[key];

    if (date.from > currentDate || date.to > currentDate) {
      ended = false;

      // Period
      if (!moment(date.from).isSame(date.to, "day")) {
        // Day
        strPortesOuvertes +=
          (!first ? ", du " : "Portes ouvertes du ") +
          moment(date.from).format("DD MMMM YYYY") +
          " au " +
          moment(date.to).format("DD MMMM YYYY");
        first = false;
      } else {
        // Day
        strPortesOuvertes += (!first ? ", le " : "Portes ouvertes le ") + moment(date.from).format("DD MMMM YYYY");
        first = false;
      }
    }
  }

  MockDate.reset();
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
