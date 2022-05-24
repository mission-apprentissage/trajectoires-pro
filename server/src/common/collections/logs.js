import { object, objectId, string, date, integer } from "./jsonSchema/jsonSchemaTypes.js";
import { dbCollection } from "../mongodb.js";

export const name = "logs";

export function indexes() {
  return [[{ time: 1 }]];
}

export function schema() {
  return object(
    {
      _id: objectId(),
      name: string(),
      hostname: string(),
      pid: integer(),
      level: integer(),
      msg: string(),
      time: date(),
      v: integer(),
    },
    { required: ["time"], additionalProperties: true }
  );
}

/**
 * @typedef {import("mongodb").Collection<import("./logs").Logs>} LogsCollection
 * @returns {LogsCollection}
 */
export function logs() {
  return dbCollection("logs");
}
