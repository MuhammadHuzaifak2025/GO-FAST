
class ApiResponse {
  constructor(StatusCode, data, message = "Success", token = null) {
    this.StatusCode = StatusCode;
    this.data = data;
    this.message = message;
    this.success = StatusCode < 400;
    if (token) this.token = token;
  }
}

export default ApiResponse;
