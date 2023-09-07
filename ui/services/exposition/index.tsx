import {
  Paginations,
  PaginationsRequest,
  CertificationsRequest,
  FormationsRequest,
  RegionaleRequest,
} from "#/services/exposition/types";
import { BCN, Certification, Formation } from "#/services/exposition/types";

const { EXPOSITION_API_BASE_URL, EXPOSITION_API_KEY } = process.env;

async function bcn(params: PaginationsRequest): Promise<Paginations<"bcn", BCN>> {
  const urlParams = new URLSearchParams({
    page: params.page.toString(),
    items_par_page: params.items_par_page.toString(),
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
  params: CertificationsRequest & PaginationsRequest
): Promise<Paginations<"certifications", Certification>> {
  const urlParams = new URLSearchParams({
    code_certifications: params.code_certifications.join(","),
    millesimes: params.millesimes.join(","),
    page: params.page.toString(),
    items_par_page: params.items_par_page.toString(),
  });

  const res = await fetch(EXPOSITION_API_BASE_URL + `/certifications?${urlParams}`, {
    headers: {
      "Content-Type": "application/json",
      "x-api-key": EXPOSITION_API_KEY || "",
    },
  });

  return await res.json();
}

async function formations(
  params: FormationsRequest & PaginationsRequest
): Promise<Paginations<"formations", Formation>> {
  const urlParams = new URLSearchParams({
    ...(params.uais.length > 0 ? { uais: params.uais.join(",") } : {}),
    ...(params.millesimes.length > 0 ? { millesimes: params.millesimes.join(",") } : {}),
    page: params.page.toString(),
    items_par_page: params.items_par_page.toString(),
  });

  const res = await fetch(EXPOSITION_API_BASE_URL + `/formations?${urlParams}`, {
    headers: {
      "Content-Type": "application/json",
      "x-api-key": EXPOSITION_API_KEY || "",
    },
  });

  const json = await res.json();
  return json;
}

async function regionales(
  params: RegionaleRequest & PaginationsRequest
): Promise<Paginations<"regionales", Certification>> {
  const urlParams = new URLSearchParams({
    code_certifications: params.code_certifications.join(","),
    millesimes: params.millesimes.join(","),
    regions: params.regions.join(","),
    page: params.page.toString(),
    items_par_page: params.items_par_page.toString(),
  });

  const res = await fetch(EXPOSITION_API_BASE_URL + `/regionales?${urlParams}`, {
    headers: {
      "Content-Type": "application/json",
      "x-api-key": EXPOSITION_API_KEY || "",
    },
  });

  return await res.json();
}

export { bcn, certifications, regionales, formations };
