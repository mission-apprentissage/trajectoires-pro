import React from "react";
import { useState, useEffect, useMemo } from "react";
import uFuzzy from "@leeoniya/ufuzzy";
import { useDebounce } from "usehooks-ts";
import { get } from "lodash-es";

export default function useFuzzyFilter<T, K extends keyof T>(values: T[], key: K) {
  const [fuzzyQuery, setFuzzyQuery] = useState("");
  const [queries, setQueries] = useState<{ [key: string]: string[] }>({});
  const [result, setResult] = useState<any>({
    values: [],
    label: [],
  });
  const ufuzzy = useMemo(() => {
    return new uFuzzy({ intraMode: 0, intraIns: 1 });
  }, []);
  const valueFiltered = useMemo(
    () =>
      values.filter((v) => {
        return (
          Object.keys(queries).filter((k) => {
            return !(queries[k] && queries[k]?.length ? queries[k]?.includes(get(v, k)) : true);
          }).length === 0
        );
      }),
    [values, queries]
  );
  const haystack = useMemo(() => valueFiltered.map((v) => v[key] as string), [valueFiltered, key]);

  const resetResult = () => setResult({ idxs: null, info: null, order: [] });

  useEffect(() => {
    const latinizeQuery = uFuzzy.latinize(fuzzyQuery);
    const idxs = ufuzzy.filter(haystack, latinizeQuery);
    if (idxs) {
      const info = ufuzzy.info(idxs, haystack, latinizeQuery);
      const order = ufuzzy.sort(info, haystack, latinizeQuery);

      const resultsIndex = order.map((i) => info.idx[i]);
      const labels = order.map((i) => {
        return uFuzzy.highlight<{ part: string; matched: boolean }[], { part: string; matched: boolean }>(
          haystack[info.idx[i]],
          info.ranges[i],
          (part, matched) => {
            return { part, matched };
          },
          [],
          (accum, v) => {
            accum.push(v);
            return accum;
          }
        );
      });

      setResult({
        labels: labels,
        values: resultsIndex.map((i) => valueFiltered[i]),
      });
    }
  }, [ufuzzy, valueFiltered, haystack, fuzzyQuery]);

  return [fuzzyQuery, queries, result, setFuzzyQuery, setQueries, resetResult];
}
