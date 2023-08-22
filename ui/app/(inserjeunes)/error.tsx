"use client";
import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { Box, Grid, Typography } from "@mui/material";
import Container from "@mui/material/Container";
import TechnicalErrorSvg from "#/public//dsfr/artwork/pictograms/system/technical-error.svg";
import OvoidSvg from "#/public/dsfr/artwork/background/ovoid.svg";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <Container>
      <Grid container direction="row" justifyContent="center" alignItems="center">
        <Grid item xs={7}>
          <Typography sx={{ my: fr.spacing("6v"), mt: fr.spacing("28v") }} variant="h1">
            Erreur inatendue
          </Typography>
          <Typography sx={{ my: fr.spacing("6v") }} variant="body2">
            Erreur 500
          </Typography>
          <Typography variant="body1">
            Désolé, le service rencontre un problème, nous travaillons pour le résoudre le plus rapidement possible.
          </Typography>
          <Typography sx={{ mt: fr.spacing("6v") }} variant="body2">
            Essayez de rafraichir la page ou bien ressayez plus tard.
          </Typography>
          <Typography sx={{ mb: fr.spacing("12v") }} variant="body2">
            Si vous avez besoin d’une aide immédiate, merci de nous contacter directement.
          </Typography>
          <Box sx={{ mb: fr.spacing("28v") }}>
            {/* TODO: IMPLEMENT THE CONTACT BUTTON */}
            <Button priority="secondary">Contactez-nous</Button>
          </Box>
        </Grid>
        <Grid item xs={5}>
          <Grid container justifyContent={"end"}>
            <Grid item xs={10}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="fr-responsive-img fr-artwork"
                aria-hidden="true"
                width="160"
                height="200"
                viewBox="0 0 160 200"
              >
                <use className="fr-artwork-motif" href={`${OvoidSvg}#artwork-motif`}></use>
                <use className="fr-artwork-background" href={`${OvoidSvg}#artwork-background`}></use>
                <g transform="translate(40, 60)">
                  <use className="fr-artwork-decorative" href={`${TechnicalErrorSvg}#artwork-decorative`}></use>
                  <use className="fr-artwork-minor" href={`${TechnicalErrorSvg}#artwork-minor`}></use>
                  <use className="fr-artwork-major" href={`${TechnicalErrorSvg}#artwork-major`}></use>
                </g>
              </svg>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
}
