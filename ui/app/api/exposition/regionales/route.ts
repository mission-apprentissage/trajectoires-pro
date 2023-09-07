import { NextResponse } from "next/server";
import * as API from "#/services/exposition/index";
import { cacheWithObjectArgument } from "#/common/cache";
import { regionalesSchema } from "#/services/exposition/validators";

const apiRegionalesCached = cacheWithObjectArgument(API.regionales);

export async function POST(request: Request) {
  const params = await regionalesSchema.validate(await request.json());
  const result = await apiRegionalesCached(params);
  return NextResponse.json(result);
}
