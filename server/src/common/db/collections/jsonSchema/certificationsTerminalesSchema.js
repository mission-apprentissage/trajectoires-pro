import { object, string, arrayOf } from "./jsonSchemaTypes.js";

export function certificationsTerminalesSchema() {
  return arrayOf(
    object(
      {
        code_certification: string(),
      },
      { required: ["code_certification"] }
    )
  );
}
