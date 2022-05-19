import { isEmpty } from "lodash-es";
import luhn from "fast-luhn";
const ALPHABET_23_LETTERS = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "j",
  "k",
  "l",
  "m",
  "n",
  "p",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
];

function computeChecksum(numbers) {
  if (!numbers || numbers.length !== 7) {
    throw new Error(`Le code ne doit contenir que 7 caractères sans le checksum`);
  }

  return ALPHABET_23_LETTERS[numbers % 23];
}

export function createUAI(code) {
  return `${code}${computeChecksum(code)}`.toUpperCase();
}

export function isUAIValid(code) {
  if (!code || code.length !== 8) {
    return false;
  }

  let numbers = code.substring(0, 7);
  let checksum = code.substring(7, 8).toLowerCase();

  return checksum === computeChecksum(numbers);
}
export function isSiretValid(siret) {
  return !isEmpty(siret) && siret.length === 14 && luhn(siret);
}
