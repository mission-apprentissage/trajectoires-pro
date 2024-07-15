"use client";
import React, { useState } from "react";
import { TextField } from "#/app/components/MaterialUINext";
import Autocomplete from "@mui/material/Autocomplete";
import { useQuery } from "@tanstack/react-query";
import { CircularProgress } from "#/app/components/MaterialUINext";
import { fetchAddress, fetchReverse } from "#/app/services/address";
import { useDebounce } from "usehooks-ts";
import Button from "@codegouvfr/react-dsfr/Button";

export default function AddressField({
  formRef,
  form: {
    field: { onChange, onBlur, value, name, ref },
    ...formProps
  },
  InputProps,
  FieldProps,
  submitOnChange,
  error,
  sx,
}: any) {
  const [isLocationLoading, setIsLocationLoading] = useState(false);

  const valueDebounce = useDebounce(value, 200);

  const { isLoading, data: options } = useQuery({
    queryKey: ["address", valueDebounce],
    queryFn: async () => {
      const result = await fetchAddress(valueDebounce);
      return result
        ? result.features.map((f: any) => {
            if (f.properties.type === "municipality") {
              return f.properties.label + " (" + f.properties.postcode + ")";
            }
            return f.properties.label;
          })
        : [];
    },
    // cacheTime: Infinity,
  });

  const getLocation = () => {
    if (navigator.geolocation) {
      setIsLocationLoading(true);
      // get the current users location
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const locations = await fetchReverse(latitude, longitude);

          setIsLocationLoading(false);

          if (locations) {
            const location = locations.features[0].properties.label;
            onChange(location);
          }
        },

        (error) => {
          setIsLocationLoading(false);
          console.error("Error getting user location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  return (
    <>
      <Autocomplete
        loading={isLoading}
        loadingText={<CircularProgress />}
        value={value}
        defaultValue={value}
        onInputChange={(e, v) => {
          onChange(v);
        }}
        onChange={(e, v) => {
          onChange(v);
          submitOnChange && formRef.current.requestSubmit();
        }}
        filterOptions={(x) => x}
        options={options || []}
        freeSolo
        sx={{
          "& .MuiOutlinedInput-root": {
            paddingRight: "10px!important",
          },
          ...sx,
        }}
        renderOption={(props, option) => {
          return (
            <li {...props} key={option}>
              {option}
            </li>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            error={!!error}
            helperText={error ? "Votre adresse n'est pas valide" : ""}
            InputLabelProps={{ shrink: true }}
            label={"Votre adresse"}
            placeholder={"Indiquez une adresse"}
            className="addressField"
            onFocus={(event) => {
              event.target.select();
            }}
            InputProps={{
              ...params.InputProps,
              type: "search",
              endAdornment: isLocationLoading ? (
                <CircularProgress />
              ) : (
                <>
                  {value && <div style={{ position: "absolute", right: "10px" }}>{params.InputProps.endAdornment}</div>}
                  {/* <Button
                    iconId="fr-icon-map-pin-2-fill"
                    onClick={getLocation}
                    priority="tertiary no outline"
                    title="Votre localisation"
                  /> */}
                </>
              ),
              ...InputProps,
            }}
            {...FieldProps}
          />
        )}
      />
    </>
  );
}
