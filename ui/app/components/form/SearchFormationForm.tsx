"use client";

import { Grid } from "#/app/components/MaterialUINext";
import { Controller } from "react-hook-form";
import * as yup from "yup";
import { Nullable } from "#/app/utils/types";
import FormSearchParams from "./FormSearchParams";
import AddressField from "./AddressField";
import DistanceField from "./DistanceField";
import TimeField from "./TimeField";
import Button from "../Button";

export type SearchFormationFormData = {
  address: string;
  time: number;
  distance: number;
};

export const schema: yup.ObjectSchema<SearchFormationFormData> = yup
  .object({
    address: yup.string().required(),
    time: yup.number().required(),
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
            <Grid item md={6} xs={8}>
              <Controller
                name="address"
                control={control}
                render={(form) => <AddressField error={errors?.address} form={form} />}
              />
            </Grid>
            <Grid item md={2} xs={2} style={{ display: "none" }}>
              <Controller
                name="distance"
                control={control}
                render={(form) => <DistanceField error={errors?.distance} form={form} />}
              />
            </Grid>
            <Grid item md={2} xs={2}>
              <Controller
                name="time"
                control={control}
                render={(form) => <TimeField error={errors?.time} form={form} />}
              />
            </Grid>
            <Grid item md={4} xs={2} style={{ textAlign: "left" }}>
              <Button
                type={"submit"}
                smallIconOnly={true}
                style={{ height: "100%", width: "100%" }}
                iconId={"fr-icon-search-line"}
              >
                {"Rechercher des formations"}
              </Button>
            </Grid>
          </Grid>
        );
      }}
    </FormSearchParams>
  );
}
