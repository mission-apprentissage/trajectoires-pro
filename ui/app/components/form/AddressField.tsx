"use client";
import React, { HTMLAttributes, useState } from "react";
import { TextField, Typography } from "#/app/components/MaterialUINext";
import Autocomplete from "@mui/material/Autocomplete";
import { useQuery } from "@tanstack/react-query";
import { CircularProgress } from "#/app/components/MaterialUINext";
import { fetchAddress } from "#/app/services/address";
import { useDebounce } from "usehooks-ts";
import Popper, { PopperProps } from "@mui/material/Popper";
import { fr } from "@codegouvfr/react-dsfr";

export const myPosition = "Autour de moi";

const ListboxComponent = React.forwardRef<HTMLUListElement>(function ListboxComponent(
  props: HTMLAttributes<HTMLElement>,
  ref
) {
  const { children, style, ...other } = props;

  return (
    <div>
      <ul {...other} ref={ref}>
        {children}
      </ul>
      <Typography variant="body3" style={{ padding: "1rem" }}>
        Adresse non trouvée ? (TODO)Envoyer une alerte aux équipes.
      </Typography>
    </div>
  );
});

const CustomPopper = (props: PopperProps) => {
  return (
    <Popper
      {...props}
      placement="bottom-start"
      sx={{
        marginTop: "18px !important",
        marginLeft: { xs: "-16px !important", md: "-18px !important" },
        "& .MuiPaper-root": {
          boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.2)",
        },
      }}
      style={{
        width: "calc(100%)",
      }}
    />
  );
};

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
      if (!valueDebounce) {
        return [myPosition];
      }

      const result = await fetchAddress(valueDebounce.label);
      return result
        ? [
            myPosition,
            ...result.features.map((f: any) => {
              const label =
                f.properties.type === "municipality"
                  ? f.properties.label + " (" + f.properties.postcode + ")"
                  : f.properties.label;
              return label;
            }),
          ]
        : [myPosition];
    },
    // cacheTime: Infinity,
  });

  return (
    <>
      <Autocomplete
        loading={isLoading}
        loadingText={<CircularProgress />}
        value={value}
        defaultValue={value}
        onInputChange={(e, v) => {
          onChange({ label: v });
        }}
        onChange={(e, v) => {
          onChange(v);
          submitOnChange && formRef.current.requestSubmit();
        }}
        filterOptions={(x) => x}
        options={options || []}
        freeSolo
        disablePortal
        sx={{
          "& .MuiOutlinedInput-root": {
            paddingRight: "10px!important",
          },
          ...sx,
        }}
        PopperComponent={CustomPopper}
        ListboxComponent={ListboxComponent as React.ComponentType<React.HTMLAttributes<HTMLElement>>}
        renderOption={(props, option) => {
          const { key, ...rest } = props;

          return (
            <li
              key={option}
              {...rest}
              style={{ color: option === myPosition ? "var(--blue-france-sun-113-625-hover)" : "" }}
            >
              <i
                className={option === myPosition ? fr.cx("ri-map-pin-5-line") : fr.cx("ri-map-pin-line")}
                style={{
                  borderRadius: "3px",
                  padding: fr.spacing("1v"),
                  marginRight: fr.spacing("3v"),
                  backgroundColor: "var(--info-950-100)",
                  color: "var(--blue-france-sun-113-625-hover)",
                }}
              ></i>
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
