import React from "react";
import { Typography } from "#/app/components/MaterialUINext";
import { fr } from "@codegouvfr/react-dsfr";
import { Etablissement } from "#/types/formation";
import FormationRoute from "../prescripteur/details/[id]/FormationRoute";

export default function EtablissementCard({
  etablissement,
  latitude,
  longitude,
}: {
  etablissement: Etablissement;
  latitude?: string;
  longitude?: string;
}) {
  return (
    <>
      <Typography variant="h5" style={{ marginBottom: fr.spacing("3v") }}>
        {etablissement.libelle}
        {etablissement.url && <a style={{ marginLeft: fr.spacing("3v") }} href={etablissement.url} target="_blank"></a>}
      </Typography>

      <FormationRoute etablissement={etablissement} latitude={latitude} longitude={longitude} />
    </>
  );
}
