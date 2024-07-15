"use client";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Grid } from "#/app/components/MaterialUINext";
import { Controller } from "react-hook-form";
import { Nullable } from "#/app/utils/types";
import FormSearchParams from "./FormSearchParams";
import AddressField from "./AddressField";
import DistanceField from "./DistanceField";
import TimeField from "./TimeField";
import Button from "../Button";
import { SearchFormationFormData, schema } from "./SearchFormationForm";
import { Box, Theme, useTheme } from "@mui/material";

export default function SearchFormationHomeForm({
  url,
  defaultValues,
}: {
  url: string;
  defaultValues: Nullable<SearchFormationFormData>;
}) {
  const isDownSm = useMediaQuery<Theme>((theme) => theme.breakpoints.down("sm"));

  return (
    <FormSearchParams url={url} defaultValues={defaultValues} schema={schema} forceValues={{ tag: "" }}>
      {({ control, errors, formRef }) => {
        return (
          <Grid container spacing={0} style={{ backgroundColor: "#FFFFFF", padding: "18px", paddingRight: "24px" }}>
            <Grid item md={8} sm={8} xs={12}>
              <Controller
                name="address"
                control={control}
                render={(form) => (
                  <AddressField
                    FieldProps={{ variant: "standard", label: "Ton adresse, ta ville" }}
                    InputProps={{
                      disableUnderline: true,
                    }}
                    error={errors?.address}
                    form={form}
                    formRef={formRef}
                    submitOnChange={isDownSm}
                  />
                )}
              />
            </Grid>
            <Grid item md={2} xs={2} style={{ display: "none" }}>
              <Controller
                name="distance"
                control={control}
                render={(form) => <DistanceField error={errors?.distance} form={form} />}
              />
            </Grid>
            <Grid item md={2} sm={2} xs={6} style={{ display: "none" }}>
              <Controller
                name="time"
                control={control}
                render={(form) => <TimeField error={errors?.time} form={form} />}
              />
            </Grid>
            <Grid item md={4} sm={4} xs={12} style={{ textAlign: "left" }}>
              {!isDownSm && (
                <Box sx={{ display: { xs: "none", md: "block" } }}>
                  <Button
                    type={"submit"}
                    style={{
                      borderRadius: "26px",
                      height: "100%",
                      width: "100%",
                      backgroundColor: "var(--blue-france-sun-113-625-hover)",
                      fontSize: "20px",
                      lineHeight: "32px",
                      justifyContent: "center",
                    }}
                  >
                    {"Explorer"}
                  </Button>
                </Box>
              )}
            </Grid>
          </Grid>
        );
      }}
    </FormSearchParams>
  );
}
