import { DateTime } from "luxon";

export function dateAsString(date) {
  if (!date) {
    return date;
  }

  return DateTime.fromJSDate(date).setLocale("fr").toFormat("yyyy-MM-dd");
}

export function capitalizeFirstLetter(string) {
  if (!string) {
    return string;
  }

  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function asArray(v) {
  return v.split(",");
}

export function safeJsonParse(str, fallback = null) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}
