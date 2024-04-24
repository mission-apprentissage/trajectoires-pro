import { Formation, formationSchema } from "#/types/formation";
import { mapValues } from "lodash-es";
import { FormationsRequestSchema } from "./route";
import { Paginations, getPaginationSchema } from "#/types/pagination";
import * as yup from "yup";
import { fetchJson } from "../../../utils/fetch";

const formationsPaginatedSchema: yup.ObjectSchema<Paginations<"formations", Formation>> = getPaginationSchema({
  formations: yup.array().of(formationSchema).required(),
});

export async function formations(
  params: FormationsRequestSchema,
  { signal }: { signal: AbortSignal | undefined }
): Promise<Paginations<"formations", Formation>> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const url = API_BASE_URL + "/exposition/formations";
  const json = await fetchJson(`${url}?${new URLSearchParams(mapValues(params, (v) => (v ? v.toString() : "")))}`, {
    method: "GET",
    signal,
  });

  return await formationsPaginatedSchema.validate(json);
}
