"use client";
import React, { useMemo, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useBottomScrollListener } from "react-bottom-scroll-listener";
import { Typograhpy, Grid } from "../../components/MaterialUINext";
import InformationCard from "#/app/components/InformationCard";
import { formations } from "#/app/api/exposition/formations/query";
import Loader from "#/app/components/Loader";
import { fr } from "@codegouvfr/react-dsfr";
import Button from "#/app/components/Button";
import FormationCard from "./components/FormationCard";
import FormationsMap from "./components/FormationsMap";

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
  const [expandMap, setExpandMap] = useState(false);

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
          items_par_page: 200,
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
      <Grid container spacing={0}>
        <Grid
          item
          md={expandMap === true ? 6 : 10}
          style={{
            zIndex: 500,
            padding: fr.spacing("5v"),
            paddingLeft: fr.spacing("20v"),
            boxShadow: "4px 0px 6px 0px #00000040",
          }}
        >
          <Grid container spacing={4}>
            {data.pages.map((page) => {
              return page.formations.map((formation) => {
                const formationDetail = formation.formation;
                const key = `${formationDetail.cfd}-${formationDetail.codeDispositif}-${formationDetail.uai}-${formationDetail.voie}`;
                return (
                  <Grid item xs={4} key={key}>
                    <FormationCard latitude={latitude} longitude={longitude} formation={formation} />
                  </Grid>
                );
              });
            })}
          </Grid>
        </Grid>

        <Grid item md={expandMap === true ? 6 : 2}>
          <div style={{ height: "100vh", width: "100%", top: 0, position: "sticky" }}>
            <div style={{ position: "absolute", top: "20px", width: "100%", zIndex: 600, textAlign: "center" }}>
              <Button
                iconId="fr-icon-road-map-line"
                priority="secondary"
                size="small"
                variant="white"
                rounded
                onClick={() => {
                  setExpandMap(!expandMap);
                }}
              >
                Voir sur la carte
              </Button>
            </div>
            <FormationsMap longitude={longitude} latitude={latitude} etablissements={etablissements} />
          </div>
        </Grid>
      </Grid>
      {isFetchingNextPage && <Loader style={{ marginTop: fr.spacing("5v") }} />}
    </>
  );
}
