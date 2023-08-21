import { Etablissement, EtablissementsRequest, PaginationsRequest, Paginations } from "./types";

const { CATALOGUE_APPRENTISSAGE_API_BASE_URL } = process.env;

async function etablissements(
  query: EtablissementsRequest,
  page: PaginationsRequest
): Promise<Paginations<"etablissements", Etablissement[]>> {
  const urlParams = new URLSearchParams({
    query: JSON.stringify(query),
    page: page.page.toString(),
    limit: page.limit.toString(),
  });

  const res = await fetch(CATALOGUE_APPRENTISSAGE_API_BASE_URL + `/entity/etablissements?${urlParams}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return await res.json();
}

export { etablissements };
