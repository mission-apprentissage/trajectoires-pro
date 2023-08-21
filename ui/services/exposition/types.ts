export type Certification = any;

export type BCN = any;

export type Formation = any;

export type Paginations<PropertyName extends string, U> = {
  pagination: {
    page: number;
    items_par_page: number;
    nombre_de_page: number;
    total: number;
  };
} & { [P in PropertyName]: U[] };

export type PaginationsRequest = {
  page: number;
  items_par_page: number;
};

export type CertificationsRequest = {
  code_certifications: string[];
  millesimes: string[];
};

export type FormationsRequest = {
  uais: string[];
  millesimes: string[];
};
