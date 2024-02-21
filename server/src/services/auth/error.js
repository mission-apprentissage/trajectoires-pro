export function ErrorWrongCredentials() {
  this.name = "ErrorWrongCredentials";
  this.message = `Your password or username is invalid`;
}
ErrorWrongCredentials.prototype = Error.prototype;
