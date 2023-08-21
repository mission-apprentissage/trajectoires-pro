import { fr } from "@codegouvfr/react-dsfr";
import { Formation as FormationType } from "#/services/exposition/types";
import { Typography, Grid } from "@mui/material";
import TagPercent from "#/app/components/TagPercent";

export default function Formation({
  formation,
  millesime,
}: {
  formation: { millesimes: { [key: string]: FormationType } };
  millesime: string;
}) {
  const current = formation.millesimes[millesime] || null;
  const exist = current || Object.values(formation.millesimes)[0];

  return (
    <Grid item xs={12} container rowSpacing={2}>
      <Grid item xs={12}>
        <Typography variant="h5" style={{ color: "var(--info-425-625)" }}>
          {exist.libelle_long}
        </Typography>
      </Grid>
      <Grid item xs={12} container rowSpacing={2}>
        {current ? (
          <>
            <TagPercent
              bgColor="#6C6CE9"
              text="sont en emploi 6 mois après la fin de la formation"
              subText="(tout type d'emploi salarié du privé)"
              value={current.taux_en_emploi_6_mois}
            />

            <TagPercent
              bgColor="#010B82"
              text="sont inscrits en formation"
              subText="(formation supérieure, redoublants, changement de filière"
              value={current.taux_en_formation}
            />

            <TagPercent
              bgColor="#2863C8"
              text="sont dans d'autres situations"
              subText="(recherche d'emploi, service civique à l'étranger, indépendant, etc.)"
              value={current.taux_autres_6_mois}
            />
          </>
        ) : (
          <Typography variant="body1" style={{ fontWeight: "bold" }} sx={{ mt: fr.spacing("4v") }}>
            {"Nous n'avons pas de données disponibles pour ce millésime."}
          </Typography>
        )}
      </Grid>
    </Grid>
  );
}
