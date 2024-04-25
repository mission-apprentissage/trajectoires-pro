"use client";
import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Typograhpy, Grid, Box } from "#/app/components/MaterialUINext";
import Container from "#/app/components/Container";
import { getDistance } from "geolib";
import { formation } from "#/app/api/exposition/formation/query";
import Loader from "#/app/components/Loader";
import { fr } from "@codegouvfr/react-dsfr";
import { useSearchParams } from "next/navigation";
import { Etablissement, Formation, FormationDetail } from "#/types/formation";
import { TagApprentissage } from "../../../components/FormationCard";
import Divider from "#/app/components/Divider";
import Card from "#/app/components/Card";
import EtablissementCard from "../../../components/EtablissementCard";

function WidgetInserJeunes({ etablissement, formation }: { etablissement: Etablissement; formation: FormationDetail }) {
  const WIDGET_HASH = process.env.NEXT_PUBLIC_EXPOSITION_WIDGET_HASH;
  const API_URL = process.env.NEXT_PUBLIC_EXPOSITION_API_BASE_URL || "";
  const HOST = API_URL.split("/").slice(0, 3).join("/");

  const code = formation.voie === "apprentissage" ? formation.cfd : formation.mef11;

  const widgetCode = `<iframe onLoad="!function(i){window.addEventListener('message',function(t){'${HOST}'!==t.origin||isNaN(t.data)||(i.style.height=t.data+'px')},!1)}(this);" style="width: 100%; height: 0;" 
  src="${API_URL}/inserjeunes/formations/${etablissement.uai}-${code}/widget/${WIDGET_HASH}?noTitle=true&responsiveWidth=28em"
   scrolling="no" frameBorder="0"></iframe>`;

  return (
    <>
      <Typograhpy align="center" style={{ color: "var(--blue-france-sun-113-625)" }} variant="h6">
        Les élèves 6 mois après la formation
      </Typograhpy>
      <div dangerouslySetInnerHTML={{ __html: widgetCode }}></div>
    </>
  );
}

function FormationResult({ formation: { formation, etablissement, bcn } }: { formation: Formation }) {
  const searchParams = useSearchParams();
  const longitude = searchParams.get("longitude");
  const latitude = searchParams.get("latitude");

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
        <Grid item md={7}>
          <Typograhpy variant="h4" style={{ marginBottom: fr.spacing("3v") }}>
            {bcn.libelle_long}
          </Typograhpy>
          {distance !== null && (
            <Grid container>
              <Grid item xs={6}>
                <Typograhpy
                  variant="subtitle2"
                  style={{ color: "var(--blue-france-sun-113-625)", marginBottom: fr.spacing("3v") }}
                >
                  <i className={fr.cx("fr-icon-bus-fill")} style={{ marginRight: fr.spacing("1w") }} />A{" "}
                  {(distance / 1000).toFixed(2)} km
                </Typograhpy>
              </Grid>
              <Grid item xs={6}>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
                    latitude + "," + longitude
                  )}&destination=${encodeURIComponent(address)}`}
                  target="_blank"
                >
                  Voir le trajet
                </a>
              </Grid>
              {/* TODO: AJOUTER TEMPS DE TRAJET */}
            </Grid>
          )}
          <Box>
            <TagApprentissage formationDetail={formation} />
          </Box>
        </Grid>
        <Grid item md={5}>
          <EtablissementCard etablissement={etablissement} />
        </Grid>
      </Grid>
      <Divider variant="middle" />
      <Grid container spacing={3}>
        <Grid item md={7}>
          <Card title="À quoi ressemble une journée ?"></Card>
        </Grid>
        <Grid item md={5}>
          <Card title="À quoi ressemble la vie en sortie de cette formation ?">
            <WidgetInserJeunes etablissement={etablissement} formation={formation} />
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default function ResearchFormationResult({ params }: { params: { id: string } }) {
  const { isLoading, isError, data } = useQuery({
    staleTime: Infinity,
    cacheTime: Infinity,
    retry: 0,
    queryKey: ["formation", params.id],
    queryFn: ({ signal }) => {
      return formation({ id: params.id }, { signal });
    },
  });

  if (isLoading) {
    return <Loader />;
  }

  if (isError || !data) {
    return <>Formation not found</>;
  }

  return <FormationResult formation={data} />;
}
