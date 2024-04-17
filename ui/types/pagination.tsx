import * as yup from "yup";

export type Paginations<PropertyName extends string, U> = {
  pagination: {
    page: number;
    items_par_page: number;
    nombre_de_page: number;
    total: number;
  };
} & { [P in PropertyName]: U[] };

export function getPaginationSchema<T>(schema: T) {
  return yup.object({
    pagination: yup.object({
      page: yup.number().required(),
      items_par_page: yup.number().required(),
      nombre_de_page: yup.number().required(),
      total: yup.number().required(),
    }),
    ...schema,
  });
}
