"use client";
import React from "react";
import { Typography } from "#/app/components/MaterialUINext";
import Loader from "#/app/components/Loader";
import { fr } from "@codegouvfr/react-dsfr";
import { FormationDetail, FormationVoie } from "#/types/formation";
import useGetFormations from "#/app/(prescripteur)/hooks/useGetFormations";

export default function FormationDisponible({ formation }: { formation: FormationDetail }) {
  const { isLoading, formations } = useGetFormations({
    cfds: [formation.cfd],
    uais: [formation.uai],
  });
  const formationAutreVoie =
    formation.voie === FormationVoie.SCOLAIRE ? FormationVoie.APPRENTISSAGE : FormationVoie.SCOLAIRE;

  if (isLoading) {
    return <Loader />;
  }

  return (
    formations.find(({ formation: f }) => f.voie === formationAutreVoie) && (
      <Typography
        variant={"body2"}
        style={{
          borderLeft: "4px solid #6A6AF4",
          marginTop: fr.spacing("14v"),
          marginLeft: fr.spacing("8v"),
          paddingLeft: fr.spacing("8v"),
        }}
      >
        {formation.voie === FormationVoie.APPRENTISSAGE ? (
          <>Cette formation est aussi disponible en voie scolaire, sans présence en entreprise.</>
        ) : (
          <>Cette formation est aussi disponible en alternance.</>
        )}
      </Typography>
    )
  );
}
