export function ErrorUserAlreadyExist(username = "") {
  this.name = "ErrorUserAlreadyExist";
  this.username = username;
  this.message = `User ${username} already exist`;
}
ErrorUserAlreadyExist.prototype = Error.prototype;

export function ErrorUserDoesNotExist(username = "") {
  this.name = "ErrorUserDoesNotExist";
  this.username = username;
  this.message = `User ${username} does not exist`;
}
ErrorUserDoesNotExist.prototype = Error.prototype;

export function ErrorPasswordNotSafe() {
  this.name = "ErrorPasswordNotSafe";
  this.message = `Your password must contain at least one digit, one lowercase letter, one uppercase letter, one special character and it must be 8-50 characters long`;
}
ErrorPasswordNotSafe.prototype = Error.prototype;

export function ErrorPasswordNotMatch() {
  this.name = "ErrorPasswordNotMatch";
  this.message = `Your passwords does not match`;
}
ErrorPasswordNotMatch.prototype = Error.prototype;
