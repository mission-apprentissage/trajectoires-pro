import { fr } from "@codegouvfr/react-dsfr";
import { Typography, Grid } from "@mui/material";

export default function TagPercent({
  value,
  text,
  subText,
  bgColor,
}: {
  value: number;
  text: string;
  subText: string;
  bgColor: string;
}) {
  return (
    <Grid item xs={12} container alignItems={"center"} spacing={2}>
      <Grid item xs={2} style={{ maxWidth: "4rem" }}>
        <Typography
          align="center"
          style={{ backgroundColor: bgColor, color: "#ffffff", padding: fr.spacing("1v"), borderRadius: "5px" }}
          variant="h6"
        >
          {value}%
        </Typography>
      </Grid>
      <Grid item xs={10}>
        <Typography variant="body1">{text}</Typography>
        <Typography variant="body2">{subText}</Typography>
      </Grid>
    </Grid>
  );
}
