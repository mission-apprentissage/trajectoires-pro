"use client";
import React from "react";
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
import { BASE_PATH } from "../layout";

export const revalidate = 0;

export default function ResearchFormationsResult({
  latitude,
  longitude,
  distance,
  page = 1,
}: {
  latitude: number;
  longitude: number;
  distance: number;
  page: number;
}) {
  const { isLoading, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage, data } = useInfiniteQuery({
    staleTime: Infinity,
    cacheTime: Infinity,
    //keepPreviousData: true,
    queryKey: ["formations", latitude, longitude, distance, page],
    queryFn: ({ pageParam, signal }) => {
      return formations(
        { latitude, longitude, distance, page: pageParam ?? 1, codesDiplome: ["3", "4"], items_par_page: 12 },
        { signal }
      );
    },
    getNextPageParam: (lastPage, pages) =>
      lastPage.pagination.nombre_de_page === lastPage.pagination.page ? undefined : lastPage.pagination.page + 1,
  });
  useBottomScrollListener(() => (hasNextPage && !isFetchingNextPage && !isFetching ? fetchNextPage() : null));

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
      <Grid container spacing={2}>
        {data.pages.map((page) => {
          return page.formations.map((formation) => {
            const key = `${formation.cfd}-${formation.codeDispositif}-${formation.uai}-${formation.voie}`;
            return (
              <Grid item xs={4} key={key}>
                <Link href={`${BASE_PATH}/details/${key}?latitude=${latitude}&longitude=${longitude}`}>
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
                        A {(formation.etablissement.distance.calculated / 1000).toFixed(2)} km
                      </Typography>
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
