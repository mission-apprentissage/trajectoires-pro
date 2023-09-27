import { NextResponse } from "next/server";
import { object, number, array, string } from "yup";
import * as API from "../index";
import { cacheWithObjectArgument } from "#/common/cache";

const getSchema = object({
  code_certifications: array().of(string().required()).default([]),
  millesimes: array().of(string().required()).default(["2021"]),
  regions: array().of(string().required()).default([]),
  page: number().required().default(0).min(0).integer(),
  items_par_page: number().required().default(10).positive().integer(),
});
const apiRegionalesCached = cacheWithObjectArgument(API.regionales);

export async function POST(request: Request) {
  const params = await getSchema.validate(await request.json());
  const result = await apiRegionalesCached(
    params.code_certifications,
    params.millesimes,
    params.regions,
    params.page,
    params.items_par_page
  );
  return NextResponse.json(result);
}
