import { Etablissement } from "#/services/inserjeunes/types";
import * as CATypes from "#/services/catalogueApprentissage/types";
import { Paginations as IJPaginations, Formation } from "#/services/exposition/types";

export async function etablissement(): Promise<Etablissement<CATypes.Etablissement>> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const etablissement = await fetch(API_BASE_URL + "/inserjeunes/etablissement");
  const json: Etablissement<CATypes.Etablissement> = await etablissement.json();
  return json;
}

async function paginatedQueryAll<
  K extends keyof T & string,
  R,
  T extends IJPaginations<K, R[]> = IJPaginations<K, R[]>
>(
  url: string,
  key: K,
  params: { [key: string]: any },
  items_par_page = 50,
  { signal }: { signal: AbortSignal | undefined }
): Promise<R[]> {
  let nombre_de_page = 1;
  let results = [];
  for (let page = 1; page <= nombre_de_page; page++) {
    const paramsPage = {
      ...params,
      page,
      items_par_page,
    };
    const paginatedResult = await fetch(url, {
      method: "POST",
      body: JSON.stringify(paramsPage),
      signal,
    });
    const json = (await paginatedResult.json()) as T;
    if (!json) {
      break;
    }
    nombre_de_page = json.pagination.nombre_de_page;
    results.push(...(json[key] as unknown as R[]));
  }

  return results;
}

export async function formationsForUai(
  uai: string,
  { signal }: { signal: AbortSignal | undefined }
): Promise<Formation[]> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  //Split in multiple query
  let formations = await paginatedQueryAll<"formations", Formation>(
    API_BASE_URL + "/exposition/formations",
    "formations",
    { uais: [uai] },
    50,
    {
      signal,
    }
  );

  return formations;
}
