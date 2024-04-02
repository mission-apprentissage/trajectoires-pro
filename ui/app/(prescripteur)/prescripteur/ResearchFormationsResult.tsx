"use client";
import React, { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useBottomScrollListener } from "react-bottom-scroll-listener";
import { Typograhpy, Grid, Box } from "../../components/MaterialUINext";
import InformationCard from "#/app/components/InformationCard";
import Container from "#/app/components/Container";
import { CardActionArea, Typography } from "@mui/material";

import { Tag } from "@codegouvfr/react-dsfr/Tag";

import { formations } from "#/app/api/exposition/formations/query";
import Loader from "#/app/components/Loader";
import { fr } from "@codegouvfr/react-dsfr";
import Link from "next/link";
import Map from "#/app/components/Map";
import { Marker, Popup, Tooltip } from "react-leaflet";

export const revalidate = 0;

export default function ResearchFormationsResult({
  latitude,
  longitude,
  distance,
  time,
  page = 1,
}: {
  latitude: number;
  longitude: number;
  distance: number;
  time: number;
  page: number;
}) {
  const { isLoading, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage, data } = useInfiniteQuery({
    staleTime: Infinity,
    cacheTime: Infinity,
    //keepPreviousData: true,
    queryKey: ["formations", latitude, longitude, distance, time, page],
    queryFn: ({ pageParam, signal }) => {
      return formations(
        {
          latitude,
          longitude,
          distance,
          timeLimit: time,
          page: pageParam ?? 1,
          codesDiplome: ["3", "4"],
          items_par_page: 3000,
        },
        { signal }
      );
    },
    getNextPageParam: (lastPage, pages) => {
      return !lastPage.pagination || lastPage.pagination.nombre_de_page === lastPage.pagination.page
        ? undefined
        : lastPage.pagination.page + 1;
    },
  });
  useBottomScrollListener(() => (hasNextPage && !isFetchingNextPage && !isFetching ? fetchNextPage() : null));

  const etablissements = useMemo(() => {
    const etablissements: Record<string, any> = {};

    if (!data) {
      return [];
    }

    for (const page of data.pages) {
      for (const formation of page.formations) {
        etablissements[formation.etablissement.uai] = formation.etablissement;
      }
    }

    return Object.values(etablissements);
  }, [data]);

  if (isLoading) {
    return <Loader />;
  }

  if (!data?.pages[0].formations?.length) {
    return (
      <InformationCard>
        <Typograhpy variant="subtitle1">Il n’y pas de formation proche de ton secteur de rechercher </Typograhpy>
        <Typograhpy>Mais ne te décourage pas il y a plein de solutions pour toi : </Typograhpy>
      </InformationCard>
    );
  }

  return (
    <>
      <div style={{ height: "400px", marginBottom: fr.spacing("5v") }}>
        <Map center={[latitude, longitude]}>
          {etablissements.map((etablissement) => {
            const key = `marker_${etablissement.uai}`;
            const coordinate = etablissement.coordinate.coordinates;

            return (
              <Marker key={key} position={[coordinate[1], coordinate[0]]}>
                <Popup>{etablissement.libelle}</Popup>
                <Tooltip>
                  <div style={{ width: "300px" }}>
                    <Typograhpy sx={{ whiteSpace: "pre-line" }} variant="subtitle1">
                      {etablissement.libelle}
                    </Typograhpy>
                    <Typograhpy variant="body1">
                      A moins de {Math.round(etablissement.accessTime / 60)} minutes
                    </Typograhpy>
                    <Typograhpy variant="body1">{etablissement.address.street}</Typograhpy>
                    <Typograhpy variant="body1">
                      {etablissement.address.postCode} {etablissement.address.city}
                    </Typograhpy>
                  </div>
                </Tooltip>
              </Marker>
            );
          })}
        </Map>
      </div>
      <Grid container spacing={2}>
        {data.pages.map((page) => {
          return page.formations.map((formation) => {
            const key = `${formation.cfd}-${formation.codeDispositif}-${formation.uai}-${formation.voie}`;
            return (
              <Grid item xs={4} key={key}>
                <Link href={`/details/${key}?latitude=${latitude}&longitude=${longitude}`}>
                  <CardActionArea>
                    <Container style={{ border: "1px solid #DDDDDD", borderRadius: "10px" }}>
                      <Typography style={{ marginBottom: fr.spacing("3v") }} variant="subtitle2">
                        {formation.bcn.libelle_long}
                      </Typography>
                      <Typography style={{ marginBottom: fr.spacing("1v") }}>
                        {formation.etablissement.libelle}
                      </Typography>
                      <Tag style={{ marginBottom: fr.spacing("3v") }}>{formation.voie}</Tag>
                      <Typography variant="subtitle2" color={"#000091"}>
                        A {(formation.etablissement.distance / 1000).toFixed(2)} km
                      </Typography>
                      {formation.etablissement.accessTime && (
                        <Typography variant="subtitle2" color={"#000091"}>
                          A moins de {(formation.etablissement.accessTime / 60).toFixed(0)} minutes
                        </Typography>
                      )}
                    </Container>
                  </CardActionArea>
                </Link>
              </Grid>
            );
          });
        })}
      </Grid>
      {isFetchingNextPage && <Loader style={{ marginTop: fr.spacing("5v") }} />}
    </>
  );
}
