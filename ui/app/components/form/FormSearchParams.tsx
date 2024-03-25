"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Control, FieldErrors } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { FieldValues, Resolver } from "react-hook-form";
import { flatten } from "lodash-es";
import { searchParamsToObject } from "#/app/utils/searchParams";

export default function FormSearchParams<FormData extends FieldValues>({
  url,
  defaultValues,
  schema,
  children,
}: {
  url: string;
  defaultValues: FormData;
  schema: yup.ObjectSchema<FormData>;
  children: ({ control, errors }: { control: Control<FormData, any>; errors: FieldErrors<FormData> }) => JSX.Element;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const parameters: any = searchParamsToObject(searchParams, defaultValues, schema);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: parameters,
    resolver: yupResolver(schema),
  });

  const onSubmit = handleSubmit((data) => {
    const entries = Object.entries(schema.fields).map(([key, fieldSchema]) => {
      if (fieldSchema.type === "array") {
        return [data[key].map((v: any) => [key, v])];
      }
      return [[key, data[key]]];
    });

    const urlParams = new URLSearchParams(flatten(entries));
    router.push(`${url}?${urlParams}`);
  });

  return (
    <form autoComplete="off" onSubmit={onSubmit} style={{ flex: "1" }}>
      {children({ control, errors })}
    </form>
  );
}
