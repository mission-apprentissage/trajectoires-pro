import { object, string, enumOf } from "./jsonSchemaTypes.js";

export function continuumSchema() {
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
