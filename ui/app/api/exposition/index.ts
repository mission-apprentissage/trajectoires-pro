const { EXPOSITION_API_BASE_URL, EXPOSITION_API_KEY } = process.env;
import { mapValues, merge } from "lodash-es";
import { Paginations } from "#/types/pagination";
import { BCN } from "#/types/bcn";
import { CertificationStat } from "#/types/certification";
import { Formation } from "#/types/formation";
import { FormationsRequestSchema } from "./formations/route";
import { FormationRequestSchema } from "./formation/route";
import { ErrorFetchingJson } from "./apiError";

export async function fetchJson(url: string, options?: RequestInit | undefined) {
  const res = await fetch(
    url,
    merge(
      {},
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
      options || {}
    )
  );

  if (!res.ok) {
    let jsonError = null;
    try {
      jsonError = await res.json();
    } catch (err) {
      throw new ErrorFetchingJson(await res.text(), res.status);
    }
    throw new ErrorFetchingJson(jsonError, res.status);
  }

  return await res.json();
}

async function bcn(page: number, items_par_page: number): Promise<Paginations<"bcn", BCN>> {
  const urlParams = new URLSearchParams({
    page: page.toString(),
    items_par_page: items_par_page.toString(),
  });

  const res = await fetch(EXPOSITION_API_BASE_URL + `/inserjeunes/bcn?${urlParams}`, {
    headers: {
      "Content-Type": "application/json",
      "x-api-key": EXPOSITION_API_KEY || "",
    },
  });

  return await res.json();
}

async function certificationsStats(
  code_certifications: string[],
  millesimes: string[],
  page: number,
  items_par_page: number
): Promise<Paginations<"certifications", CertificationStat>> {
  const urlParams = new URLSearchParams({
    code_certifications: code_certifications.join(","),
    millesimes: millesimes.join(","),
    page: page.toString(),
    items_par_page: items_par_page.toString(),
  });

  const res = await fetch(EXPOSITION_API_BASE_URL + `/inserjeunes/certifications?${urlParams}`, {
    headers: {
      "Content-Type": "application/json",
      "x-api-key": EXPOSITION_API_KEY || "",
    },
  });

  return await res.json();
}

async function regionalesStats(
  code_certifications: string[],
  millesimes: string[],
  regions: string[],
  page: number,
  items_par_page: number
): Promise<Paginations<"regionales", CertificationStat>> {
  const urlParams = new URLSearchParams({
    code_certifications: code_certifications.join(","),
    millesimes: millesimes.join(","),
    regions: regions.join(","),
    page: page.toString(),
    items_par_page: items_par_page.toString(),
  });

  const res = await fetch(EXPOSITION_API_BASE_URL + `/inserjeunes/regionales?${urlParams}`, {
    headers: {
      "Content-Type": "application/json",
      "x-api-key": EXPOSITION_API_KEY || "",
    },
  });

  return await res.json();
}

async function formations(params: FormationsRequestSchema): Promise<Paginations<"formations", Formation>> {
  const urlParams = new URLSearchParams(mapValues(params, (v) => (v ? v.toString() : "")));
  return await fetchJson(EXPOSITION_API_BASE_URL + `/formations?${urlParams}`);
}

async function formation(params: FormationRequestSchema): Promise<Formation> {
  return await fetchJson(EXPOSITION_API_BASE_URL + `/formation/${params.id}`);
}

export { bcn, certificationsStats, regionalesStats, formations, formation };
