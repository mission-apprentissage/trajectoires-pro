"use client";
import Container from "#/app/components/Container";
import SearchFormationForm from "#/app/components/form/SearchFormationForm";
import ResearchFormationsResult from "./ResearchFormationsResult";
import { fetchAddress } from "#/app/services/address";
import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import FormationsSearchProvider, { useFormationsSearch } from "../context/FormationsSearchContext";

function SearchHeader() {
  return (
    <Container style={{ border: "1px solid #DDDDDD" }} nopadding={true} maxWidth={false}>
      <Container>
        <SearchFormationForm url={"/"} defaultValues={{ address: null, distance: 10, time: null }} />
      </Container>
    </Container>
  );
}

function SearchResult() {
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
          <SearchResult />
        </FormationsSearchProvider>
      </Suspense>
    </>
  );
}
