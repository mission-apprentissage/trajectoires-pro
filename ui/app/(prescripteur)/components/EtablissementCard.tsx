import React from "react";
import { Typography } from "#/app/components/MaterialUINext";
import { fr } from "@codegouvfr/react-dsfr";
import { Etablissement } from "#/types/formation";
import FormationRoute from "../prescripteur/details/[id]/FormationRoute";
import Link from "#/app/components/Link";

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
        {etablissement.url ? (
          <Link style={{ backgroundImage: "none" }} noIcon target="_blank" href={etablissement.url}>
            {etablissement.libelle}
            <i
              className={"link-underline fr-icon--sm " + fr.cx("ri-external-link-line")}
              style={{ marginLeft: fr.spacing("3v") }}
            />
          </Link>
        ) : (
          etablissement.libelle
        )}
      </Typography>

      <FormationRoute etablissement={etablissement} latitude={latitude} longitude={longitude} />
    </>
  );
}
