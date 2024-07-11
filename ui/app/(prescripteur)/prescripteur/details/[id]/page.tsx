/** @jsxImportSource @emotion/react */
"use client";
import React, { Suspense, useState } from "react";
import { css } from "@emotion/react";
import { Box, Stack, useTheme } from "@mui/material";
import HtmlReactParser from "html-react-parser";
import TruncateMarkup from "react-truncate-markup";
import { useQuery } from "@tanstack/react-query";
import { Typography, Grid } from "#/app/components/MaterialUINext";
import Container from "#/app/components/Container";
import { formation } from "#/app/api/exposition/formation/query";
import Loader from "#/app/components/Loader";
import { fr } from "@codegouvfr/react-dsfr";
import { notFound, useSearchParams } from "next/navigation";
import { Formation } from "#/types/formation";
import Divider from "#/app/components/Divider";
import Card from "#/app/components/Card";
import PortesOuvertesHeader from "./PortesOuvertesHeader";
import WidgetInserJeunes from "#/app/(prescripteur)/components/WidgetInserJeunes";
import FormationResume from "./FormationResume";
import WidgetSiriusEtablissement from "#/app/(prescripteur)/components/WidgetSiriusEtablissement";
import { TagStatut, TagDuree } from "#/app/components/Tag";
import { useSize } from "#/app/(prescripteur)/hooks/useSize";
import DialogMinistage, { modalMinistage } from "#/app/(prescripteur)/components/DialogMinistage";
import FormationRoute from "./FormationRoute";
import FormationDisponible from "./FormationDisponible";
import Link from "#/app/components/Link";
import Title from "#/app/(prescripteur)/components/Title";
import { TagApprentissage } from "#/app/(prescripteur)/components/Apprentissage";
import { capitalize } from "lodash-es";
import Button from "#/app/components/Button";

function FormationDetails({ formation: { formation, etablissement } }: { formation: Formation }) {
  const searchParams = useSearchParams();
  const longitude = searchParams.get("longitude");
  const latitude = searchParams.get("latitude");

  const theme = useTheme();

  const refHeader = React.useRef<HTMLElement>(null);
  const stickyHeaderSize = useSize(refHeader);

  const [descriptionLine, setDescriptionLine] = useState(5);

  return (
    <Container style={{ marginTop: fr.spacing("5v") }} maxWidth={"xl"}>
      <Grid container>
        <Grid item xs={12}>
          <PortesOuvertesHeader etablissement={etablissement} />
        </Grid>
        <Grid
          item
          xs={12}
          css={css`
            top: 0;
            position: sticky;
            background-color: #fff;
            z-index: 100;
          `}
          style={{ paddingLeft: fr.spacing("5v") }}
        >
          <Typography ref={refHeader} variant="h1" style={{ marginBottom: fr.spacing("3v") }}>
            {capitalize(formation.libelle)}
          </Typography>
        </Grid>
        <Grid
          item
          xs={12}
          css={css`
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
                {etablissement.url ? (
                  <Link style={{ backgroundImage: "none" }} noIcon target="_blank" href={etablissement.url}>
                    {etablissement.libelle}
                    <i
                      className={"fr-icon--sm " + fr.cx("ri-external-link-line")}
                      style={{ marginLeft: fr.spacing("3v") }}
                    />
                  </Link>
                ) : (
                  etablissement.libelle
                )}
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              css={css`
                ${theme.breakpoints.down("md")} {
                  margin-bottom: 0;
                }
                margin-bottom: ${fr.spacing("5v")};
              `}
            >
              <Grid container>
                <Grid item xs={12} md={6} style={{ paddingLeft: fr.spacing("5v") }}>
                  <FormationRoute etablissement={etablissement} latitude={latitude} longitude={longitude} />
                  <FormationDisponible formation={formation} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Divider
                    variant="middle"
                    noMargin
                    css={css`
                      ${theme.breakpoints.up("md")} {
                        display: none;
                      }
                    `}
                  />
                  <Card
                    actionProps={modalMinistage.buttonProps}
                    css={css`
                      margin-bottom: ${fr.spacing("8v")};
                      ${theme.breakpoints.down("md")} {
                        border: 0;
                        border-radius: 0;
                        margin-bottom: 0;
                        padding-left: ${fr.spacing("2v")};
                      }
                    `}
                  >
                    <Typography variant="subtitle2" style={{ color: "var(--blue-france-sun-113-625-hover)" }}>
                      <i className={fr.cx("fr-icon-calendar-2-line")} style={{ marginRight: fr.spacing("2v") }} />
                      Découvrir la formation lors d’un mini-stage ⓘ
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
          css={css`
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
              <Card title="La formation">
                <TruncateMarkup
                  lineHeight={24}
                  lines={descriptionLine}
                  tokenize={"words"}
                  ellipsis={
                    <div>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setDescriptionLine(1000);
                        }}
                      >
                        Voir plus
                      </a>
                    </div>
                  }
                >
                  <div>{HtmlReactParser(formation.description)}</div>
                </TruncateMarkup>
                <Box style={{ marginTop: "2rem" }}>
                  <Link
                    target="_blank"
                    href={`https://www.onisep.fr/http/redirection/formation/slug/${formation?.onisep?.identifiant}`}
                  >
                    En savoir plus sur l&apos;onisep
                  </Link>
                </Box>
              </Card>
            </Grid>

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
    return notFound();
  }

  return (
    <>
      <Title
        pageTitle={`Détails de la formation ${data.formation.libelle} dans l'établissement ${data.etablissement.libelle}`}
      />
      <FormationDetails formation={data} />
    </>
  );
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
