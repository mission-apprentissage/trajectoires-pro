"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_SortingState,
  type MRT_Virtualizer,
} from "material-react-table";
import { useQuery } from "@tanstack/react-query";
import { chunk, flatten } from "lodash-es";
import { AutoSizer } from "react-virtualized";
import { Typograhpy, Grid, Box } from "../../components/MaterialUINext";
import { BCN } from "#/types/bcn";
import { Certification } from "#/types/certification";
export const revalidate = 0;

const MILLESIMES = ["2019", "2020", "2021"];

async function certifications(
  code_certifications: string[],
  millesimes: string[],
  { signal }: { signal: AbortSignal | undefined }
): Promise<Certification[]> {
  const ITEM_PER_PAGE = 50;
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const url = new URL(API_BASE_URL + "/exposition/certifications");

  if (code_certifications.length === 0) {
    return [];
  }

  //Split in multiple query
  let results = [];
  for (const codes of chunk(code_certifications, ITEM_PER_PAGE)) {
    const params = {
      items_par_page: ITEM_PER_PAGE,
      millesimes: millesimes,
      code_certifications: codes,
    };
    const paginatedResult = await fetch(url, {
      method: "POST",
      body: JSON.stringify(params),
      signal,
    });
    const json = await paginatedResult.json();
    results.push(...json.certifications);
  }

  return flatten(results) as Certification[];
}

function Metrics({ metrics }: { metrics: Certification }) {
  const keys = [
    "nb_annee_term",
    "nb_en_emploi_6_mois",
    "nb_en_emploi_12_mois",
    "nb_en_emploi_18_mois",
    "nb_en_emploi_24_mois",
    "nb_poursuite_etudes",
    "nb_sortant",
    "taux_autres_6_mois",
    "taux_autres_12_mois",
    "taux_en_emploi_6_mois",
    "taux_en_emploi_12_mois",
    "taux_en_emploi_18_mois",
    "taux_en_emploi_24_mois",
    "taux_en_formation",
    "taux_rupture_contrats",
  ];

  if (!metrics || metrics.length === 0) {
    return <></>;
  }

  const millesimes = MILLESIMES;
  return (
    <Grid container spacing={2}>
      {millesimes.map((millesime) => {
        const currentMetric = metrics.find((m: Certification) => m.millesime === millesime) || { millesime };
        return (
          <Grid key={millesime} item xs={4}>
            <Grid item xs={12}>
              <Typograhpy variant="h3"> Millesime : {currentMetric.millesime}</Typograhpy>
              {currentMetric.donnee_source && currentMetric.donnee_source.type !== "self" ? (
                <Typograhpy variant="h3"> Source : {currentMetric.donnee_source.code_certification}</Typograhpy>
              ) : (
                <></>
              )}
            </Grid>
            <Grid container spacing={2}>
              {keys.map((k, index) => {
                return (
                  <Grid key={index} item xs={12}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typograhpy variant="body1">{k}</Typograhpy>
                      </Grid>
                      <Grid item xs={6}>
                        <Typograhpy variant="body1">{currentMetric[k]}</Typograhpy>
                      </Grid>
                    </Grid>
                  </Grid>
                );
              })}
            </Grid>
          </Grid>
        );
      })}
    </Grid>
  );
}

export default function ResearchFormationsResult({
  formations,
  labels,
}: {
  formations: BCN[];
  labels: { part: string; matched: boolean }[][];
}) {
  // Fetch metrics nationale
  const code_certifications: string[] = formations.map((f) => f.code_certification);
  const millesimes: string[] = MILLESIMES;
  const { isLoading: isLoadingMetrics, data: dataMetrics } = useQuery({
    staleTime: Infinity,
    cacheTime: Infinity,
    //keepPreviousData: true,
    queryKey: ["certifications", code_certifications],
    queryFn: ({ signal }) => certifications(code_certifications, millesimes, { signal }),
  });

  const columns = useMemo<MRT_ColumnDef<BCN>[]>(
    () => [
      {
        accessorKey: "libelle_full",
        header: "Nom",
        size: 150,
        Cell: ({ row }) => {
          return (
            <div>
              {labels[row.index]?.map((v, indexLabel) =>
                v.matched ? (
                  <b style={{ whiteSpace: "pre-wrap" }} key={row.index + "_" + indexLabel}>
                    {v.part}
                  </b>
                ) : (
                  <span style={{ whiteSpace: "pre-wrap" }} key={row.index + "_" + indexLabel}>
                    {v.part}
                  </span>
                )
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "code_certification",
        header: "Code de certification",
        size: 150,
      },
      {
        accessorKey: "code_formation_diplome",
        header: "CFD",
        size: 150,
      },
      {
        accessorKey: "diplome.libelle",
        header: "Diplome",
        size: 150,
      },
      {
        id: "type",
        header: "Filière",
        size: 150,
        accessorFn: (row) => {
          return row.type === "cfd" ? "Apprentissage" : "Scolaire";
        },
      },
      {
        id: "fermer",
        header: "Fermer",
        size: 100,
        accessorFn: (row) => {
          return row.date_fermeture < new Date().toISOString() ? "Oui" : "Non";
        },
      },
      {
        id: "metrics",
        header: "Metrics",
        size: 100,
        accessorFn: (row) => {
          if (row.metricsIsLoading) {
            return "Loading...";
          }
          return row.metricsData && row.metricsData.length > 0 ? "Oui" : "Non";
        },
      },
    ],
    [labels]
  );

  const rowVirtualizerInstanceRef = useRef<MRT_Virtualizer<HTMLDivElement, HTMLTableRowElement>>(null);

  const [data, setData] = useState<BCN[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sorting, setSorting] = useState<MRT_SortingState>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setData(
        formations.map((f) => ({
          ...f,
          metricsIsLoading: isLoadingMetrics,
          metricsData: dataMetrics?.filter((d) => d.code_certification === f.code_certification),
        }))
      );
      setIsLoading(false);
    }
  }, [formations, isLoadingMetrics, dataMetrics]);

  useEffect(() => {
    //scroll to the top of the table when the sorting changes
    try {
      data.length > 0 && rowVirtualizerInstanceRef.current?.scrollToIndex?.(0);
    } catch (error) {
      console.error(error);
    }
  }, [data, sorting]);

  return (
    <AutoSizer>
      {({ width, height }) => {
        return (
          <div style={{ width: width, height: height }}>
            <MaterialReactTable
              columns={columns}
              data={data}
              defaultDisplayColumn={{ enableResizing: true }}
              enableBottomToolbar
              enableColumnResizing
              enableGlobalFilterModes
              enablePagination={true}
              enablePinning
              muiTopToolbarProps={{ sx: { height: "56px" } }}
              muiBottomToolbarProps={{ sx: { height: "56px" } }}
              muiTableContainerProps={{ sx: { height: height - 112 + "px" } }}
              onSortingChange={setSorting}
              state={{ isLoading, sorting }}
              rowVirtualizerInstanceRef={rowVirtualizerInstanceRef}
              rowVirtualizerProps={{ overscan: 10 }} //optionally customize the row virtualizer
              columnVirtualizerProps={{ overscan: 10 }} //optionally customize the column virtualizer
              renderDetailPanel={({ row }) => (
                <Box>
                  <Metrics metrics={row.original.metricsData} />
                </Box>
              )}
            />
          </div>
        );
      }}
    </AutoSizer>
  );
}
