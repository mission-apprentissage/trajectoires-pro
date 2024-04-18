import React from "react";
import Container from "#/app/components/Container";
import { CardActionArea, Grid, Typography } from "@mui/material";
import Tag from "#/app/components/Tag";
import { fr } from "@codegouvfr/react-dsfr";
import Link from "next/link";
import { Etablissement, Formation, FormationDetail } from "#/types/formation";
import moment from "moment";
import "moment/locale/fr";
import { TagPortesOuvertes } from "./PortesOuvertes";
import Card from "#/app/components/Card";

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
  selected,
  onMouseEnter,
  onMouseLeave,
}: {
  latitude: number;
  longitude: number;
  formation: Formation;
  selected: boolean;
  onMouseEnter?: Function;
  onMouseLeave?: Function;
}) {
  const { formation: formationDetail, etablissement, bcn } = formation;
  const key = `${formationDetail.cfd}-${formationDetail.codeDispositif}-${formationDetail.uai}-${formationDetail.voie}`;

  return (
    <Link href={`/details/${key}?latitude=${latitude}&longitude=${longitude}`}>
      <CardActionArea
        onMouseEnter={() => onMouseEnter && onMouseEnter()}
        onMouseLeave={() => onMouseLeave && onMouseLeave()}
        style={{ ...(selected ? { backgroundColor: "var(--hover)" } : {}) }}
      >
        <Card>
          <Typography style={{ marginBottom: fr.spacing("3v") }} variant="subtitle2">
            {bcn.libelle_long}
          </Typography>
          <TagApprentissage formationDetail={formationDetail} />
          <Typography style={{ color: "#3A3A3A", fontWeight: 700, marginBottom: fr.spacing("5v") }}>
            {etablissement.libelle}
          </Typography>

          <Grid container>
            <Grid item xs={10}>
              {etablissement.accessTime ? (
                <Typography variant="subtitle2" color={"var(--blue-france-sun-113-625)"}>
                  <i style={{ marginRight: fr.spacing("2v") }} className={fr.cx("fr-icon-bus-fill")} />A moins de{" "}
                  {(etablissement.accessTime / 60).toFixed(0)} minutes
                </Typography>
              ) : (
                <Typography variant="subtitle2" color={"var(--blue-france-sun-113-625)"}>
                  <i style={{ marginRight: fr.spacing("2v") }} className={fr.cx("fr-icon-bus-fill")} />A{" "}
                  {(etablissement.distance / 1000).toFixed(2)} km
                </Typography>
              )}
            </Grid>
            <Grid item xs={2}></Grid>
          </Grid>

          <TagPortesOuvertes etablissement={etablissement} />
        </Card>
      </CardActionArea>
    </Link>
  );
}
