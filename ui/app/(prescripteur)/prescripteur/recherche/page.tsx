"use client";
import ResearchFormationsResult from "./ResearchFormationsResult";
import { fetchAddress } from "#/app/services/address";
import { Suspense, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import FormationsSearchProvider, { useFormationsSearch } from "../../context/FormationsSearchContext";
import SearchHeader from "../../components/SearchHeader";
import Title from "../../components/Title";
import Loader from "#/app/components/Loader";
import ErrorUserGeolocation from "../../errors/ErrorUserGeolocation";
import ErrorAddressInvalid from "../../errors/ErrorAddressInvalid";
import UserGeolocatioDenied from "../../components/UserGeolocatioDenied";
import { Box, Grid } from "#/app/components/MaterialUINext";
import Slider from "react-slick";
import { capitalize } from "lodash-es";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FormationDomaine } from "#/types/formation";
import { FORMATION_DOMAINE } from "#/app/services/formation";
import Button from "#/app/components/Button";

function DomainesSlider({ selected }: { selected?: FormationDomaine | null }) {
  const { params, updateParams } = useFormationsSearch();
  const sliderRef = useRef<Slider>(null);
  const index = FORMATION_DOMAINE.findIndex(({ domaine, isAll }) => {
    return (!selected && isAll) || selected === domaine;
  });

  var settings = {
    className: "slider variable-width",
    dots: false,
    infinite: false,
    slidesToShow: 1,
    slidesToScroll: 3,
    variableWidth: true,
    arrows: false,
    swipeToSlide: true,
    initialSlide: index >= 2 ? index - 2 : 0,
  };

  useEffect(() => {
    sliderRef?.current?.slickGoTo(index >= 2 ? index - 2 : 0, true);
  }, [sliderRef, index]);

  return (
    <Box style={{ display: "flex" }}>
      <Box style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Button
          iconOnly
          size="large"
          rounded
          iconId="fr-icon-arrow-left-s-first-line"
          onClick={() => sliderRef?.current?.slickPrev()}
          priority="tertiary no outline"
          title="Domaines de formations précédents"
          style={{
            border: "1px solid var(--text-action-high-blue-france)",
          }}
        />
      </Box>
      <Box style={{ flex: "1 1 auto", marginLeft: "1rem", marginRight: "1rem", overflow: "hidden" }}>
        <Slider key={selected} ref={sliderRef} {...settings}>
          {FORMATION_DOMAINE.map(({ domaine, isAll }) => {
            return (
              <Box key={domaine}>
                <Box style={{ marginLeft: isAll ? "0" : "0.5rem", marginRight: "0.5rem" }}>
                  <Button
                    priority={(!selected && isAll) || selected === domaine ? undefined : "tertiary no outline"}
                    size="small"
                    rounded
                    onClick={() => {
                      if (!params) {
                        return;
                      }

                      updateParams({
                        ...params,
                        domaine: isAll ? undefined : domaine,
                      });
                    }}
                  >
                    {capitalize(domaine)}
                  </Button>
                </Box>
              </Box>
            );
          })}
        </Slider>
      </Box>
      <Box style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Button
          iconOnly
          size="large"
          rounded
          iconId="fr-icon-arrow-right-s-last-line"
          onClick={() => sliderRef?.current?.slickNext()}
          priority="tertiary no outline"
          title="Domaines de formations suivants"
          style={{ border: "1px solid var(--text-action-high-blue-france)" }}
        />
      </Box>
    </Box>
  );
}

function ResearchFormationsParameter() {
  const { params } = useFormationsSearch();
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
          sx={{ padding: { md: "2rem", xs: "1rem" }, paddingLeft: { md: "5rem" }, paddingRight: { md: "5rem" } }}
        >
          <DomainesSlider selected={domaine} />
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
