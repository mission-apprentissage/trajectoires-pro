"use client";
import Button from "@codegouvfr/react-dsfr/Button";
import { Grid } from "#/app/components/MaterialUINext";
import { Controller } from "react-hook-form";
import * as yup from "yup";
import { Nullable } from "#/app/utils/types";
import FormSearchParams from "./FormSearchParams";
import AddressField from "./AddressField";
import DistanceField from "./DistanceField";

export type SearchFormationFormData = {
  address: string;
  distance: number;
};

export const schema: yup.ObjectSchema<SearchFormationFormData> = yup
  .object({
    address: yup.string().required(),
    distance: yup.number().required(),
  })
  .required();

export default function SearchFormationForm({
  url,
  defaultValues,
}: {
  url: string;
  defaultValues: Nullable<SearchFormationFormData>;
}) {
  return (
    <FormSearchParams url={url} defaultValues={defaultValues} schema={schema}>
      {({ control, errors }) => {
        return (
          <Grid container spacing={2}>
            <Grid item md={6} xs={6}>
              <Controller
                name="address"
                control={control}
                render={(form) => <AddressField error={errors?.address} form={form} />}
              />
            </Grid>
            <Grid item md={2} xs={2}>
              <Controller
                name="distance"
                control={control}
                render={(form) => <DistanceField error={errors?.distance} form={form} />}
              />
            </Grid>
            <Grid item md={4} xs={4} style={{ textAlign: "left" }}>
              <Button type={"submit"} style={{ height: "100%" }} className="fr-btn-fix" iconId={"fr-icon-search-line"}>
                {"Rechercher des formations"}
              </Button>
            </Grid>
          </Grid>
        );
      }}
    </FormSearchParams>
  );
}