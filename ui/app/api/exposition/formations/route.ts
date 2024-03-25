import { NextResponse } from "next/server";
import { object, number, array, string, InferType } from "yup";
import * as API from "../index";
import { cacheWithObjectArgument } from "#/common/cache";

const getSchema = object({
  longitude: number().min(-180).max(180).required(),
  latitude: number().min(-90).max(90).required(),
  distance: number().default(1000),
  codesDiplome: array()
    .transform(function (value, originalValue) {
      return originalValue ? originalValue.split(/[\s,]+/) : [];
    })
    .of(string()),
  page: number().required().default(0).min(0).integer(),
  items_par_page: number().required().default(10).positive().integer(),
});
export type FormationsRequestSchema = InferType<typeof getSchema>;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const params = await getSchema.validate(Object.fromEntries(url.searchParams.entries()));
  const formations = await API.formations(params);
  return NextResponse.json(formations);
}
