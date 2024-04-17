import React from "react";
import Container from "#/app/components/Container";
import { CardActionArea, Grid, Typography } from "@mui/material";
import Tag from "#/app/components/Tag";
import { fr } from "@codegouvfr/react-dsfr";
import Link from "next/link";
import { Etablissement, Formation, FormationDetail } from "#/types/formation";
import moment from "moment";
import "moment/locale/fr";

function PortesOuvertes({ etablissement }: { etablissement: Etablissement }) {
  const journeesPortesOuvertes = etablissement.journeesPortesOuvertes;
  if (!journeesPortesOuvertes) {
    return <></>;
  }

  // Only details
  if (!journeesPortesOuvertes.dates || journeesPortesOuvertes.dates.length === 0) {
    return (
      <Tag style={{ marginTop: fr.spacing("5v") }} variant="white">
        Portes ouvertes {journeesPortesOuvertes.details}
      </Tag>
    );
  }

  // Date
  // TODO : gérer les détails, les dates à trou, etc...
  let strPortesOuvertes = "";
  moment.locale("fr");
  for (const key in journeesPortesOuvertes.dates) {
    const date = journeesPortesOuvertes.dates[key];
    strPortesOuvertes +=
      (key !== "0" ? ", " : "") + moment(date.from).format("DD MMMM YYYY") + (date.details ? ` ${date.details}` : "");
  }

  return (
    <Tag style={{ marginTop: fr.spacing("5v") }} variant="white">
      Portes ouvertes {strPortesOuvertes}
    </Tag>
  );
}

export function TagApprentissage({ formationDetail }: { formationDetail: FormationDetail }) {
  return (
    formationDetail.voie === "apprentissage" && (
      <Tag variant="yellow" style={{ marginBottom: fr.spacing("3v") }}>
        {formationDetail.voie.toUpperCase()}
      </Tag>
    )
  );
}

export default function FormationCard({
  latitude,
  longitude,
  formation,
}: {
  latitude: number;
  longitude: number;
  formation: Formation;
}) {
  const { formation: formationDetail, etablissement, bcn } = formation;
  const key = `${formationDetail.cfd}-${formationDetail.codeDispositif}-${formationDetail.uai}-${formationDetail.voie}`;

  return (
    <Link href={`/details/${key}?latitude=${latitude}&longitude=${longitude}`}>
      <CardActionArea>
        <Container style={{ border: "1px solid #DDDDDD", borderRadius: "10px" }}>
          <Typography style={{ marginBottom: fr.spacing("3v") }} variant="subtitle2">
            {bcn.libelle_long}
          </Typography>
          <TagApprentissage formationDetail={formationDetail} />
          <Typography style={{ color: "#3A3A3A", fontWeight: 700, marginBottom: fr.spacing("5v") }}>
            {etablissement.libelle}
          </Typography>

          <Grid container>
            <Grid item xs={10}>
              <Typography variant="subtitle2" color={"#000091"}>
                <i style={{ marginRight: fr.spacing("2v") }} className={fr.cx("fr-icon-bus-fill")} />A{" "}
                {(etablissement.distance / 1000).toFixed(2)} km
              </Typography>
              {etablissement.accessTime && (
                <Typography variant="subtitle2" color={"#000091"}>
                  <i style={{ marginRight: fr.spacing("2v") }} className={fr.cx("fr-icon-bus-fill")} />A moins de{" "}
                  {(etablissement.accessTime / 60).toFixed(0)} minutes
                </Typography>
              )}
            </Grid>
            <Grid item xs={2}></Grid>
          </Grid>

          <PortesOuvertes etablissement={etablissement} />
        </Container>
      </CardActionArea>
    </Link>
  );
}
