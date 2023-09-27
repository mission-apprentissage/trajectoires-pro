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

export type BCNResearch = BCN & {
  libelle_full: string;
  label?: { part: string; matched: boolean }[];
  region?: Region | null;
  metricsIsLoading?: boolean;
  metricsData?: any;
};

export type Region = {
  code: string;
  code_region_academique: string;
  nom: string;
  departements: { code: string; nom: string }[];
  academies: { code: string; nom: string }[];
};
