import { date, integer, object, objectId, string } from "./jsonSchema/jsonSchemaTypes.js";

export const name = "consumptions";

export function indexes() {
  return [
    [{ time: 1, consumer: 1, url: 1 }, { unique: true }],
    [{ time: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 365 }], // expires after 1y
    [{ consumer: 1 }],
    [{ url: 1 }],
    [{ extension: 1 }],
    [{ uai: 1 }],
    [{ code_certification: 1 }],
  ];
}

export function schema() {
  return object(
    {
      _id: objectId(),
      time: date(),
      consumer: string(),
      url: string(),
      extension: string(),
      uai: string(),
      code_certification: string(),
      v: integer(),
    },
    { required: ["time", "consumer", "url"] }
  );
}
