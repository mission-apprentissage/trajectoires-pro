export type Certification = any;

export type Formation = any;

export type BCN = {
  code_certification: string;
  ancien_diplome: string[];
  code_formation_diplome: string;
  date_ouverture: string;
  diplome: {
    code: string;
    libelle: string;
  };
  libelle: string;
  libelle_long: string;
  nouveau_diplome: string[];
  type: string;
  date_premiere_session: string;
  date_fermeture?: string;
};

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

export type RegionaleRequest = {
  code_certifications: string[];
  millesimes: string[];
  regions: string[];
  page: number;
  items_par_page: number;
};
