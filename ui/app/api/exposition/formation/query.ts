import { Formation, formationSchema } from "#/types/formation";
import { mapValues } from "lodash-es";
import { FormationRequestSchema } from "./type";
import { paramsToString } from "#/app/utils/searchParams";

export async function formation(
  params: FormationRequestSchema,
  { signal }: { signal: AbortSignal | undefined }
): Promise<Formation> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const url = API_BASE_URL + "/exposition/formation";

  const result = await fetch(`${url}?${paramsToString(params)}`, {
    method: "GET",
    signal,
  });

  if (!result.ok) {
    throw new Error("Formation not found");
  }

  const json = await result.json();
  return await formationSchema.validate(json);
}
