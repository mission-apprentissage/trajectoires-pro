"use client";
import ResearchFormationsResult from "./ResearchFormationsResult";
import { fetchAddress } from "#/app/services/address";
import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import FormationsSearchProvider, { useFormationsSearch } from "../context/FormationsSearchContext";
import SearchHeader from "../components/SearchHeader";

function ResearchFormationsParameter() {
  const { params } = useFormationsSearch();
  const { address, distance = 10, time = 15, tag } = params ?? {};

  const { data: coordinate } = useQuery({
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
        throw new Error("Addresse invalide.");
      }

      return addressCoordinate.features[0].geometry.coordinates;
    },
  });

  if (!params) {
    return null;
  }

  return (
    coordinate && (
      <ResearchFormationsResult
        longitude={coordinate[0]}
        latitude={coordinate[1]}
        distance={distance * 1000}
        time={time * 60}
        tag={tag}
        page={1}
      />
    )
  );
}

export default function Page() {
  return (
    <>
      <SearchHeader />
      <Suspense>
        <FormationsSearchProvider>
          <ResearchFormationsParameter />
        </FormationsSearchProvider>
      </Suspense>
    </>
  );
}
