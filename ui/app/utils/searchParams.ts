import { ReadonlyURLSearchParams } from "next/navigation";
import { FieldValues } from "react-hook-form";
import yup from "yup";
import { mapValues, isNil, omitBy } from "lodash-es";
import { Nullable } from "./types";

export function paramsToString(params: Object): string {
  return new URLSearchParams(mapValues(omitBy(params, isNil), (v) => v.toString())).toString();
}

export function searchParamsToObject<FormData extends FieldValues>(
  searchParams: ReadonlyURLSearchParams,
  defaultValues: Nullable<FormData>,
  schema: yup.ObjectSchema<FormData>
) {
  const parameters: any = {};
  for (const [key, fieldSchema] of Object.entries(schema.fields)) {
    if (fieldSchema.type === "array") {
      const arrayField = searchParams.getAll(key).filter((elt) => !!elt) ?? null;
      parameters[key] = arrayField ?? defaultValues[key];
      continue;
    }
    const field = searchParams.get(key) ?? defaultValues[key];
    parameters[key] = field;
  }

  return parameters;
}
