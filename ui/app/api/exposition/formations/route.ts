import { NextResponse } from "next/server";
import * as API from "#/services/exposition/index";
import { cacheWithObjectArgument } from "#/common/cache";
import { formationsSchema } from "#/services/exposition/validators";

const apiCached = cacheWithObjectArgument(API.formations);

export async function POST(request: Request) {
  const reqJson = await request.json();
  const params = await formationsSchema.validate(reqJson);
  const result = await apiCached(params);
  return NextResponse.json(result);
}
