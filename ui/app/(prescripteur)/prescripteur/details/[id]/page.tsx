"use client";
import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Typograhpy, Grid } from "#/app/components/MaterialUINext";
import Container from "#/app/components/Container";
import { getDistance } from "geolib";
import { Tag } from "@codegouvfr/react-dsfr/Tag";
import { formation } from "#/app/api/exposition/formation/query";
import Loader from "#/app/components/Loader";
import { fr } from "@codegouvfr/react-dsfr";
import { useSearchParams } from "next/navigation";
import { Formation } from "#/types/formation";

export const revalidate = 0;

function FormationResult({ formation }: { formation: Formation }) {
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
        latitude: formation.etablissement.coordinate.coordinates[1],
        longitude: formation.etablissement.coordinate.coordinates[0],
      },
      0.01
    );
  }, [longitude, latitude]);

  console.log(formation);
  return (
    <Container>
      <Grid container spacing={2}>
        <Grid item md={6}>
          <Typograhpy variant="h4" style={{ marginBottom: fr.spacing("3v") }}>
            {formation.bcn.libelle_long}
          </Typograhpy>
          <Typograhpy variant="subtitle2" style={{ color: "#000091", marginBottom: fr.spacing("2v") }}>
            <i className={fr.cx("fr-icon-map-pin-2-fill")} style={{ marginRight: fr.spacing("1w") }} />
            <a
              href={`https://orion-recette.inserjeunes.beta.gouv.fr/panorama/etablissement/${formation.uai}`}
              target="_blank"
            >
              {formation.etablissement.libelle}
            </a>
          </Typograhpy>
          <Tag style={{ marginBottom: fr.spacing("3v") }}>{formation.voie}</Tag>

          {distance !== null && (
            <Typograhpy variant="subtitle2" style={{ color: "#000091" }}>
              <i className={fr.cx("fr-icon-bus-fill")} style={{ marginRight: fr.spacing("1w") }} />A{" "}
              {(distance / 1000).toFixed(2)} km
            </Typograhpy>
          )}
        </Grid>
        <Grid item md={6}>
          <Container style={{ border: "1px solid #DDDDDD", borderRadius: "10px" }}>
            <Typograhpy variant="h5" style={{ marginBottom: fr.spacing("3v") }}>
              {formation.etablissement.libelle}
            </Typograhpy>
            <Typograhpy variant="body1">{formation.etablissement.address.street}</Typograhpy>
            <Typograhpy variant="body1">
              {formation.etablissement.address.postCode} {formation.etablissement.address.city}
            </Typograhpy>
            <Typograhpy>
              <a
                href={`https://orion-recette.inserjeunes.beta.gouv.fr/panorama/etablissement/${formation.uai}`}
                target="_blank"
              >
                Voir sur orion
              </a>
            </Typograhpy>
          </Container>
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
