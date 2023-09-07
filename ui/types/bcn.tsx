import { BCN } from "#/services/exposition/types";

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
