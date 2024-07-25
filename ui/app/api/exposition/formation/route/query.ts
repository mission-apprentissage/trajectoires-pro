import { FormationRouteRequestSchema } from "./type";
import { paramsToString } from "#/app/utils/searchParams";

export async function formationRoute(
  params: FormationRouteRequestSchema,
  { signal }: { signal: AbortSignal | undefined }
): Promise<any> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const url = API_BASE_URL + "/exposition/formation/route";

  const result = await fetch(`${url}?${paramsToString(params)}`, {
    method: "GET",
    signal,
  });

  if (!result.ok) {
    throw new Error("Route not found");
  }

  const json = await result.json();
  // Add route schema validation
  return json;
}
