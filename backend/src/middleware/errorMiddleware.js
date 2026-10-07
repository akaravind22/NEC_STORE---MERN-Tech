/**
 * Centralized API Error Handling Middleware
 * Captures all uncaught sync/async exceptions and formats clean, secure client responses
 */
const errorHandler = (err, req, res, next) => {
  console.error('[API Error Stack]', err.name || 'Error', err.message);

  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // 1. Sequelize Validation Errors
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = 'Validation error: Please verify your input data.';
    errors = err.errors ? err.errors.map(e => ({ field: e.path, message: e.message })) : [];
  }
  // 2. Sequelize Unique Constraint Error (e.g. Duplicate Email, SKU, Product)
  else if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    const field = err.errors && err.errors[0] ? err.errors[0].path : 'record';
    message = 'A record with this ' + field + ' already exists.';
  }
  // 3. JWT Authentication Errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token. Please log in again.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your session has expired. Please log in again.';
  }
  // 4. Multer Upload Errors (File size / type)
  else if (err.name === 'MulterError') {
    statusCode = 400;
    message = 'File upload error: ' + err.message;
  }

  res.status(statusCode).json({
    success: false,
    message: message,
    ...(errors ? { errors } : {}),
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
};

module.exports = errorHandler;
