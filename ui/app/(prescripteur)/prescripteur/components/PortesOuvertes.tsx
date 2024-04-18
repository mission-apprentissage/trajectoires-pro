import React from "react";
import Container from "#/app/components/Container";
import { CardActionArea, Grid, Typography } from "@mui/material";
import Tag from "#/app/components/Tag";
import { fr } from "@codegouvfr/react-dsfr";
import Link from "next/link";
import { Etablissement, Formation, FormationDetail } from "#/types/formation";
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
      str: `Portes ouvertes ${journeesPortesOuvertes.details}`,
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
