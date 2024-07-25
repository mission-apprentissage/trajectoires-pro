"use client";
import ResearchFormationsResult from "./ResearchFormationsResult";
import { fetchAddress } from "#/app/services/address";
import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import FormationsSearchProvider, { useFormationsSearch } from "../../context/FormationsSearchContext";
import SearchHeader from "../../components/SearchHeader";
import Title from "../../components/Title";
import Loader from "#/app/components/Loader";
import ErrorUserGeolocation from "../../errors/ErrorUserGeolocation";
import ErrorAddressInvalid from "../../errors/ErrorAddressInvalid";
import UserGeolocatioDenied from "../../components/UserGeolocatioDenied";
import { Grid } from "#/app/components/MaterialUINext";
import { capitalize } from "lodash-es";
import { FormationDomaine } from "#/types/formation";
import { FORMATION_DOMAINE } from "#/app/services/formation";
import OptionsCarousel from "#/app/components/form/OptionsCarousel";

function ResearchFormationsParameter() {
  const { params, updateParams } = useFormationsSearch();
  const { address, distance = 10, time = 15, tag, domaine } = params ?? {};

  const {
    data: coordinate,
    isLoading,
    error,
  } = useQuery({
    staleTime: Infinity,
    cacheTime: Infinity,
    retry: 0,
    queryKey: ["coordinate", address],
    queryFn: async ({ signal }) => {
      if (!address) {
        return null;
      }

      const addressCoordinate = await fetchAddress(address);
      if (!addressCoordinate?.features) {
        // TODO: manage address fetch error
        throw new ErrorAddressInvalid();
      }

      return addressCoordinate.features[0].geometry.coordinates;
    },
  });

  if (!params) {
    return null;
  }

  if (error && error instanceof ErrorUserGeolocation) {
    return <UserGeolocatioDenied />;
  }

  if (isLoading) {
    return <Loader withMargin />;
  }
  return (
    <>
      <Grid container spacing={0}>
        <Grid
          item
          xs={12}
          lg={12}
          xl={12}
          sx={{
            border: "1px solid #DDDDDD",
            boxShadow: "0 4px 4px -4px #00000040",
            padding: { md: "2rem", xs: "1rem" },
            paddingLeft: { md: "1.75" },
            paddingRight: { md: "1.75" },
            zIndex: 99,
          }}
        >
          <OptionsCarousel
            defaultValue={FormationDomaine["tout"]}
            selected={domaine ? [domaine] : []}
            options={FORMATION_DOMAINE.map(({ domaine, isAll }) => ({
              option: capitalize(domaine),
              value: domaine,
            }))}
            onClick={(selected) => {
              if (!params) {
                return;
              }

              updateParams({
                ...params,
                domaine: selected === FormationDomaine["tout"] || selected === domaine ? undefined : selected,
              });
            }}
          />
        </Grid>
      </Grid>
      {coordinate && (
        <ResearchFormationsResult
          longitude={coordinate[0]}
          latitude={coordinate[1]}
          distance={distance * 1000}
          time={time * 60}
          tag={tag}
          domaine={domaine}
          page={1}
        />
      )}
    </>
  );
}

export default function Page() {
  return (
    <>
      <Title pageTitle="Recherche de formations" />
      <Suspense>
        <SearchHeader />
        <FormationsSearchProvider>
          <ResearchFormationsParameter />
        </FormationsSearchProvider>
      </Suspense>
    </>
  );
}
