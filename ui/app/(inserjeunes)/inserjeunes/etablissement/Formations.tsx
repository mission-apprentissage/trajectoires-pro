import { fr } from "@codegouvfr/react-dsfr";
import { Formation as FormationType } from "#/services/exposition/types";
import { Typography, Grid } from "@mui/material";
import { useMemo } from "react";
import Formation from "./Formation";

type FormationPerCode = {
  formations: { [key: string]: { millesimes: { [key: string]: FormationType } } };
  millesimes: string[];
};

export default function Formations({ formations }: { formations: FormationType[] }) {
  const formationsPerCode = useMemo<FormationPerCode>(() => {
    const millesimes = new Set<string>();
    return {
      formations: formations.reduce((acc, formation) => {
        millesimes.add(formation.millesime);
        acc[formation.code_certification] = acc[formation.code_certification] || {
          millesimes: {},
        };
        acc[formation.code_certification].millesimes[formation.millesime] = formation;

        return acc;
      }, {}),
      millesimes: Array.from(millesimes.values()).sort(),
    };
  }, [formations]);
  const lastMillesime = useMemo(() => {
    return formationsPerCode.millesimes[formationsPerCode.millesimes.length - 1].split("_");
  }, [formationsPerCode]);

  return (
    <Grid container sx={{ mt: fr.spacing("12v") }} rowSpacing={fr.spacing("18v")}>
      <Grid item xs={12}>
        <Typography variant="h3">Que deviennent les apprenants après ces formations ?</Typography>
        <Typography variant="body1" style={{ fontWeight: "bold", fontStyle: "italic" }}>
          Statistiques pour les années {lastMillesime[0]} et {lastMillesime[1]} cumulées
        </Typography>
      </Grid>
      <Grid item xs={12} container spacing={fr.spacing("12v")}>
        {Object.values(formationsPerCode.formations).map((formation, index) => (
          <Grid key={index} item md={6} xs={12}>
            <Formation formation={formation} millesime={lastMillesime[0] + "_" + lastMillesime[1]} />
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
}
