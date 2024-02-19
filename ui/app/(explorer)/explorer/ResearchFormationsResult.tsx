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
import { BCNResearch } from "#/types/bcn";
import { Certification } from "#/types/certification";
import { findRegionByCode } from "#/common/regions";
export const revalidate = 0;

const MILLESIMES = ["2020", "2021", "2022"];
const MILLESIME_DOUBLE = ["2019_2020", "2020_2021", "2021_2022"];

async function certifications(
  code_certifications: string[],
  millesimes: string[],
  regions: string[],
  { signal }: { signal: AbortSignal | undefined }
): Promise<Certification[]> {
  const ITEM_PER_PAGE = 50;
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const hasRegion = regions.length > 0;
  const url = hasRegion ? API_BASE_URL + "/exposition/regionales" : API_BASE_URL + "/exposition/certifications";

  if (code_certifications.length === 0) {
    return [];
  }

  //Split in multiple query
  let results = [];
  for (const codes of chunk(code_certifications, ITEM_PER_PAGE)) {
    const params = {
      items_par_page: ITEM_PER_PAGE * (hasRegion ? regions.length : 1),
      millesimes: millesimes,
      code_certifications: codes,
      ...(hasRegion ? { regions } : {}),
    };
    const paginatedResult = await fetch(url, {
      method: "POST",
      body: JSON.stringify(params),
      signal,
    });
    const json = await paginatedResult.json();
    results.push(...(hasRegion ? json.regionales : json.certifications));
  }

  return flatten(results) as Certification[];
}

function Metrics({ metrics, millesimes }: { metrics: Certification; millesimes: string[] }) {
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
  regions,
}: {
  formations: BCNResearch[];
  labels: { part: string; matched: boolean }[][];
  regions: string[];
}) {
  // Fetch metrics nationale or régionale
  const hasRegion = regions.length > 0;
  const code_certifications: string[] = formations.map((f) => f.code_certification);
  const millesimes: string[] = regions.length > 0 ? MILLESIME_DOUBLE : MILLESIMES;
  const { isLoading: isLoadingMetrics, data: dataMetrics } = useQuery({
    staleTime: Infinity,
    cacheTime: Infinity,
    //keepPreviousData: true,
    queryKey: ["certifications", code_certifications, regions],
    queryFn: ({ signal }) => certifications(code_certifications, millesimes, regions, { signal }),
  });

  const columns = useMemo<MRT_ColumnDef<BCNResearch>[]>(
    () => [
      ...(hasRegion ? [{ accessorKey: "region.nom", header: "Région", size: 150 } as MRT_ColumnDef<BCNResearch>] : []),
      {
        accessorKey: "libelle_full",
        header: "Nom",
        size: 150,
        Cell: ({ row }) => {
          return (
            <div>
              {row.original.label?.map((v: { matched: any; part: string }, indexLabel: number) =>
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
        header: "Diplôme",
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
        id: "ferme",
        header: "Fermé",
        size: 100,
        accessorFn: (row) => {
          return row.date_fermeture && row.date_fermeture < new Date().toISOString() ? "Oui" : "Non";
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
    [regions, labels, hasRegion]
  );

  const rowVirtualizerInstanceRef = useRef<MRT_Virtualizer<HTMLDivElement, HTMLTableRowElement>>(null);

  const [data, setData] = useState<BCNResearch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sorting, setSorting] = useState<MRT_SortingState>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setData(
        flatten(
          formations.map((f, index) => {
            return (regions.length > 0 ? regions : [""]).map((region) => ({
              ...f,
              label: labels[index],
              region: findRegionByCode(region),
              metricsIsLoading: isLoadingMetrics,
              metricsData: dataMetrics?.filter((d) => {
                return region
                  ? region === d.region.code && d.code_certification === f.code_certification
                  : d.code_certification === f.code_certification;
              }),
            }));
          })
        )
      );
      setIsLoading(false);
    }
  }, [formations, isLoadingMetrics, dataMetrics, regions]);

  useEffect(() => {
    //scroll to the top of the table when the sorting changes
    try {
      data.length > 0 && rowVirtualizerInstanceRef.current?.scrollToIndex?.(0);
    } catch (error) {}
  }, [data, sorting]);

  return (
    <AutoSizer>
      {({ width, height }) => {
        return (
          <div style={{ width: width, height: height }}>
            <MaterialReactTable
              columns={columns}
              data={data}
              key={"table_" + (hasRegion && "region")}
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
                  <Metrics millesimes={millesimes} metrics={row.original.metricsData} />
                </Box>
              )}
            />
          </div>
        );
      }}
    </AutoSizer>
  );
}
