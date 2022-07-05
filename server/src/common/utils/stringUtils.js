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

export function removeDiacritics(value) {
  if (!value) {
    return value;
  }

  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/-/g, " ")
    .replace(/—/g, " ")
    .replace(/—/g, " ")
    .replace(/\s\s+/g, " ")
    .replace(/\//g, " ")
    .toUpperCase()
    .trim();
}
