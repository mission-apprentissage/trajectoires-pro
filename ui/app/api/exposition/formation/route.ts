import "server-only";
import { NextResponse } from "next/server";
import * as API from "../index";
import { getSchema } from "./type";
import { tryCatch } from "#/app/utils/routeUtils";

export async function GET(request: Request) {
  return tryCatch(async () => {
    const url = new URL(request.url);
    const params = await getSchema.validate(Object.fromEntries(url.searchParams.entries()));
    const formation = await API.formation(params);
    return NextResponse.json(formation);
  });
}
