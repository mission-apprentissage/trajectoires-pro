import React, { useMemo } from "react";
import { Typograhpy } from "#/app/components/MaterialUINext";
import { fr } from "@codegouvfr/react-dsfr";
import { Etablissement } from "#/types/formation";
import Card from "#/app/components/Card";
import { formatPortesOuvertes } from "./PortesOuvertes";
import Link from "#/app/components/Link";
import Accordion from "#/app/components/Accordion";

const PortesOuvertesTitle = ({ etablissement }: { etablissement: Etablissement }) => {
  const strPortesOuvertes = useMemo(() => formatPortesOuvertes(etablissement), [etablissement]);
  const url = etablissement?.onisep?.id
    ? `https://www.onisep.fr/http/redirection/etablissement/slug/${etablissement.onisep.id}#events`
    : null;

  const title = strPortesOuvertes ? (
    <Typograhpy
      variant="subtitle1"
      style={{
        backgroundColor: strPortesOuvertes.ended ? "var(--background-contrast-grey)" : "#1212FF",
        fontWeight: 500,
        color: strPortesOuvertes.ended ? "#3A3A3A" : "#fff",
        padding: fr.spacing("2v"),
        paddingLeft: fr.spacing("5v"),
        paddingRight: fr.spacing("5v"),
      }}
    >
      {strPortesOuvertes.str}
      <i className={fr.cx("fr-icon-arrow-right-line")} style={{ marginLeft: fr.spacing("1w") }} />
    </Typograhpy>
  ) : null;

  return strPortesOuvertes ? (
    url ? (
      <Link href={url} target="_blank" noIcon>
        {title}
      </Link>
    ) : (
      title
    )
  ) : (
    <></>
  );
};

export default function EtablissementCard({ etablissement }: { etablissement: Etablissement }) {
  return (
    <Card title={<PortesOuvertesTitle etablissement={etablissement} />}>
      <Accordion
        label={
          <Typograhpy variant="h5" style={{ color: "var(--blue-france-sun-113-625)", marginBottom: fr.spacing("3v") }}>
            {etablissement.libelle}
          </Typograhpy>
        }
      >
        <Typograhpy variant="body1">{etablissement.address.street}</Typograhpy>
        <Typograhpy variant="body1">
          {etablissement.address.postCode} {etablissement.address.city}
        </Typograhpy>
        <Typograhpy>
          <a
            href={`https://orion-recette.inserjeunes.beta.gouv.fr/panorama/etablissement/${etablissement.uai}`}
            target="_blank"
          >
            Voir sur orion
          </a>
        </Typograhpy>
      </Accordion>
    </Card>
  );
}
