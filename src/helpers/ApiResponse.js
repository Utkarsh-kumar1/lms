class ApiResponse {
    constructor(statusCode, data, message = "success") {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;
    }

    static success(statusCode ,data, message = "success") {
        return new ApiResponse(statusCode, data, message);
    }

    static error(statusCode, message = "Something went wrong", data = null) {
        return new ApiResponse(statusCode, data, message);
    }
}

export default ApiResponse;


