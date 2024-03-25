import "server-only";
import { NextResponse } from "next/server";
import * as API from "../index";
import { ErrorFetchingJson } from "../apiError";
import { object, number, array, string, InferType } from "yup";

export const getSchema = object({
  id: string().required(),
});
export type FormationRequestSchema = InferType<typeof getSchema>;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const params = await getSchema.validate(Object.fromEntries(url.searchParams.entries()));

  try {
    const formation = await API.formation(params);
    return NextResponse.json(formation);
  } catch (err) {
    if (err instanceof ErrorFetchingJson) {
      return NextResponse.json(err.data, { status: err.status });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
