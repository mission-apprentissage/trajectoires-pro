import * as Auth from "#src/services/auth/index.js";

export async function create({ username, password, passwordRepeat }) {
  try {
    const user = await Auth.User.createUser({ username, password, passwordRepeat });
    console.log(`Utilisateur ${username} créé avec succès`);
    return user;
  } catch (err) {
    console.log(`Impossible de créer ${username}`);
    console.log(err.message);
  }
  return null;
}

export async function remove({ username }) {
  try {
    await Auth.User.removeUser({ username });
    console.log(`Utilisateur ${username} supprimé avec succès`);
    return true;
  } catch (err) {
    console.log(`Impossible de supprimer ${username}`);
    console.log(err.message);
  }
  return false;
}
