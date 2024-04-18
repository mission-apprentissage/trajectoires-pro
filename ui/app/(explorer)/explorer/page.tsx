"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { BCN, BCNResearch } from "#/types/bcn";
import { Paginations } from "#/types/pagination";
import ResearchPage from "./ResearchPage";

async function bcn(items_par_page: number): Promise<BCNResearch[]> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const paginateBCNs = await fetch(API_BASE_URL + "/exposition/bcn?items_par_page=" + items_par_page);
  const json: Paginations<"bcn", BCN> = await paginateBCNs.json();
  return json.bcn.map((b: BCN) => ({
    ...b,
    libelle_full: `${b.libelle_long} ${b.code_formation_diplome} ${b.code_certification}`,
  })) as BCNResearch[];
}

export default function Page() {
  const { isLoading, data } = useQuery({
    queryKey: ["bcn"],
    queryFn: () => bcn(100000),
    staleTime: Infinity,
    cacheTime: Infinity,
  });

  if (isLoading) {
    return <>Loading</>;
  }
  return <ResearchPage formations={data ?? []} />;
}
