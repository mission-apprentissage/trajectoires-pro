"use client";
import Container from "#/app/components/Container";
import SearchFormationForm, { schema as schemaFormation } from "#/app/components/form/SearchFormationForm";
import { useSearchParams } from "next/navigation";
import ResearchFormationsResult from "./ResearchFormationsResult";
import { searchParamsToObject } from "#/app/utils/searchParams";
import { fetchAddress } from "#/app/services/address";
import { Suspense, useEffect, useState } from "react";
import { fr } from "@codegouvfr/react-dsfr";
import { useQuery } from "@tanstack/react-query";

function SearchHeader() {
  return (
    <Container style={{ border: "1px solid #DDDDDD" }} nopadding={true} maxWidth={false}>
      <Container>
        <SearchFormationForm url={"/"} defaultValues={{ address: null, distance: null, time: null }} />
      </Container>
    </Container>
  );
}

function SearchResult() {
  const searchParams = useSearchParams();
  const { address, distance, time } = searchParamsToObject(
    searchParams,
    { address: null, distance: 1, time: null },
    schemaFormation
  );

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

  return (
    coordinate && (
      <ResearchFormationsResult
        longitude={coordinate[0]}
        latitude={coordinate[1]}
        distance={distance * 1000}
        time={time * 60}
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
        <SearchResult />
      </Suspense>
    </>
  );
}
