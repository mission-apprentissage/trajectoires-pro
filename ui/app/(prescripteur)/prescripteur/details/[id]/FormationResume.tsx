"use client";
import React from "react";
import { Typography, Grid, Stack } from "#/app/components/MaterialUINext";
import Container from "#/app/components/Container";
import { FrCxArg, fr } from "@codegouvfr/react-dsfr";
import { Etablissement, FormationDetail } from "#/types/formation";
import Tag from "#/app/components/Tag";
import {
  THRESHOLD_TAUX_PRESSION,
  THRESHOLD_EN_EMPLOI,
  THRESHOLD_EN_ETUDE,
} from "#/app/(prescripteur)/constants/constants";
function FormationResumeBlock({
  title,
  icon,
  children,
}: {
  title: string;
  icon: FrCxArg;
  children?: JSX.Element | JSX.Element[];
}) {
  return (
    <>
      <Typography variant={"body1"} style={{ marginBottom: fr.spacing("4v") }}>
        <i className={fr.cx(icon)} style={{ marginRight: fr.spacing("1w") }} />
        {title}
      </Typography>

      <Stack direction={{ sm: "column", md: "column" }} spacing={{ xs: fr.spacing("2v"), sm: fr.spacing("2v") }}>
        {children}
      </Stack>
    </>
  );
}

function FormationResumeBlockAdmission({ formation }: { formation: FormationDetail }) {
  const tauxPression = formation?.indicateurEntree?.tauxPression;
  const admissionLevel =
    tauxPression === undefined
      ? "unknow"
      : tauxPression <= THRESHOLD_TAUX_PRESSION[0]
      ? "easy"
      : tauxPression < THRESHOLD_TAUX_PRESSION[1]
      ? "average"
      : "hard";

  return (
    <FormationResumeBlock title={"L'admission"} icon={"ri-calendar-line"}>
      <>
        {admissionLevel === "easy" && (
          <Tag square level="easy">
            Facile
          </Tag>
        )}
      </>
      <>
        {admissionLevel === "average" && (
          <Tag square level="average">
            Peu facile
          </Tag>
        )}
      </>
      <>
        {admissionLevel === "hard" && (
          <Tag square level="hard">
            Très sélective
          </Tag>
        )}
      </>
      <>
        {admissionLevel === "unknow" && (
          <Tag square level="unknow">
            Difficulté d’intégration inconnue
          </Tag>
        )}
      </>
    </FormationResumeBlock>
  );
}

function FormationResumeBlockEmploi({ formation }: { formation: FormationDetail }) {
  const tauxPression = formation?.indicateurPoursuite?.taux_en_emploi_6_mois;
  const admissionLevel =
    tauxPression === undefined
      ? "unknow"
      : tauxPression >= THRESHOLD_EN_EMPLOI[0]
      ? "easy"
      : tauxPression > THRESHOLD_EN_EMPLOI[1]
      ? "average"
      : "hard";

  return (
    <FormationResumeBlock title={"L'accès à l'emploi"} icon={"ri-briefcase-4-line"}>
      <>
        {admissionLevel === "easy" && (
          <Tag square level="easy">
            Très favorable
          </Tag>
        )}
      </>
      <>
        {admissionLevel === "average" && (
          <Tag square level="average">
            Dans la moyenne
          </Tag>
        )}
      </>
      <>
        {admissionLevel === "hard" && (
          <Tag square level="hard">
            Plutôt difficile
          </Tag>
        )}
      </>
      <>
        {admissionLevel === "unknow" && (
          <Tag square level="unknow">
            Taux d’emploi inconnu
          </Tag>
        )}
      </>
    </FormationResumeBlock>
  );
}

function FormationResumeBlockEtude({ formation }: { formation: FormationDetail }) {
  const tauxPression = formation?.indicateurPoursuite?.taux_en_formation;
  const admissionLevel =
    tauxPression === undefined
      ? "unknow"
      : tauxPression >= THRESHOLD_EN_ETUDE[0]
      ? "easy"
      : tauxPression > THRESHOLD_EN_ETUDE[1]
      ? "average"
      : "hard";

  return (
    <FormationResumeBlock title={"La poursuite d'études"} icon={"ri-sun-line"}>
      <>
        {admissionLevel === "easy" && (
          <Tag square level="easy">
            Très souvent
          </Tag>
        )}
      </>
      <>
        {admissionLevel === "average" && (
          <Tag square level="average">
            Souvent
          </Tag>
        )}
      </>
      <>
        {admissionLevel === "hard" && (
          <Tag square level="hard">
            Peu souvent
          </Tag>
        )}
      </>
      <>
        {admissionLevel === "unknow" && (
          <Tag square level="unknow">
            Taux de poursuite d’études inconnu
          </Tag>
        )}
      </>
    </FormationResumeBlock>
  );
}

export default function FormationResume({
  formation,
  etablissement,
}: {
  formation: FormationDetail;
  etablissement: Etablissement;
}) {
  return (
    <Container maxWidth={false} style={{ backgroundColor: "#fff" }}>
      <Grid container spacing={2}>
        <Grid item xs={6} md={3}>
          <FormationResumeBlock title={"La formation"} icon={"ri-graduation-cap-line"}>
            {formation.voie === "scolaire" ? (
              <Tag square variant="purple-light">
                Surtout en classe
              </Tag>
            ) : (
              <>
                <Tag square variant="purple-light">
                  Surtout en entreprise
                </Tag>
                <Tag square variant="purple-light">
                  Rémunérée
                </Tag>
              </>
            )}
          </FormationResumeBlock>
        </Grid>
        <Grid item xs={6} md={3}>
          <FormationResumeBlockAdmission formation={formation} />
        </Grid>
        <Grid item xs={6} md={3}>
          <FormationResumeBlockEmploi formation={formation} />
        </Grid>
        <Grid item xs={6} md={3}>
          <FormationResumeBlockEtude formation={formation} />
        </Grid>
      </Grid>
    </Container>
  );
}
