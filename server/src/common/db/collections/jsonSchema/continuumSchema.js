import { object, string, enumOf } from "./jsonSchemaTypes.js";

export function fields() {
  return {
    donnee_source: object(
      {
        code_certification: string(),
        type: enumOf(["self", "ancienne", "nouvelle"]),
      },
      { required: ["code_certification", "type"] }
    ),
  };
}

export function required() {
  return ["donnee_source"];
}
