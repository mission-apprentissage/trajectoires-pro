export default class ErrorAddressInvalid extends Error {
  constructor(msg?: string) {
    super(msg || `Address invalid`);
    this.name = "ErrorAddressInvalid";
    Object.setPrototypeOf(this, ErrorAddressInvalid.prototype);
  }
}
