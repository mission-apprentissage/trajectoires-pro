export default class ErrorUserGeolocation extends Error {
  constructor(msg?: string) {
    super(msg || `Error getting user location`);
    this.name = "ErrorUserGeolocation";
    Object.setPrototypeOf(this, ErrorUserGeolocation.prototype);
  }
}
