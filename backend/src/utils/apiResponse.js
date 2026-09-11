/**
 * Standardized API Response structure for ThePurple API
 */
export class ApiResponse {
  /**
   * Send a successful JSON response
   */
  static success(res, data = null, message = 'Success', statusCode = 200, meta = null) {
    const payload = {
      success: true,
      message,
      data,
    };
    if (meta) {
      payload.meta = meta;
    }
    return res.status(statusCode).json(payload);
  }

  /**
   * Send a 201 Created JSON response
   */
  static created(res, data = null, message = 'Created successfully') {
    return this.success(res, data, message, 201);
  }

  /**
   * Send a 202 Accepted JSON response
   */
  static accepted(res, data = null, message = 'Accepted') {
    return this.success(res, data, message, 202);
  }

  /**
   * Send an error JSON response
   */
  static error(res, message = 'Internal Server Error', statusCode = 500, errorCode = 'INTERNAL_ERROR', errors = null) {
    const payload = {
      success: false,
      message,
      errorCode,
    };
    if (errors) {
      payload.errors = errors;
    }
    return res.status(statusCode).json(payload);
  }
}

export default ApiResponse;
