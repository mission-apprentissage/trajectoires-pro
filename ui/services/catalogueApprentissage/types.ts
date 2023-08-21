export type Etablissement = any;

export type EtablissementsRequest = {
  uai?: string;
  siret?: string;
};

export type Paginations<PropertyName extends string, U> = {
  pagination: {
    page: number;
    resultats_par_page: number;
    nombre_de_page: number;
    total: number;
  };
} & { [P in PropertyName]: U[] };

export type PaginationsRequest = {
  page: number;
  limit: number;
};
