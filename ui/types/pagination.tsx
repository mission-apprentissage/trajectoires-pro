export type Paginations<PropertyName extends string, U> = {
  pagination: {
    page: number;
    items_par_page: number;
    nombre_de_page: number;
    total: number;
  };
} & { [P in PropertyName]: U[] };
