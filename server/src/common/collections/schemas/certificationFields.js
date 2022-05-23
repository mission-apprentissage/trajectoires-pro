import { arrayOf, object, string } from "./jsonSchemaTypes.js";

export function certificationFields() {
  return {
    code_formation: string(),
    alias: arrayOf(
      object(
        {
          code: string(),
          type: string({
            enum: ["mef", "mef_stat_9", "mef_stat_11", "code_formation_ancien", "code_formation_nouveau"],
          }),
        },
        { required: ["code", "type"] }
      )
    ),
    diplome: object(
      {
        code: string(),
        label: string(),
      },
      { required: ["code", "label"] }
    ),
  };
}
