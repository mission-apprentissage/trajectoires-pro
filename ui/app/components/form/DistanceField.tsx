"use client";
import React from "react";
import { TextField } from "#/app/components/MaterialUINext";
import Autocomplete from "@mui/material/Autocomplete";

export default function DistanceField({
  form: {
    field: { onChange, onBlur, value, name, ref, ...rest },
    ...formProps
  },
  error,
}: any) {
  const options = ["1", "5", "10"];

  return (
    <>
      <Autocomplete
        value={value}
        defaultValue={value}
        onInputChange={(e, v) => onChange(v)}
        onChange={(e, v) => onChange(v)}
        getOptionLabel={(option) => option.toString()}
        filterOptions={(x) => x}
        options={options}
        freeSolo
        sx={{
          "& .MuiOutlinedInput-root": {
            paddingRight: "10px!important",
          },
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
            helperText={error ? "La distance n'est pas valide" : ""}
            InputLabelProps={{ shrink: true }}
            label={"Distance (km)"}
            placeholder={"Indiquez une distance (km)"}
            onFocus={(event) => {
              event.target.select();
            }}
            InputProps={{
              ...params.InputProps,
              type: "search",
            }}
          />
        )}
      />
    </>
  );
}
