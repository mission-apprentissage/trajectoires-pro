"use client";
import Container from "#/app/components/Container";
import SearchFormationHomeForm from "#/app/components/form/SearchFormationHomeForm";
import { Grid } from "#/app/components/MaterialUINext";

export default function SearchHeader() {
  return (
    <Container nopadding={true} maxWidth={false}>
      <Grid container spacing={0}>
        <Grid
          item
          xs={12}
          lg={10}
          xl={8}
          sx={{ padding: { md: "2rem", xs: "1rem" }, paddingLeft: { md: "5rem" }, paddingRight: { md: "5rem" } }}
        >
          <SearchFormationHomeForm
            url={"/recherche"}
            defaultValues={{ address: null, distance: 10, time: 90 }}
            bordered
          />
        </Grid>
      </Grid>
    </Container>
  );
}
