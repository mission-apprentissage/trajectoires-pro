import UserRepository from "#src/common/repositories/user.js";
import { ErrorUserAlreadyExist, ErrorPasswordNotSafe, ErrorPasswordNotMatch, ErrorUserDoesNotExist } from "./error.js";
import { passwordRegex, hashPassword } from "./auth.js";

export async function createUser({ username, password, passwordRepeat }) {
  const exists = await UserRepository.exist({ username });
  if (exists) {
    throw new ErrorUserAlreadyExist(username);
  }

  if (password !== passwordRepeat) {
    throw new ErrorPasswordNotMatch();
  }

  if (!password.match(passwordRegex)) {
    throw new ErrorPasswordNotSafe();
  }

  const hashedPassword = hashPassword(password);

  await UserRepository.create({
    username,
    password: hashedPassword,
  });

  return await UserRepository.first({ username });
}

export async function removeUser({ username }) {
  const exists = await UserRepository.exist({ username });
  if (!exists) {
    throw new ErrorUserDoesNotExist(username);
  }

  return await UserRepository.deleteOne({ username });
}

export async function getUser(username) {
  const user = await UserRepository.first({ username });
  if (!user) {
    return null;
  }

  return user;
}
