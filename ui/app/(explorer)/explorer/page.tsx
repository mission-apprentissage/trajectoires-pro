"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { BCN } from "#/types/bcn";
import ResearchPage from "./ResearchPage";
export const revalidate = 0;

async function bcn(items_par_page: number): Promise<BCN[]> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const paginateBCNs = await fetch(API_BASE_URL + "/exposition/bcn?items_par_page=" + items_par_page);
  const json = await paginateBCNs.json();
  return json.bcn.map((b: BCN) => ({
    libelle_full: `${b.libelle_long} ${b.code_formation_diplome} ${b.code_certification}`,
    ...b,
  })) as BCN[];
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
