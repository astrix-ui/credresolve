/**
 * Request Logger Middleware
 * Logs incoming requests for debugging and monitoring
 */

const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  
  console.log(`[${timestamp}] ${method} ${url}`);
  
  // Log request body for POST/PUT requests (excluding sensitive data)
  if ((method === 'POST' || method === 'PUT') && req.body) {
    const sanitizedBody = { ...req.body };
    // Remove any password fields if they exist in future
    delete sanitizedBody.password;
    console.log('Request body:', JSON.stringify(sanitizedBody, null, 2));
  }
  
  next();
};

module.exports = requestLogger;
