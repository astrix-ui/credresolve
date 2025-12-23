/**
 * Response Formatter Utility
 * Standardizes API response format across the application
 */

class ResponseFormatter {
  
  static success(res, data, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }
  
  static error(res, message = 'An error occurred', statusCode = 500, errors = null) {
    const response = {
      success: false,
      message,
      timestamp: new Date().toISOString()
    };
    
    if (errors) {
      response.errors = errors;
    }
    
    return res.status(statusCode).json(response);
  }
  
  static validationError(res, errors) {
    return this.error(res, 'Validation failed', 400, errors);
  }
  
  static notFound(res, resource = 'Resource') {
    return this.error(res, `${resource} not found`, 404);
  }
  
  static unauthorized(res, message = 'Unauthorized access') {
    return this.error(res, message, 401);
  }
}

module.exports = ResponseFormatter;
