/**
 * Centralized error handling middleware.
 * - Always returns structured JSON with reqId.
 * - Exposes stack trace ONLY in development mode.
 */
const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const reqId = req.id || 'no-id';

  // Always log full error server-side
  console.error(`[req:${reqId}] ERROR:`, {
    level: 'error',
    reqId,
    method: req.method,
    url: req.originalUrl,
    userId: req.user?.id || 'unauthenticated',
    message: err.message,
    stack: err.stack,
  });

  const response = {
    status: 'error',
    reqId,
    message: err.message || 'Internal Server Error',
  };

  // Dev-only: include stack trace
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorMiddleware;
