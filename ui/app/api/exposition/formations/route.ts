import { NextResponse } from "next/server";
import { object, number, array, string, InferType } from "yup";
import * as API from "../index";
import { FormationTag } from "#/types/formation";
import { tryCatch } from "#/app/utils/routeUtils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const getSchema = object({
  longitude: number().min(-180).max(180).required(),
  latitude: number().min(-90).max(90).required(),
  distance: number().default(1000),
  timeLimit: number().min(600).max(7200),
  tag: string()
    .oneOf(Object.values(FormationTag))
    .nullable()
    .transform((_, value) => {
      return value === "" ? null : value;
    }),
  codesDiplome: array()
    .transform(function (value, originalValue) {
      return originalValue ? originalValue.split(/[\s,]+/) : [];
    })
    .of(string()),
  page: number().required().default(0).min(0).integer(),
  items_par_page: number().required().default(10).positive().integer(),
});
export type FormationsRequestSchema = InferType<typeof getSchema>;

export async function GET(request: Request) {
  return tryCatch(async () => {
    const url = new URL(request.url);
    const params = await getSchema.validate(Object.fromEntries(url.searchParams.entries()));
    const formations = await API.formations(params);
    return NextResponse.json(formations);
  });
}
