import { date, object } from "./jsonSchemaTypes.js";

export function metaSchema() {
  return object(
    {
      date_import: date(),
    },
    { required: ["date_import"] }
  );
}
