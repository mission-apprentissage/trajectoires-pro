"use client";
import React, { Suspense, useMemo } from "react";
import { css } from "@emotion/css";
import { useQuery } from "@tanstack/react-query";
import { Typography, Grid } from "#/app/components/MaterialUINext";
import Container from "#/app/components/Container";
import { getDistance } from "geolib";
import { formation } from "#/app/api/exposition/formation/query";
import Loader from "#/app/components/Loader";
import { fr } from "@codegouvfr/react-dsfr";
import { useSearchParams } from "next/navigation";
import useResizeObserver from "@react-hook/resize-observer";
import { Formation } from "#/types/formation";
import Divider from "#/app/components/Divider";
import Card from "#/app/components/Card";
import PortesOuvertesHeader from "./PortesOuvertesHeader";
import WidgetInserJeunes from "#/app/(prescripteur)/components/WidgetInserJeunes";
import FormationResume from "./FormationResume";

const useSize = (target: React.RefObject<HTMLElement>) => {
  const [size, setSize] = React.useState<DOMRect>();

  React.useLayoutEffect(() => {
    target.current && setSize(target.current.getBoundingClientRect());
  }, [target]);

  // Where the magic happens
  useResizeObserver(target, (entry) => setSize(entry.contentRect));
  return size;
};

function FormationDetails({ formation: { formation, etablissement, bcn } }: { formation: Formation }) {
  const searchParams = useSearchParams();
  const longitude = searchParams.get("longitude");
  const latitude = searchParams.get("latitude");

  const refHeader = React.useRef<HTMLElement>(null);
  const stickyHeaderSize = useSize(refHeader);

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

  const address =
    etablissement.address.street + ", " + etablissement.address.postCode + " " + etablissement.address.city;

  return (
    <Container style={{ marginTop: fr.spacing("5v") }} maxWidth={"xl"}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <PortesOuvertesHeader etablissement={etablissement} />
        </Grid>
        <Grid
          item
          xs={12}
          className={css`
            top: -${stickyHeaderSize ? stickyHeaderSize.height : 0}px;
            position: sticky;
          `}
        >
          <Container maxWidth={false}>
            <Typography
              className={css`
                top: 0;
                position: sticky;
                background-color: #fff;
                z-index: 10;
              `}
              ref={refHeader}
              variant="h1"
              style={{ marginBottom: fr.spacing("3v") }}
            >
              {bcn.libelle_long}
            </Typography>
            <Typography variant="h5" style={{ marginBottom: fr.spacing("3v") }}>
              <i className={fr.cx("fr-icon-map-pin-2-line")} style={{ marginRight: fr.spacing("1w") }} />
              {etablissement.libelle}
              {etablissement?.onisep?.id ? (
                <a
                  style={{ marginLeft: fr.spacing("3v") }}
                  href={`https://www.onisep.fr/http/redirection/etablissement/slug/${etablissement.onisep.id}`}
                  target="_blank"
                ></a>
              ) : null}
            </Typography>
            {distance !== null && (
              <Typography
                variant="subtitle2"
                style={{ color: "var(--blue-france-sun-113-625)", marginBottom: fr.spacing("3v") }}
              >
                <i className={fr.cx("fr-icon-bus-fill")} style={{ marginRight: fr.spacing("1w") }} />A{" "}
                {(distance / 1000).toFixed(2)} km
                <a
                  style={{ marginLeft: fr.spacing("3v") }}
                  href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
                    latitude + "," + longitude
                  )}&destination=${encodeURIComponent(address)}`}
                  target="_blank"
                >
                  Voir le trajet
                </a>
              </Typography>
            )}
          </Container>
        </Grid>

        <Grid
          item
          md={12}
          className={css`
            top: ${stickyHeaderSize ? stickyHeaderSize.height : 0}px;
            position: sticky;
            background-color: #fff;
            padding-bottom: 5px;
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
        <Grid item md={12}>
          <Card title="À quoi ressemble une journée ?"></Card>
        </Grid>
        <Grid item md={12}>
          <Card title="À quoi ressemble la vie en sortie de cette formation ?">
            <Typography align="center" style={{ color: "var(--blue-france-sun-113-625)" }} variant="h6">
              Les élèves 6 mois après la formation
            </Typography>
            <WidgetInserJeunes etablissement={etablissement} formation={formation} />
          </Card>
        </Grid>
      </Grid>
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
    return <Loader />;
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
