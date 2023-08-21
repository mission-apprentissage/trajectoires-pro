import { fr } from "@codegouvfr/react-dsfr";
import LinearProgress from "@mui/material/LinearProgress";
import { EtablissementStat } from "#/services/inserjeunes/types";
import { Typography, Grid } from "@mui/material";

export default function EtablissementStats({ stats }: { stats: EtablissementStat }) {
  return (
    <Grid container sx={{ mt: fr.spacing("12v") }}>
      <Grid item xs={12}>
        <Typography variant="h3">Pourcentage de lycéens en poste</Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container columnSpacing={6} sx={{ my: fr.spacing("8v") }}>
          <Grid item>
            <Grid container spacing={2}>
              <Grid item>
                <Typography variant={"h1"}>{stats?.taux_en_emploi_6_mois}%</Typography>
              </Grid>
              <Grid item>
                <Typography fontWeight="bold" variant={"body1"}>
                  des lycéens sont en emploi
                </Typography>
                <Typography fontWeight="bold" variant={"body2"}>
                  dans les 6 mois après leurs sorties
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          <Grid item>
            <Grid container spacing={2}>
              <Grid item>
                <Typography variant={"h1"}>
                  {stats?.diff_taux_6_mois_regional > 0 ? "+" : ""}
                  {stats?.diff_taux_6_mois_regional}%
                </Typography>
              </Grid>
              <Grid item>
                <Typography fontWeight="bold" variant={"body1"}>
                  de lycéens en emploi
                </Typography>
                <Typography fontWeight="bold" variant={"body2"}>
                  comparé à la moyenne local
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <LinearProgress
          style={{
            height: "3rem",
            width:
              (stats.taux_en_emploi_6_mois > stats.taux_en_emploi_6_mois_regional
                ? stats.taux_en_emploi_6_mois
                : stats.taux_en_emploi_6_mois_regional) + "%",
          }}
          variant="determinate"
          sx={{
            color: stats.taux_en_emploi_6_mois > stats.taux_en_emploi_6_mois_regional ? "blue" : "red",
          }}
          color={"inherit"}
          value={(100 / stats.taux_en_emploi_6_mois) * (stats.taux_en_emploi_6_mois - stats?.diff_taux_6_mois_regional)}
        />
      </Grid>
    </Grid>
  );
}
