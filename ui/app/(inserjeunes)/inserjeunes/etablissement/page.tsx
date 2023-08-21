"use client";

import Loader from "#/app/components/Loader";
import * as Queries from "#/app/(inserjeunes)/queries";
import { useQuery } from "@tanstack/react-query";
import { Typography, Grid, Box, Divider } from "@mui/material";

import { notFound } from "next/navigation";
import EtablissementStats from "./EtablissementStats";
import Formations from "./Formations";
import { UserSession } from "#/services/inserjeunes/types";

import { Session } from "next-auth";
import withSession from "#/wrappers/withSession";

function Page({ session }: { session: Session }) {
  const user = session.user as unknown as UserSession;

  const { isLoading, data: { etablissement, stats } = { etablissement: null, stats: null } } = useQuery({
    queryKey: ["etablissement"],
    queryFn: () => Queries.etablissement(),
    staleTime: Infinity,
    cacheTime: Infinity,
  });

  const { isLoading: isLoadingFormations, data: dataFormations } = useQuery({
    staleTime: Infinity,
    cacheTime: Infinity,
    queryKey: ["formation", etablissement],
    queryFn: ({ signal }) => Queries.formationsForUai(etablissement.uai, { signal }),
  });

  if (isLoading || isLoadingFormations) {
    return <Loader />;
  }

  if (!etablissement) {
    notFound();
  }

  return (
    <Grid container justifyContent="center" sx={{ mt: 4 }}>
      <Grid item xs={12} md={12} lg={12}>
        <Grid container>
          <Grid item xs={7}>
            <Typography variant="h1">{etablissement.onisep_nom}</Typography>

            {stats && <EtablissementStats stats={stats} />}
          </Grid>

          <Grid item xs={4} sx={{ pl: 2 }}>
            <Grid container justifyContent={"space-between"}>
              <Divider orientation="vertical" flexItem></Divider>
              <Grid item xs={10}>
                <Typography variant="h6">Vos informations légales</Typography>
                <Box>
                  {[
                    ["SIRET", "siret"],
                    ["Raison sociale", "entreprise_raison_sociale"],
                    ["Adresse", "numero_voie", "type_voie", "nom_voie"],
                    ["Code postal", "code_postal"],
                    ["Commune", "localite"],
                  ].map(([titre, ...keys]) => {
                    return (
                      <Box key={titre}>
                        <Box component="span">{titre} : </Box>
                        <Box component="span" fontWeight="bold">
                          {keys.map((key) => etablissement[key]).join(" ")}
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        {dataFormations && <Formations formations={dataFormations} />}
      </Grid>
    </Grid>
  );
}

export default withSession(Page);
