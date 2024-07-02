import { object, string, InferType } from "yup";

export const getSchema = object({
  latitudeA: string().required(),
  longitudeA: string().required(),
  latitudeB: string().required(),
  longitudeB: string().required(),
});
export type FormationRouteRequestSchema = InferType<typeof getSchema>;
