import { Formation } from "#/types/formation";
import { mapValues } from "lodash-es";
import { FormationRequestSchema } from "./type";

export async function formation(
  params: FormationRequestSchema,
  { signal }: { signal: AbortSignal | undefined }
): Promise<Formation> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const url = API_BASE_URL + "/exposition/formation";

  const result = await fetch(`${url}?${new URLSearchParams(mapValues(params, (v) => (v ? v.toString() : "")))}`, {
    method: "GET",
    signal,
  });

  if (!result.ok) {
    throw new Error("Formation not found");
  }

  const json = await result.json();
  return json;
}
