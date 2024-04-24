"use client";
import React, { Suspense, useMemo, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { css } from "@emotion/css";
import { useBottomScrollListener } from "react-bottom-scroll-listener";
import { Typograhpy, Grid } from "../../components/MaterialUINext";
import InformationCard from "#/app/components/InformationCard";
import { formations as formationsQuery } from "#/app/api/exposition/formations/query";
import Loader from "#/app/components/Loader";
import { fr } from "@codegouvfr/react-dsfr";
import Button from "#/app/components/Button";
import FormationCard from "./components/FormationCard";
import ClientSideScrollRestorer from "#/app/components/ClientSideScrollRestorer";
import dynamic from "next/dynamic";
import { Formation, FormationTag } from "#/types/formation";
import { Stack, useTheme } from "@mui/material";
import { useSearchParams, useRouter } from "next/navigation";
import FormationAllTags from "./components/FormationAllTags";

const FormationsMap = dynamic(() => import("#/app/(prescripteur)/prescripteur/components/FormationsMap"), {
  ssr: false,
});

export default function ResearchFormationsResult({
  latitude,
  longitude,
  distance,
  time,
  tag,
  page = 1,
}: {
  latitude: number;
  longitude: number;
  distance: number;
  time: number;
  tag?: FormationTag | null;
  page: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const theme = useTheme();
  const [selected, setSelected] = useState<null | Formation>(null);
  const [expandMap, setExpandMap] = useState(false);

  const { isLoading, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage, data } = useInfiniteQuery({
    staleTime: Infinity,
    cacheTime: Infinity,
    retry: false,
    //keepPreviousData: true,
    queryKey: ["formations", latitude, longitude, distance, time, tag, page],
    queryFn: ({ pageParam, signal }) => {
      return formationsQuery(
        {
          latitude,
          longitude,
          distance,
          timeLimit: time,
          tag,
          page: pageParam ?? 1,
          codesDiplome: ["3", "4"],
          items_par_page: 100,
        },
        { signal }
      );
    },
    getNextPageParam: (lastPage, pages) => {
      return !lastPage.pagination || lastPage.pagination.nombre_de_page === lastPage.pagination.page
        ? undefined
        : lastPage.pagination.page + 1;
    },
    useErrorBoundary: true,
  });
  useBottomScrollListener(() => (hasNextPage && !isFetchingNextPage && !isFetching ? fetchNextPage() : null));

  const formations = useMemo(
    () =>
      (data ? data.pages.flatMap((page) => page.formations) : []).map((data) => ({
        ...data,
        ref: React.createRef<HTMLDivElement>(),
      })),
    [data]
  );

  const etablissements = useMemo(() => {
    const etablissements: Record<string, any> = {};

    if (!data) {
      return [];
    }

    for (const formation of formations) {
      etablissements[formation.etablissement.uai] = formation.etablissement;
    }

    return Object.values(etablissements);
  }, [data]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <Suspense>
        <ClientSideScrollRestorer />
      </Suspense>

      <Grid container spacing={0} direction="row-reverse">
        <Grid
          item
          sm={12}
          md={expandMap === true ? 6 : 2}
          style={{ width: "100%", top: 0, position: "sticky" }}
          className={css`
            height: 100vh;
            ${theme.breakpoints.down("md")} {
              height: 40vh;
              z-index: 600;
            }
          `}
        >
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
          <FormationsMap
            selected={selected}
            longitude={longitude}
            latitude={latitude}
            etablissements={etablissements}
            onMarkerClick={(etablissement) => {
              const formation = formations.find((f) => f.etablissement.uai === etablissement.uai);
              formation && setSelected(formation);
              formation?.ref?.current && formation.ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          />
        </Grid>

        <Grid
          item
          md={expandMap === true ? 6 : 10}
          sm={12}
          className={css`
            padding: ${fr.spacing("5v")};
            z-index: 500;
            box-shadow: 4px 0px 6px 0px #00000040;
            ${theme.breakpoints.up("lg")} {
              padding-left: ${fr.spacing("20v")};
            }
          `}
        >
          <Stack direction="row" spacing={2} style={{ marginBottom: fr.spacing("5v") }}>
            <FormationAllTags
              selected={tag}
              onClick={(selectedTag) => {
                const urlSearchParams = new URLSearchParams(searchParams);
                if (tag === selectedTag) {
                  urlSearchParams.delete("tag");
                } else {
                  urlSearchParams.set("tag", selectedTag);
                }

                router.push(`?${urlSearchParams}`);
              }}
            />
          </Stack>

          {!formations?.length ? (
            <InformationCard>
              <Typograhpy variant="subtitle1">Il n’y pas de formation proche de ton secteur de rechercher </Typograhpy>
              <Typograhpy>Mais ne te décourage pas il y a plein de solutions pour toi : </Typograhpy>
            </InformationCard>
          ) : (
            <Grid container spacing={4}>
              {formations.map((formation) => {
                const formationDetail = formation.formation;
                const isSelected = selected ? selected.formation._id === formationDetail._id : false;
                const key = `${formationDetail.cfd}-${formationDetail.codeDispositif}-${formationDetail.uai}-${formationDetail.voie}`;
                return (
                  <Grid item sm={12} md={4} key={key} ref={formation.ref}>
                    <FormationCard
                      selected={isSelected}
                      onMouseEnter={() => {
                        setSelected(formation);
                      }}
                      latitude={latitude}
                      longitude={longitude}
                      formation={formation}
                    />
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Grid>
      </Grid>
      {isFetchingNextPage && <Loader style={{ marginTop: fr.spacing("5v") }} />}
    </>
  );
}
