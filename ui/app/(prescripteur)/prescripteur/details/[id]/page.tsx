"use client";
import React, { Suspense, useMemo } from "react";
import { css } from "@emotion/css";
import { CardActionArea, Stack, useTheme } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Typography, Grid } from "#/app/components/MaterialUINext";
import Container from "#/app/components/Container";
import { getDistance } from "geolib";
import { formation } from "#/app/api/exposition/formation/query";
import { formationRoute } from "#/app/api/exposition/formation/route/query";
import Loader from "#/app/components/Loader";
import { fr } from "@codegouvfr/react-dsfr";
import { useSearchParams } from "next/navigation";
import { Etablissement, Formation, FormationDetail, FormationVoie } from "#/types/formation";
import Divider from "#/app/components/Divider";
import Card from "#/app/components/Card";
import PortesOuvertesHeader from "./PortesOuvertesHeader";
import WidgetInserJeunes from "#/app/(prescripteur)/components/WidgetInserJeunes";
import FormationResume from "./FormationResume";
import WidgetSiriusEtablissement from "#/app/(prescripteur)/components/WidgetSiriusEtablissement";
import { TagStatut, TagDuree } from "#/app/components/Tag";
import { TagApprentissage } from "../../FormationCard";
import { useSize } from "#/app/(prescripteur)/hooks/useSize";
import DialogMinistage, { modalMinistage } from "#/app/(prescripteur)/components/DialogMinistage";
import useGetFormations from "#/app/(prescripteur)/hooks/useGetFormations";
import moment from "moment";

function FormationDisponible({ formation }: { formation: FormationDetail }) {
  const { isLoading, formations } = useGetFormations({
    cfds: [formation.cfd],
    uais: [formation.uai],
  });
  const formationAutreVoie =
    formation.voie === FormationVoie.SCOLAIRE ? FormationVoie.APPRENTISSAGE : FormationVoie.SCOLAIRE;

  if (isLoading) {
    return <Loader />;
  }

  return (
    formations.find(({ formation: f }) => f.voie === formationAutreVoie) && (
      <Typography
        variant={"body2"}
        style={{
          borderLeft: "4px solid #6A6AF4",
          marginTop: fr.spacing("14v"),
          marginLeft: fr.spacing("8v"),
          paddingLeft: fr.spacing("8v"),
        }}
      >
        {formation.voie === FormationVoie.APPRENTISSAGE ? (
          <>Cette formation est aussi disponible en voie scolaire, sans présence en entreprise.</>
        ) : (
          <>Cette formation est aussi disponible en alternance.</>
        )}
      </Typography>
    )
  );
}

function FormationRoute({
  etablissement,
  longitude,
  latitude,
}: {
  etablissement: Etablissement;
  longitude?: string | null;
  latitude?: string | null;
}) {
  const address =
    etablissement.address.street + ", " + etablissement.address.postCode + " " + etablissement.address.city;

  const distance = useMemo(() => {
    if (!latitude || !longitude) {
      return null;
    }

    return getDistance(
      { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
      {
        latitude: etablissement.coordinate.coordinates[1],
        longitude: etablissement.coordinate.coordinates[0],
      },
      0.01
    );
  }, [longitude, latitude, etablissement.coordinate.coordinates]);

  const { isLoading, isError, data } = useQuery({
    staleTime: Infinity,
    cacheTime: Infinity,
    retry: 0,
    queryKey: [
      "formation",
      latitude,
      longitude,
      etablissement.coordinate.coordinates[1],
      etablissement.coordinate.coordinates[0],
    ],
    queryFn: ({ signal }) => {
      if (!latitude || !longitude) {
        return null;
      }

      return formationRoute(
        {
          latitudeA: latitude,
          longitudeA: longitude,
          latitudeB: etablissement.coordinate.coordinates[1],
          longitudeB: etablissement.coordinate.coordinates[0],
        },
        { signal }
      );
    },
  });

  const timeRoute = useMemo(() => {
    if (!data?.paths) {
      return null;
    }

    const legs = data.paths[0].legs;
    const departure = moment(legs[0].departure_time);
    const arrival = moment(legs[legs.length - 1].arrival_time);
    return arrival.diff(departure);
  }, data);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <Typography
        variant="subtitle2"
        style={{ color: "var(--blue-france-sun-113-625)", marginBottom: fr.spacing("3v") }}
      >
        {timeRoute !== null && (
          <>
            <i className={fr.cx("fr-icon-bus-fill")} style={{ marginRight: fr.spacing("1w") }} />A{" "}
            {(timeRoute / 1000 / 60).toFixed(0)} minutes
          </>
        )}
        {!data?.paths && distance !== null && (
          <>
            <i className={fr.cx("fr-icon-bus-fill")} style={{ marginRight: fr.spacing("1w") }} />A{" "}
            {(distance / 1000).toFixed(2)} km
          </>
        )}

        <a
          style={{ marginLeft: fr.spacing("3v") }}
          href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
            latitude + "," + longitude
          )}&destination=${encodeURIComponent(address)}&travelmode=transit`}
          target="_blank"
        >
          Voir le trajet
        </a>
      </Typography>
    </>
  );
}

function FormationDetails({ formation: { formation, etablissement, bcn } }: { formation: Formation }) {
  const searchParams = useSearchParams();
  const longitude = searchParams.get("longitude");
  const latitude = searchParams.get("latitude");

  const theme = useTheme();

  const refHeader = React.useRef<HTMLElement>(null);
  const stickyHeaderSize = useSize(refHeader);

  return (
    <Container style={{ marginTop: fr.spacing("5v") }} maxWidth={"xl"}>
      <Grid container>
        <Grid item xs={12}>
          <PortesOuvertesHeader etablissement={etablissement} />
        </Grid>
        <Grid
          item
          xs={12}
          className={css`
            top: 0;
            position: sticky;
            background-color: #fff;
            z-index: 100;
          `}
          style={{ paddingLeft: fr.spacing("5v") }}
        >
          <Typography ref={refHeader} variant="h1" style={{ marginBottom: fr.spacing("3v") }}>
            {bcn.libelle_long}
          </Typography>
        </Grid>
        <Grid
          item
          xs={12}
          className={css`
            ${theme.breakpoints.up("md")} {
              top: ${stickyHeaderSize ? `calc(${stickyHeaderSize.height}px + ${fr.spacing("3v")})` : 0};
              position: sticky;
            }
            background-color: #fff;
            z-index: 99;
          `}
        >
          <Grid container>
            <Grid item xs={12} style={{ paddingLeft: fr.spacing("5v"), marginBottom: fr.spacing("3v") }}>
              <Stack spacing={1} direction={"row"}>
                {etablissement.statut && <TagStatut square>{etablissement.statut.toUpperCase()}</TagStatut>}
                {formation.duree && <TagDuree square>{`En ${formation.duree}`.toUpperCase()}</TagDuree>}
                <TagApprentissage formationDetail={formation} />
              </Stack>
            </Grid>
            <Grid item xs={12} style={{ paddingLeft: fr.spacing("5v") }}>
              <Typography variant="h5" style={{ marginBottom: fr.spacing("3v") }}>
                <i className={fr.cx("fr-icon-map-pin-2-line")} style={{ marginRight: fr.spacing("1w") }} />
                {etablissement.libelle}
                {etablissement.url && (
                  <a style={{ marginLeft: fr.spacing("3v") }} href={etablissement.url} target="_blank"></a>
                )}
              </Typography>
            </Grid>
            <Grid item xs={12} style={{ paddingLeft: fr.spacing("5v"), marginBottom: fr.spacing("5v") }}>
              <Grid container>
                <Grid item xs={12} md={6}>
                  <FormationRoute etablissement={etablissement} latitude={latitude} longitude={longitude} />
                  <FormationDisponible formation={formation} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card actionProps={modalMinistage.buttonProps} style={{ marginBottom: fr.spacing("8v") }}>
                    <Typography variant="subtitle2" style={{ color: "var(--blue-france-sun-113-625-hover)" }}>
                      <i className={fr.cx("fr-icon-calendar-2-line")} style={{ marginRight: fr.spacing("1w") }} />
                      Pensez aux visites et ministages
                    </Typography>
                  </Card>

                  {/* <Card>
                    <Typography variant="subtitle2" style={{ color: "var(--blue-france-sun-113-625)" }}>
                      <i className={fr.cx("ri-profile-line")} style={{ marginRight: fr.spacing("1w") }} />
                      Voir sur le site d’affectation (Affelnet)
                    </Typography>
                  </Card> */}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid
          item
          md={12}
          className={css`
            ${theme.breakpoints.up("md")} {
              position: sticky;
              top: ${stickyHeaderSize ? `calc(${stickyHeaderSize.height}px + ${fr.spacing("3v")})` : 0};
              z-index: 100;
            }
            background-color: #fff;
          `}
        >
          <Divider variant="middle" style={{ marginTop: 0, marginBottom: 0 }} />
          <FormationResume etablissement={etablissement} formation={formation} />
          <Divider
            variant="middle"
            style={{
              marginBottom: 0,
            }}
          />
        </Grid>
        <Grid item xs={12} style={{ backgroundColor: "#fff", zIndex: 99 }}>
          <Grid container>
            <Grid item xs={12} style={{ marginTop: fr.spacing("5v") }}>
              <Card title="À quoi ressemble une journée ?">
                {formation.voie === "apprentissage" && <WidgetSiriusEtablissement etablissement={etablissement} />}
              </Card>
            </Grid>
            <Grid item xs={12} style={{ marginTop: fr.spacing("5v") }}>
              <Card title="À quoi ressemble la vie en sortie de cette formation ?">
                <Typography align="center" style={{ color: "var(--blue-france-sun-113-625)" }} variant="h6">
                  Les élèves 6 mois après la formation
                </Typography>
                <WidgetInserJeunes etablissement={etablissement} formation={formation} />
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <DialogMinistage />
    </Container>
  );
}

function ResearchFormationResult({ id }: { id: string }) {
  const { isLoading, isError, data } = useQuery({
    staleTime: Infinity,
    cacheTime: Infinity,
    retry: 0,
    queryKey: ["formation", id],
    queryFn: ({ signal }) => {
      return formation({ id: id }, { signal });
    },
  });

  if (isLoading) {
    return <Loader withMargin />;
  }

  if (isError || !data) {
    return <>Formation not found</>;
  }

  return <FormationDetails formation={data} />;
}

export default function Page({ params }: { params: { id: string } }) {
  return (
    <>
      <Suspense>
        <ResearchFormationResult id={params.id} />
      </Suspense>
    </>
  );
}
