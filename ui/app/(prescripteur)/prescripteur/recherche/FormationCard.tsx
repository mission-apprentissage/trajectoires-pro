import React from "react";
import { Grid, Stack, Typography } from "@mui/material";
import { fr } from "@codegouvfr/react-dsfr";
import { Formation } from "#/types/formation";
import "moment/locale/fr";
import { TagPortesOuvertes } from "../../components/PortesOuvertes";
import Card from "#/app/components/Card";
import FormationTags from "../../components/FormationTags";
import { useFormationLink } from "../../hooks/useFormationLink";
import { LabelApprentissage } from "../../components/Apprentissage";
import { capitalize } from "lodash-es";

export default function FormationCard({
  latitude,
  longitude,
  formation,
  selected,
  onMouseEnter,
  onMouseLeave,
  tabIndex,
}: {
  latitude: number;
  longitude: number;
  formation: Formation;
  selected: boolean;
  onMouseEnter?: Function;
  onMouseLeave?: Function;
  tabIndex: number;
}) {
  const { formation: formationDetail, etablissement } = formation;
  const formationLink = useFormationLink({
    formation: formationDetail,
    longitude: longitude.toString(),
    latitude: latitude.toString(),
  });

  return (
    <Card
      selected={selected}
      actionProps={{
        onMouseEnter: () => onMouseEnter && onMouseEnter(),
        onMouseLeave: () => onMouseLeave && onMouseLeave(),
      }}
      link={formationLink}
      linkTarget="_blank"
      tabIndex={tabIndex}
    >
      <Typography variant="subtitle2" style={{ lineHeight: "28px" }}>
        {capitalize(formationDetail.libelle)}
      </Typography>
      <Stack spacing={1} style={{ marginBottom: fr.spacing("3v") }}>
        <FormationTags tags={formationDetail.tags} />
        <LabelApprentissage formationDetail={formationDetail} />
      </Stack>

      <Typography variant={"body2"} style={{ color: "#3A3A3A", lineHeight: "24px", marginBottom: fr.spacing("5v") }}>
        {etablissement.libelle}
      </Typography>

      <Grid container>
        <Grid item xs={10}>
          {etablissement.accessTime ? (
            <Typography variant="subtitle2" color={"var(--blue-france-sun-113-625)"}>
              <i style={{ marginRight: fr.spacing("2v") }} className={fr.cx("fr-icon-bus-fill")} />À moins de{" "}
              {(etablissement.accessTime / 60).toFixed(0)} minutes
            </Typography>
          ) : (
            <Typography variant="subtitle2" color={"var(--blue-france-sun-113-625)"}>
              <i style={{ marginRight: fr.spacing("2v") }} className={fr.cx("fr-icon-bus-fill")} />À{" "}
              {(etablissement.distance / 1000).toFixed(2)} km
            </Typography>
          )}
        </Grid>
        <Grid item xs={2}></Grid>
      </Grid>

      <TagPortesOuvertes etablissement={etablissement} />
    </Card>
  );
}
