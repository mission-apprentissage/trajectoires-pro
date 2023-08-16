"use client";
import React from "react";
import { useState, useEffect, useMemo } from "react";
import uFuzzy from "@leeoniya/ufuzzy";
import { useDebounce } from "usehooks-ts";
import { BCN } from "#/types/bcn";
import Container from "#/app/components/Container";
import ResearchFormations from "#/app/(explorer)/explorer/ResearchFormations";
import ResearchFormationsResult from "#/app/(explorer)/explorer/ResearchFormationsResult";
import useFuzzyFilter from "#/hooks/useFuzzyFilter";
import Grid from "@mui/material/Grid";
export const revalidate = 0;

export default function ResearchPage({ formations }: { formations: BCN[] }) {
  const [fuzzyQuery, queries, result, setFuzzyQuery, setQueries, resetResult] = useFuzzyFilter(
    formations,
    "libelle_full"
  );

  const [localQuery, setLocalQuery] = useState("");
  const debounceQuery = useDebounce<string>(localQuery, 500);
  useEffect(() => {
    setFuzzyQuery(debounceQuery);
  }, [setFuzzyQuery, debounceQuery]);

  const onFormationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setLocalQuery(value);
  };
  const onChangeFiliere = (filieres: string[]) => {
    setQueries({ ...queries, type: filieres });
  };
  const onChangeDiplome = (diplomes: string[]) => {
    setQueries({ ...queries, "diplome.code": diplomes });
  };

  return (
    <div
      style={{
        flex: "1 1 auto",
        flexDirection: "column",
        display: "flex",
      }}
    >
      <Container>
        <ResearchFormations
          onChange={onFormationChange}
          onChangeDiplome={onChangeDiplome}
          onChangeFiliere={onChangeFiliere}
        />
      </Container>
      <div style={{ flex: "1 1 auto" }}>
        <ResearchFormationsResult formations={result.values ?? []} labels={result.labels} />
      </div>
    </div>
  );
}
