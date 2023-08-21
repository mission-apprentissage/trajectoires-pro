import { NextResponse } from "next/server";
import * as API from "#/services/exposition/index";
import { cacheWithObjectArgument } from "#/common/cache";
import { certificationsSchema } from "#/services/exposition/validators";

const apiCached = cacheWithObjectArgument(API.certifications);

export async function POST(request: Request) {
  const params = await certificationsSchema.validate(await request.json());
  const result = await apiCached(params);
  return NextResponse.json(result);
}
