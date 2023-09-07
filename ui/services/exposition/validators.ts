import { object, number, array, string, Schema } from "yup";
import {
  PaginationsRequest,
  CertificationsRequest,
  FormationsRequest,
  RegionaleRequest,
} from "#/services/exposition/types";

export const paginationSchema: Schema<PaginationsRequest> = object({
  page: number().required().default(0).min(0).integer(),
  items_par_page: number().required().default(10).positive().integer(),
});

export const certificationsSchema: Schema<CertificationsRequest & PaginationsRequest> = object({
  code_certifications: array().of(string().required()).default([]),
  millesimes: array().of(string().required()).default(["2021"]),
  page: number().required().default(0).min(0).integer(),
  items_par_page: number().required().default(10).positive().integer(),
});

export const formationsSchema: Schema<FormationsRequest & PaginationsRequest> = object({
  uais: array().of(string().required()).default([]),
  millesimes: array().of(string().required()).default([]),
  page: number().required().default(0).min(0).integer(),
  items_par_page: number().required().default(10).positive().integer(),
});

export const regionalesSchema: Schema<RegionaleRequest & PaginationsRequest> = object({
  code_certifications: array().of(string().required()).default([]),
  millesimes: array().of(string().required()).default(["2021"]),
  regions: array().of(string().required()).default([]),
  page: number().required().default(0).min(0).integer(),
  items_par_page: number().required().default(10).positive().integer(),
});
