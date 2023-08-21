export type LoginRequest = {
  login?: string;
  password?: string;
};

export type UserSession = {
  name: string;
  uai?: string;
  siret?: string;
};

export type EtablissementStat = {
  taux_en_emploi_6_mois: number;
  taux_en_emploi_6_mois_regional: number;
  diff_taux_6_mois_regional: number;
};

export type Etablissement<T> = {
  etablissement: T;
  stats: EtablissementStat;
};
