import { object, string, boolean } from "./jsonSchemaTypes.js";

export function metierSchema() {
  return object(
    {
      title: string(),
      title_old: string(),
      provenance: string(),
      code_rome: string(),
      isMetierAvenir: boolean(),
      isMetierEnTension: boolean(),
      isTransitionEcologique: boolean(),
      isTransitionNumerique: boolean(),
      isTransitionDemographiqu: boolean(),
      isMetierArt: boolean(),
      code_ogr: string(),
    },
    {
      required: ["title", "isMetierAvenir", "code_rome"],
      additionalProperties: false,
    }
  );
}
