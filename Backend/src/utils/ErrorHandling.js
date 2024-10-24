class ApiError extends Error {
  constructor(
    statuscode,
    message = "Something Went Wrong",
    error = [],
    stack = ""
  ) {
    super(message);
    this.statuscode = statuscode;
    this.data = null;
    this.success = false;
    this.errors = error;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError;
