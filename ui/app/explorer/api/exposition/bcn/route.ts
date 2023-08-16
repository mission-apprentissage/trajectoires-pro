import { NextResponse } from "next/server";
import { object, number } from "yup";
import * as API from "../index";
import { cacheWithObjectArgument } from "#/common/cache";

const getSchema = object({
  page: number().required().default(0).min(0).integer(),
  items_par_page: number().required().default(10).positive().integer(),
});
const apiBCNCached = cacheWithObjectArgument(API.bcn);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const params = await getSchema.validate(Object.fromEntries(url.searchParams.entries()));
  const bcn = await apiBCNCached(params.page, params.items_par_page);
  return NextResponse.json(bcn);
}
