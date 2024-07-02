import * as yup from "yup";
import { BCN, bcnSchema } from "./bcn";

export const UAI_PATTERN = /^[0-9]{7}[A-Z]{1}$/;
export const CFD_PATTERN = /^[0-9A-Z]{8}$/;

export enum FormationTag {
  POUR_TRAVAILLER_RAPIDEMENT = "pour_travailler_rapidement",
  POUR_CONTINUER_DES_ETUDES = "pour_continuer_des_etudes",
  ADMISSION_FACILE = "admission_facile",
}

export enum FormationVoie {
  SCOLAIRE = "scolaire",
  APPRENTISSAGE = "apprentissage",
}

export const formationTagSchema: yup.StringSchema<FormationTag> = yup
  .string()
  .oneOf(Object.values(FormationTag))
  .required();

type IndicateurEntree = {
  rentreeScolaire: string;
  capacite?: number;
  premiersVoeux?: number;
  tauxPression?: number;
};

type IndicateurPoursuite = {
  millesime: string;
  taux_en_emploi_6_mois?: number;
  taux_en_formation?: number;
  taux_autres_6_mois?: number;
};

export type FormationDetail = {
  voie: FormationVoie;
  tags: FormationTag[];
  indicateurEntree?: IndicateurEntree;
  indicateurPoursuite?: IndicateurPoursuite;
} & Record<string, any>;

type JourneesPortesOuverteDate = {
  from: Date;
  to: Date;
  details?: string;
  fullDay?: boolean;
};

export type JourneesPortesOuverte = {
  dates?: JourneesPortesOuverteDate[];
  details?: string;
};

export type Etablissement = {
  journeesPortesOuvertes?: JourneesPortesOuverte;
} & Record<string, any>;

export type Formation = {
  formation: FormationDetail;
  etablissement: Etablissement;
  bcn: BCN;
};

export const formationSchema: yup.ObjectSchema<Formation> = yup.object({
  formation: yup
    .object()
    .concat(
      yup.object().shape({
        voie: yup.string().oneOf(Object.values(FormationVoie)).required(),
        tags: yup.array(yup.string().oneOf(Object.values(FormationTag)).required()).required(),
        indicateurEntree: yup
          .object({
            rentreeScolaire: yup.string().required(),
            capacite: yup.number(),
            premiersVoeux: yup.number(),
            tauxPression: yup.number(),
          })
          .default(undefined),
        indicateurPoursuite: yup
          .object({
            millesime: yup.string().required(),
            taux_en_emploi_6_mois: yup.number(),
            taux_en_formation: yup.number(),
            taux_autres_6_mois: yup.number(),
          })
          .default(undefined),
      })
    )
    .required(),
  etablissement: yup
    .object()
    .concat(
      yup.object().shape({
        journeesPortesOuvertes: yup
          .object({
            dates: yup.array().of(
              yup.object({
                from: yup
                  .date()
                  .transform((value) => new Date(value))
                  .required(),
                to: yup
                  .date()
                  .transform((value) => new Date(value))
                  .required(),
                details: yup.string(),
                fullDay: yup.boolean(),
              })
            ),
            details: yup.string(),
          })
          .default(undefined),
      })
    )
    .required(),
  bcn: bcnSchema,
});
