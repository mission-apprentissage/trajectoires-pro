import { object, number, array, string, Schema } from "yup";
import { Etablissement, PaginationsRequest } from "./types";

export const etablissementSchema: Schema<Etablissement> = object({
  siret: string(),
  uai: string(),
});

export const pageSchema: Schema<PaginationsRequest> = object({
  page: number().required().default(1),
  limit: number().required().default(10),
});
