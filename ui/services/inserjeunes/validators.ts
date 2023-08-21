import { object, number, array, string, ObjectSchema } from "yup";
import { LoginRequest } from "./types";

export const loginSchema: ObjectSchema<LoginRequest> = object({
  login: string()
    .test({
      name: "uai ou siret",
      message: "${path} must have 7 or 14 characters",
      test: (value) => {
        return value == null || value.length === 8 || value.length === 14;
      },
    })
    .required(),
  password: string().required(),
});
