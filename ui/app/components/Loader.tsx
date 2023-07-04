import { CircularProgress, Grid } from "#/app/components/MaterialUINext";

export default function Loader() {
  return (
    <Grid container spacing={0} direction="column" alignItems="center" justifyContent="center">
      <Grid item xs={3}>
        <CircularProgress />
      </Grid>
    </Grid>
  );
}
