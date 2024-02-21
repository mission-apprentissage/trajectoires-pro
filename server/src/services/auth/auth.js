import crypto from "crypto";
import jwt from "jsonwebtoken";
import { ErrorWrongCredentials } from "./error.js";
import config from "#src/config.js";
import { getUser } from "#src/services/user/user.js";

const JWT_SECRET = config.auth.jwtSecret;
const JWT_ISSUER = config.auth.jwtIssuer;
const JWT_EXPIRATION_TIME = config.auth.jwtExpirationTime;

export const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,50}$/;

export function hashPassword(password, salt = null, iterations = 2) {
  const keylen = 64;
  const digest = "sha512";
  const generateSalt = () => crypto.randomBytes(16).toString("hex");

  if (!salt) {
    salt = generateSalt();
  }
  const hashedPassword = crypto.pbkdf2Sync(password, salt, iterations, keylen, digest);
  return `${hashedPassword.toString("hex")}$${iterations}$${salt}`;
}

export function verifyPassword(password, hash) {
  const [hashedPassword, iterations, salt] = hash.split("$");
  const hashedToTest = hashPassword(password, salt, parseInt(iterations));
  const [hashedPasswordToTest] = hashedToTest.split("$");
  return crypto.timingSafeEqual(Buffer.from(hashedPasswordToTest), Buffer.from(hashedPassword));
}

export async function login({ username, password }) {
  const user = await getUser(username);
  if (!user) {
    throw new ErrorWrongCredentials();
  }

  const passwordMatch = verifyPassword(password, user.password);
  if (!passwordMatch) {
    throw new ErrorWrongCredentials();
  }

  return jwt.sign({ username: username }, JWT_SECRET, {
    issuer: JWT_ISSUER,
    expiresIn: JWT_EXPIRATION_TIME,
  });
}

export function hasPermission(role, user) {
  if (role === "public") {
    return true;
  }

  return !!user;
}
