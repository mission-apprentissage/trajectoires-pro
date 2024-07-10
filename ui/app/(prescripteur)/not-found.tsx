"use client";
import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { Box, Grid, Typography } from "@mui/material";
import Container from "@mui/material/Container";

import { ReadonlyURLSearchParams, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Title from "./components/Title";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  const [originalUrl, setOriginalUrl] = useState<{ pathname: string; searchParams: ReadonlyURLSearchParams } | null>(
    null
  );
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    if (originalUrl) {
      reset();
    }
    setOriginalUrl({ pathname, searchParams });
  }, [reset, originalUrl, pathname, searchParams]);

  return (
    <>
      <Title pageTitle={"Page non trouvée"}></Title>
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
              La page que vous cherchez est introuvable. Excusez-nous pour la gêne occasionnée.
            </Typography>
            <Typography sx={{ mt: fr.spacing("6v") }} variant="body2">
              Si vous avez tapé l&apos;adresse web dans le navigateur, vérifiez qu&apos;elle est correcte. La page
              n&apos;est peut-être plus disponible.
            </Typography>
            <Typography sx={{ mb: fr.spacing("12v") }} variant="body2">
              Dans ce cas, pour continuer votre visite, vous pouvez consulter notre page d&apos;accueil.
            </Typography>
            <Box sx={{ mb: fr.spacing("28v") }}>
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
