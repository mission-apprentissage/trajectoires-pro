"use client";
import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { Box, Grid, Typography } from "@mui/material";
import Container from "@mui/material/Container";

export default function UserGeolocatioDenied() {
  return (
    <>
      <Container>
        <Grid container direction="row" justifyContent="center" alignItems="center">
          <Grid item xs={12}>
            <Typography sx={{ mt: fr.spacing("12v") }} variant="h1">
              Nous n&apos;avons pas l&apos;autorisation d&apos;obtenir votre position
            </Typography>

            <Typography sx={{ my: fr.spacing("6v") }} variant="body1">
              Veuillez autoriser la géolocalisation ou entrer une adresse.
            </Typography>
            <Box sx={{ mb: fr.spacing("12v") }}>
              <Button
                linkProps={{
                  href: "/",
                }}
                priority="secondary"
              >
                Page d&apos;accueil
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
