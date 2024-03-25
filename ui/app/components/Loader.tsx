import { CircularProgress, Grid } from "#/app/components/MaterialUINext";
import { CSSProperties } from "react";

export default function Loader({ style }: { style?: CSSProperties | undefined }) {
  return (
    <Grid container style={style} spacing={0} direction="column" alignItems="center" justifyContent="center">
      <Grid item xs={3}>
        <CircularProgress />
      </Grid>
    </Grid>
  );
}
