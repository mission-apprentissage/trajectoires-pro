/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the collection schema file,
 * To regenerate this file run $> make types
 */
import { ObjectId } from "mongodb";

export const name = "formationsStats";

export interface FormationsStats {
  _id?: ObjectId;
  uai: string;
  millesime: string;
  code_certification: string;
  filiere: "apprentissage" | "pro";
  nb_annee_term?: number;
  nb_poursuite_etudes?: number;
  nb_en_emploi_12_mois?: number;
  nb_en_emploi_6_mois?: number;
  nb_sortant?: number;
  taux_poursuite_etudes?: number;
  taux_emploi_12_mois?: number;
  taux_emploi_6_mois?: number;
  diplome: {
    code: string;
    libelle: string;
  };
  _meta?: {
    date_import: Date;
  };
}
