import { NextResponse } from "next/server";
import * as Exposition from "#/services/exposition/index";
import { cacheWithObjectArgument } from "#/common/cache";
import { paginationSchema } from "#/services/exposition/validators";

const apiBCNCached = cacheWithObjectArgument(Exposition.bcn);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const params = await paginationSchema.validate(Object.fromEntries(url.searchParams.entries()));
  const bcn = await apiBCNCached(params);
  return NextResponse.json(bcn);
}
