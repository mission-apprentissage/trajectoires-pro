import { object, number, array, string, InferType } from "yup";

export const getSchema = object({
  id: string().required(),
});
export type FormationRequestSchema = InferType<typeof getSchema>;
