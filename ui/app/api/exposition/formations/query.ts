import { Formation } from "#/types/formation";
import { mapValues } from "lodash-es";
import { FormationsRequestSchema } from "./route";
import { Paginations } from "#/types/pagination";

export async function formations(
  params: FormationsRequestSchema,
  { signal }: { signal: AbortSignal | undefined }
): Promise<Paginations<"formations", Formation>> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const url = API_BASE_URL + "/exposition/formations";
  const result = await fetch(`${url}?${new URLSearchParams(mapValues(params, (v) => (v ? v.toString() : "")))}`, {
    method: "GET",
    signal,
  });

  const json = await result.json();
  return json;
}
