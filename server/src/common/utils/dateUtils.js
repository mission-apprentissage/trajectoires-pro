import { DateTime } from "luxon";

export function parseAsUTCDate(string) {
  if (!string) {
    return null;
  }

  return DateTime.fromFormat(string, "dd/MM/yyyy", { zone: "utc" }).toJSDate();
}
