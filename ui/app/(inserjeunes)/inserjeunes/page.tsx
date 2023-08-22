"use client";
import React from "react";

import { Typography, Grid, Box } from "@mui/material";
import Container from "#/app/components/Container";
import Tile from "#/app/components/Tile";
import Link from "#/app/components/Link";

import SchoolSvg from "#/public/dsfr/artwork/pictograms/buildings/school.svg";
import HumanCoopSvg from "#/public/dsfr/artwork/pictograms/environment/human-cooperation.svg";
import AvatarSvg from "#/public/dsfr/artwork/pictograms/digital/avatar.svg";
export const revalidate = 0;

export default function Page() {
  return (
    <>
      <Container maxWidth={false}>
        <Box sx={{ mt: 2 }}>
          <Typography variant="h1">Bienvenue sur InserJeunes</Typography>
        </Box>
        <Box sx={{ mt: 2, mb: 6 }}>
          <Typography variant="body2">
            Le dispositif inserjeunes présente différents indicateurs pour toutes les formations professionnelles du CAP
            au BTS. Il a pour finalité de mieux informer les jeunes et fournir des outils de pilotage aux acteurs de la
            voie professionnelle.
          </Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item md={4} xs={12}>
            <Tile
              enlargeLink={true}
              imageUrl={`${AvatarSvg.src}#artwork-minor`}
              linkProps={{
                href: "#",
              }}
              title={
                <>
                  Vous êtes{" "}
                  <Box component="span" fontWeight="bold">
                    un étudiant, un parent ?
                  </Box>
                </>
              }
              desc={null}
            />
          </Grid>
          <Grid item md={4} xs={12}>
            <Link href="/etablissement" basePath="/inserjeunes" passHref legacyBehavior>
              <Tile
                enlargeLink={true}
                imageUrl={`${SchoolSvg.src}#artwork-minor`}
                linkProps={{
                  href: "#",
                }}
                title={
                  <>
                    Vous êtes un{" "}
                    <Box component="span" fontWeight="bold">
                      responsable d&apos;établissement ?
                    </Box>
                  </>
                }
                desc={null}
              />
            </Link>
          </Grid>
          <Grid item md={4} xs={12}>
            <Tile
              enlargeLink={true}
              imageUrl={`${HumanCoopSvg.src}#artwork-minor`}
              linkProps={{
                href: "#",
              }}
              title={
                <>
                  Vous êtes un{" "}
                  <Box component="span" fontWeight="bold">
                    professionel de l&apos;accompagnement des jeunes ?
                  </Box>
                </>
              }
              desc={null}
            />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
