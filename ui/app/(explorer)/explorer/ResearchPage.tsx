"use client";
import React, { useCallback } from "react";
import { useState, useEffect, useMemo } from "react";
import uFuzzy from "@leeoniya/ufuzzy";
import { useDebounce } from "usehooks-ts";
import { BCNResearch } from "#/types/bcn";
import Container from "#/app/components/Container";
import ResearchFormations from "#/app/(explorer)/explorer/ResearchFormations";
import ResearchFormationsResult from "#/app/(explorer)/explorer/ResearchFormationsResult";
import useFuzzyFilter from "#/hooks/useFuzzyFilter";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Grid from "@mui/material/Grid";
export const revalidate = 0;

export default function ResearchPage({ formations }: { formations: BCNResearch[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  const params = useMemo(() => {
    const regionsParams = searchParams.get("regions");
    const diplomesParams = searchParams.get("diplomes");
    const filieresParams = searchParams.get("filieres");
    return {
      formations: searchParams.get("formations") || "",
      regions: regionsParams ? regionsParams.split(",") : [],
      diplomes: diplomesParams ? diplomesParams.split(",") : [],
      filieres: filieresParams ? filieresParams.split(",") : [],
    };
  }, [searchParams]);

  const [fuzzyQuery, queries, result, setFuzzyQuery, setQueries, resetResult] = useFuzzyFilter(
    formations,
    "libelle_full"
  );

  const [localQuery, setLocalQuery] = useState(params.formations);
  const debounceQuery = useDebounce<string>(localQuery, 500);
  useEffect(() => {
    router.push(pathname + "?" + createQueryString("formations", debounceQuery));
  }, [setFuzzyQuery, debounceQuery, pathname, createQueryString, router]);

  const [regions, setRegions] = useState<string[]>([]);

  const onFormationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setLocalQuery(value);
  };
  const onChangeFiliere = (filieres: string[]) => {
    router.push(pathname + "?" + createQueryString("filieres", filieres.join(",")));
  };
  const onChangeDiplome = (diplomes: string[]) => {
    router.push(pathname + "?" + createQueryString("diplomes", diplomes.join(",")));
  };
  const onRegionChange = (regions: string[]) => {
    router.push(pathname + "?" + createQueryString("regions", regions.join(",")));
  };

  useEffect(() => {
    setFuzzyQuery(params.formations);
    setRegions(params.regions);
    setQueries({ type: params.filieres, "diplome.code": params.diplomes });
  }, [params, setFuzzyQuery, setRegions, setQueries]);

  return (
    <div
      style={{
        flex: "1 1 auto",
        flexDirection: "column",
        display: "flex",
      }}
    >
      <Container maxWidth={"xl"}>
        <ResearchFormations
          initialState={params}
          onChange={onFormationChange}
          onChangeDiplome={onChangeDiplome}
          onChangeFiliere={onChangeFiliere}
          onChangeRegion={onRegionChange}
        />
      </Container>
      <div style={{ flex: "1 1 auto" }}>
        <ResearchFormationsResult regions={regions} formations={result.values ?? []} labels={result.labels} />
      </div>
    </div>
  );
}
