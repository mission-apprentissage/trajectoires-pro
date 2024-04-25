import * as yup from "yup";
import { BCN, bcnSchema } from "./bcn";

export enum FormationTag {
  POUR_TRAVAILLER_RAPIDEMENT = "pour_travailler_rapidement",
  POUR_CONTINUER_DES_ETUDES = "pour_continuer_des_etudes",
}

export const formationTagSchema: yup.StringSchema<FormationTag> = yup
  .string()
  .oneOf(Object.values(FormationTag))
  .required();

export type FormationDetail = { tags: FormationTag[] } & Record<string, any>;

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
        tags: yup.array(yup.string().oneOf(Object.values(FormationTag)).required()).required(),
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
