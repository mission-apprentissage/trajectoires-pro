"use client";
import React from "react";
import Container from "#/app/components/Container";
import { Grid, Stack, Typography } from "#/app/components/MaterialUINext";
import Button from "#/app/components/Button";
import SearchFormationHomeForm from "#/app/components/form/SearchFormationHomeForm";

export default function Page({ params }: { params: { id: string } }) {
  return (
    <>
      <Container maxWidth={false} style={{ backgroundColor: "var(--blue-france-975-75)", paddingBottom: "10rem" }}>
        <Container maxWidth={"lg"}>
          <Grid container spacing={0}>
            <Grid xs={12} sx={{ padding: { md: "0", xs: "1rem" }, paddingBottom: { md: "3rem" } }}>
              <Typography
                variant="h1_main"
                style={{
                  color: "var(--blue-france-sun-113-625-hover)",
                }}
              >
                Trouve toutes
                <br />
                les formations pro*
                <br />
                autour de toi
              </Typography>
            </Grid>
            <Grid
              sx={{
                padding: { md: "2.875rem", xs: "1rem" },
                paddingTop: { xs: "2rem" },
                paddingBottom: { xs: "2rem" },
                paddingLeft: { md: "2.25rem" },
                borderRadius: { md: "11px" },
                backgroundColor: "var(--blue-france-sun-113-625-hover)",
                marginBottom: { xs: "2rem", md: "3rem" },
              }}
              md={9}
              xs={12}
            >
              <SearchFormationHomeForm url={"/recherche"} defaultValues={{ address: null, distance: 10, time: 90 }} />
            </Grid>

            <Grid sm={12} md={6.5} sx={{ padding: { xs: "1rem", md: "0" } }}>
              <Typography
                variant={"h2"}
                style={{
                  color: "var(--blue-france-sun-113-625-hover)",
                  fontSize: "1.125rem",
                  lineHeight: "1.75rem",
                  marginBottom: "1rem",
                }}
              >
                *Voie Pro = Professionnelle. Ce n’est pas si clair ?
              </Typography>
              <Typography variant={"body2"} style={{ marginBottom: "1.5rem" }}>
                Après la 3ᵉ, il est possible d&apos;apprendre un métier en CAP ou en bac pro, au sein d&apos;un lycée
                professionnel ou d&apos;un centre de formation d&apos;apprentis. À l&apos;issue de ce cursus,
                l&apos;élève diplômé pourra accéder directement à un emploi ou choisir de poursuivre ses études.
              </Typography>
              <Stack direction={{ md: "row", xs: "column" }} spacing={"14px"}>
                <Button
                  linkProps={{ href: "https://avenirs.onisep.fr/eleves/decouvrir-la-voie-pro-au-college" }}
                  rounded={"4px"}
                  priority="secondary"
                  variant={"white-black"}
                >
                  Découvrir la voie pro au collège
                </Button>
                <Button
                  linkProps={{
                    href: "https://avenirs.onisep.fr/eleves/decouvrir-la-voie-pro-au-college/quiz-voie-pro",
                  }}
                  rounded={"4px"}
                  priority="secondary"
                  variant={"white-black"}
                >
                  Quizz voie pro
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Container>
    </>
  );
}
