import * as yup from "yup";

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
  date_premiere_session?: string;
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

export const bcnSchema: yup.ObjectSchema<BCN> = yup.object({
  code_certification: yup.string().required(),
  ancien_diplome: yup.array().of(yup.string().required()).required(),
  code_formation_diplome: yup.string().required(),
  date_ouverture: yup.string().required(),
  diplome: yup.object({
    code: yup.string().required(),
    libelle: yup.string().required(),
  }),
  libelle: yup.string().required(),
  libelle_long: yup.string().required(),
  nouveau_diplome: yup.array().of(yup.string().required()).required(),
  type: yup.string().required(),
  date_premiere_session: yup.string(),
  date_fermeture: yup.string(),
});
