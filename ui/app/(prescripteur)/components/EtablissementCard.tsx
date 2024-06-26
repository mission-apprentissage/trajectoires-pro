import React, { useMemo } from "react";
import { Typography } from "#/app/components/MaterialUINext";
import { fr } from "@codegouvfr/react-dsfr";
import { Etablissement } from "#/types/formation";
import Card from "#/app/components/Card";
import Accordion from "#/app/components/Accordion";

export default function EtablissementCard({ etablissement }: { etablissement: Etablissement }) {
  return (
    <Card>
      <Accordion
        label={
          <Typography variant="h5" style={{ color: "var(--blue-france-sun-113-625)", marginBottom: fr.spacing("3v") }}>
            {etablissement.libelle}
          </Typography>
        }
      >
        <Typography variant="body1">{etablissement.address.street}</Typography>
        <Typography variant="body1">
          {etablissement.address.postCode} {etablissement.address.city}
        </Typography>
        <Typography>
          <a
            href={`https://orion-recette.inserjeunes.beta.gouv.fr/panorama/etablissement/${etablissement.uai}`}
            target="_blank"
          >
            Voir sur orion
          </a>
        </Typography>
      </Accordion>
    </Card>
  );
}
