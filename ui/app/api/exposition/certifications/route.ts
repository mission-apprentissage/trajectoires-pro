import { NextResponse } from "next/server";
import { object, number, array, string } from "yup";
import * as API from "#/services/exposition/index";
import { cacheWithObjectArgument } from "#/common/cache";
import { certificationsSchema } from "#/services/exposition/validators";

const apiCertificationsCached = cacheWithObjectArgument(API.certifications);

export async function POST(request: Request) {
  const params = await certificationsSchema.validate(await request.json());
  const result = await apiCertificationsCached(params);
  return NextResponse.json(result);
}
