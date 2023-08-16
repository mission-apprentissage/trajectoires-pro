import { NextResponse } from "next/server";
import { object, number, array, string } from "yup";
import * as API from "../index";
import { cacheWithObjectArgument } from "#/common/cache";

const getSchema = object({
  code_certifications: array().of(string()),
  millesimes: array().of(string()).default(["2021"]),
  page: number().required().default(0).min(0).integer(),
  items_par_page: number().required().default(10).positive().integer(),
});
const apiCertificationsCached = cacheWithObjectArgument(API.certifications);

export async function POST(request: Request) {
  const params = await getSchema.validate(await request.json());
  const result = await apiCertificationsCached(
    params.code_certifications,
    params.millesimes,
    params.page,
    params.items_par_page
  );
  return NextResponse.json(result);
}
