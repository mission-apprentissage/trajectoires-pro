/** @jsxImportSource @emotion/react */
"use client";
import React, { Suspense, useMemo, useState } from "react";
import { css } from "@emotion/react";
import { useBottomScrollListener } from "react-bottom-scroll-listener";
import { Typography, Grid } from "../../../components/MaterialUINext";
import InformationCard from "#/app/components/InformationCard";
import Loader from "#/app/components/Loader";
import { fr } from "@codegouvfr/react-dsfr";
import Button from "#/app/components/Button";
import FormationCard from "./FormationCard";
import ClientSideScrollRestorer from "#/app/components/ClientSideScrollRestorer";
import dynamic from "next/dynamic";
import { Formation, FormationTag } from "#/types/formation";
import { Stack, useTheme } from "@mui/material";
import FormationAllTags from "../../components/FormationAllTags";
import useGetFormations from "../../hooks/useGetFormations";
import { useFormationsSearch } from "../../context/FormationsSearchContext";

const FormationsMap = dynamic(() => import("#/app/(prescripteur)/components/FormationsMap"), {
  ssr: false,
});

function FormationsFilterTag({ selected }: { selected?: FormationTag | null }) {
  const { params, updateParams } = useFormationsSearch();

  return (
    <FormationAllTags
      selected={selected}
      onClick={(selectedTag) => {
        if (!params) {
          return;
        }
        const { address, distance, time } = params;

        updateParams({
          address,
          distance,
          time,
          tag: selectedTag === selected ? undefined : selectedTag,
        });
      }}
    />
  );
}

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
  const theme = useTheme();
  const [selected, setSelected] = useState<null | Formation>(null);
  const [expandMap, setExpandMap] = useState(false);

  const { isLoading, fetchNextPage, isFetchingNextPage, formations, etablissements } = useGetFormations({
    latitude,
    longitude,
    distance,
    time,
    tag,
    page,
  });

  useBottomScrollListener(fetchNextPage);

  const formationsRef = useMemo(() => formations.map((data) => React.createRef<HTMLDivElement>()), [formations]);

  if (isLoading) {
    return <Loader withMargin />;
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
          lg={expandMap === true ? 6 : 6}
          xl={expandMap === true ? 6 : 4}
          css={css`
            width: 100%;
            top: 0;
            position: sticky;
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
              const formationIndex = formations.findIndex((f) => f.etablissement.uai === etablissement.uai);
              if (formationIndex === -1) {
                return;
              }

              const formation = formations[formationIndex];
              //const formationRef = formationsRef[formationIndex];
              setSelected(formation);
              //formationRef?.current && formationRef?.current.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          />
        </Grid>

        <Grid
          item
          lg={expandMap === true ? 6 : 6}
          xl={expandMap === true ? 6 : 8}
          sm={12}
          css={css`
            padding: ${fr.spacing("5v")};
            z-index: 500;
            width: 100%;
            ${theme.breakpoints.up("lg")} {
              padding-left: ${fr.spacing("20v")};
            }
          `}
        >
          <Stack direction="row" useFlexGap flexWrap="wrap" spacing={2} style={{ marginBottom: fr.spacing("5v") }}>
            <FormationsFilterTag selected={tag} />
          </Stack>

          {!formations?.length ? (
            <InformationCard>
              <Typography variant="subtitle1">
                Nous n’avons pas trouvé de formation proche correspondant à cette recherche
              </Typography>
              <Typography>
                Attention, cet outil est un prototype destiné à être testé en Île-de-France et en Bretagne. En dehors de
                ces régions, le service proposé sera incomplet et dégradé lors de cette phase d’expérimentation.
              </Typography>
              <br />
              <Typography>De plus, la liste des formations renvoyées peut être incomplète car : </Typography>
              <ul>
                <li>certaines formations ne sont pas encore référencées,</li>
                <li>
                  toutes les modalités de transport ne sont pas encore intégrées (notamment les transports scolaires).
                </li>
              </ul>
              <br />
              <Typography>
                Nous vous invitons donc à compléter votre recherche sur Onisep.fr, la plateforme d’orientation de votre
                région, les sites des établissements, etc.
              </Typography>
              <br />
              <Typography>Bonne recherche !</Typography>
            </InformationCard>
          ) : (
            <Grid container spacing={2}>
              {formations.map((formation, index) => {
                const formationDetail = formation.formation;
                const isSelected = selected ? selected.formation._id === formationDetail._id : false;
                const key = `${formationDetail.cfd}-${formationDetail.codeDispositif}-${formationDetail.uai}-${formationDetail.voie}`;
                return (
                  <Grid item sm={12} lg={6} xl={4} key={key} ref={formationsRef[index]}>
                    <FormationCard
                      selected={isSelected}
                      onMouseEnter={() => {
                        setSelected(formation);
                      }}
                      latitude={latitude}
                      longitude={longitude}
                      formation={formation}
                      tabIndex={index}
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
