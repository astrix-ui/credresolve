/**
 * Global Error Handler Middleware
 * Catches and formats errors consistently
 */

const errorHandler = (err, req, res, next) => {
  console.error('Error occurred:', err);
  
  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors,
      timestamp: new Date().toISOString()
    });
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate entry - resource already exists',
      timestamp: new Date().toISOString()
    });
  }
  
  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format',
      timestamp: new Date().toISOString()
    });
  }
  
  // Default error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    timestamp: new Date().toISOString()
  });
};

module.exports = errorHandler;
