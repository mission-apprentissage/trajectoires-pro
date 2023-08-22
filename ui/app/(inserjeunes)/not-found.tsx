"use client";
import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { Box, Grid, Typography } from "@mui/material";
import Container from "@mui/material/Container";
import TechnicalErrorSvg from "#/public/dsfr/artwork/pictograms/system/technical-error.svg";
import OvoidSvg from "#/public/dsfr/artwork/background/ovoid.svg";
import Link from "next/link";

export default function NotFound() {
  return (
    <Container>
      <Grid container direction="row" justifyContent="center" alignItems="center">
        <Grid item xs={7}>
          <Typography sx={{ my: fr.spacing("6v"), mt: fr.spacing("28v") }} variant="h1">
            Page non trouvée
          </Typography>
          <Typography sx={{ my: fr.spacing("6v") }} variant="body2">
            Erreur 404
          </Typography>
          <Typography variant="body1">
            La page que vous cherchez est introuvable. Excusez-nous pour la gène occasionnée.
          </Typography>
          <Typography sx={{ mt: fr.spacing("6v") }} variant="body2">
            {
              "Si vous avez tapé l'adresse web dans le navigateur, vérifiez qu'elle est correcte. La page n’est peut-être plus disponible."
            }
          </Typography>
          <Typography variant="body2">
            Dans ce cas, pour continuer votre visite vous pouvez consulter notre page d’accueil, ou effectuer une
            recherche avec notre moteur de recherche en haut de page.
          </Typography>
          <Typography sx={{ mb: fr.spacing("12v") }} variant="body2">
            Sinon contactez-nous pour que l’on puisse vous rediriger vers la bonne information.
          </Typography>
          <Box sx={{ mb: fr.spacing("28v") }}>
            <Box sx={{ mr: fr.spacing("4v") }} component="span">
              <Link href="/">
                <Button priority="primary">{"Page d'accueil"}</Button>
              </Link>
            </Box>
            <Box component="span">
              {/* TODO: IMPLEMENT THE CONTACT BUTTON */}
              <Button priority="secondary">Contactez-nous</Button>
            </Box>
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
