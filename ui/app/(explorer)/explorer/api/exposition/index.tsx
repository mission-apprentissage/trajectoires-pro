const { EXPOSITION_API_BASE_URL, EXPOSITION_API_KEY } = process.env;
import { Paginations } from "#/types/pagination";
import { BCN } from "#/types/bcn";
import { Certification } from "#/types/certification";

async function bcn(page: number, items_par_page: number): Promise<Paginations<"bcn", BCN>> {
  const urlParams = new URLSearchParams({
    page: page.toString(),
    items_par_page: items_par_page.toString(),
  });

  const res = await fetch(EXPOSITION_API_BASE_URL + `/bcn?${urlParams}`, {
    headers: {
      "Content-Type": "application/json",
      "x-api-key": EXPOSITION_API_KEY || "",
    },
  });

  return await res.json();
}

async function certifications(
  code_certifications: string[],
  millesimes: string[],
  page: number,
  items_par_page: number
): Promise<Paginations<"certifications", Certification>> {
  const urlParams = new URLSearchParams({
    code_certifications: code_certifications.join(","),
    millesimes: millesimes.join(","),
    page: page.toString(),
    items_par_page: items_par_page.toString(),
  });

  const res = await fetch(EXPOSITION_API_BASE_URL + `/certifications?${urlParams}`, {
    headers: {
      "Content-Type": "application/json",
      "x-api-key": EXPOSITION_API_KEY || "",
    },
  });

  return await res.json();
}

async function regionales(
  code_certifications: string[],
  millesimes: string[],
  regions: string[],
  page: number,
  items_par_page: number
): Promise<Paginations<"regionales", Certification>> {
  const urlParams = new URLSearchParams({
    code_certifications: code_certifications.join(","),
    millesimes: millesimes.join(","),
    regions: regions.join(","),
    page: page.toString(),
    items_par_page: items_par_page.toString(),
  });

  const res = await fetch(EXPOSITION_API_BASE_URL + `/regionales?${urlParams}`, {
    headers: {
      "Content-Type": "application/json",
      "x-api-key": EXPOSITION_API_KEY || "",
    },
  });

  return await res.json();
}

export { bcn, certifications, regionales };
