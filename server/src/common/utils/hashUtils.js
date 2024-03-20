import crypto from "crypto";

export function hashString(string, { digest = "sha512" }) {
  const hashedPassword = crypto.createHash(digest).update(string).digest("hex");
  return hashedPassword.toString("hex");
}
