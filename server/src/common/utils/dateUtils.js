import { DateTime } from "luxon";
import moment from "moment-timezone";
moment.tz.setDefault("Europe/Paris");

export function parseAsUTCDate(string) {
  if (!string) {
    return null;
  }

  return DateTime.fromFormat(string, "dd/MM/yyyy", { zone: "utc" }).toJSDate();
}

export default moment;
