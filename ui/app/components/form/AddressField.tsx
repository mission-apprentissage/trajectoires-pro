"use client";
import React, { HTMLAttributes, useState } from "react";
import { Box, TextField, Typography } from "#/app/components/MaterialUINext";
import Autocomplete from "@mui/material/Autocomplete";
import { useQuery } from "@tanstack/react-query";
import { CircularProgress } from "#/app/components/MaterialUINext";
import { fetchAddress } from "#/app/services/address";
import { useThrottle } from "@uidotdev/usehooks";
import Popper, { PopperProps } from "@mui/material/Popper";
import { fr } from "@codegouvfr/react-dsfr";
import Link from "../Link";

export const myPosition = "Autour de moi";

const ListboxComponent = React.forwardRef<HTMLUListElement>(function ListboxComponent(
  props: HTMLAttributes<HTMLElement>,
  ref
) {
  const { children, style, ...other } = props;

  return (
    <div className="listbox-container">
      <ul {...other} ref={ref}>
        {children}
      </ul>
      <Typography
        onMouseDown={(event) => {
          // Prevent blur
          event.preventDefault();
        }}
        className="listbox-footer"
        variant="body3"
        style={{ padding: "1rem" }}
      >
        Adresse non trouvée ?{" "}
        <Link target="_blank" href="https://adresse.data.gouv.fr/nous-contacter">
          Envoyer une alerte aux équipes.
        </Link>
      </Typography>
    </div>
  );
});

const CustomPopper = ({ isMobile, isFocus, ...props }: PopperProps & { isFocus: boolean; isMobile: boolean }) => {
  const { children, className, placement = "bottom" } = props;

  return isFocus && isMobile ? (
    <Box
      className={className}
      sx={{
        flex: " 1 1 auto",
        "& .MuiPaper-root": {
          height: "100%",
        },
        "& .MuiAutocomplete-listbox": {
          overflowY: "auto",
          height: "0px",
          maxHeight: "100%",
          flex: "1 1 auto",
        },
        "& .listbox-container": {
          display: "flex",
          flexDirection: "column",
          height: "100%",
        },
        "& .listbox-footer": {
          flex: "0 1 auto",
        },
      }}
      style={{ position: "static" }}
    >
      {typeof children === "function" ? children({ placement }) : children}
    </Box>
  ) : (
    <Popper
      {...props}
      placement="bottom-start"
      sx={{
        marginTop: "18px !important",
        marginLeft: { md: "-18px !important" },
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
  isMobile,
  defaultValues,
}: any) {
  const [isFocus, setIsFocus] = useState(false);

  const [isLocationLoading, setIsLocationLoading] = useState(false);

  const valueDebounce = useThrottle(value, 300);

  const { isLoading, data: options } = useQuery({
    keepPreviousData: true,
    // TODO : type
    placeholderData: (previousData: any) => {
      return previousData;
    },
    queryKey: ["address", valueDebounce],
    queryFn: async () => {
      if (!valueDebounce || valueDebounce === myPosition) {
        return [myPosition, ...(defaultValues ?? [])];
      }

      const result = await fetchAddress(valueDebounce);
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
        : [myPosition, ...(defaultValues ?? [])];
    },
    cacheTime: Infinity,
  });

  return (
    <div
      style={{
        width: "100%",
        borderRadius: "5px",
        backgroundColor: "white",
        ...(isFocus && isMobile
          ? {
              position: "fixed",
              top: "0",
              left: 0,
              height: "100vh",
              zIndex: 9999,
              display: "flex",
              flexFlow: "column",
            }
          : {}),
      }}
    >
      <Autocomplete
        loading={isLoading}
        loadingText={<CircularProgress />}
        value={value}
        defaultValue={value}
        open={isFocus}
        onOpen={(e) => {
          setIsFocus(true);
        }}
        onBlur={(e) => {
          setIsFocus(false);
        }}
        onInputChange={(e, v) => {
          onChange(v);
        }}
        onChange={(e, v) => {
          onChange(v);
          submitOnChange && formRef.current.requestSubmit();
          setIsFocus(false);
        }}
        filterOptions={(x) => x}
        options={options || []}
        freeSolo
        disablePortal
        sx={{
          "& .MuiOutlinedInput-root": {
            paddingRight: "10px!important",
          },
          ...(isFocus && isMobile
            ? {
                flex: " 0 1 auto",
                borderRadius: "5px",
                border: "2px solid var(--blue-france-sun-113-625-hover)",
                margin: "1rem",
              }
            : {}),
          ...sx,
        }}
        PopperComponent={(props) => <CustomPopper isFocus={isFocus} isMobile={isMobile} {...props} />}
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
            label={isMobile && isFocus ? "" : "Ton adresse, ta ville"}
            placeholder={"Saisir sa ville, son adresse"}
            className="addressField"
            onFocus={(event) => {
              event.target.select();
              setIsFocus(true);
            }}
            InputProps={{
              ...params.InputProps,
              type: "search",
              startAdornment:
                isMobile && isFocus ? (
                  <i
                    onClick={(e) => {
                      setIsFocus(false);
                    }}
                    style={{ marginRight: "1rem" }}
                    className={fr.cx("ri-arrow-left-s-line")}
                  ></i>
                ) : (
                  <></>
                ),
              endAdornment: isLocationLoading ? (
                <CircularProgress />
              ) : (
                <>
                  {value && <div style={{ position: "absolute", right: "10px" }}>{params.InputProps.endAdornment}</div>}
                </>
              ),
              ...InputProps,
            }}
            variant={"standard"}
            {...FieldProps}
          />
        )}
      />
    </div>
  );
}
