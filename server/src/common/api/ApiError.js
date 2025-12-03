class ApiError extends Error {
  constructor(apiName, message, httpStatusCode, data, options = {}) {
    super(`[${apiName}] ${message}`, options);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.apiName = apiName;
    this.httpStatusCode = httpStatusCode;
    this.data = data;
  }
}

export { ApiError };
