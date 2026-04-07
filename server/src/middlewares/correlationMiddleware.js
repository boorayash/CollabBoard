const { v4: uuidv4 } = require('uuid');

/**
 * Assigns a unique correlation ID to every incoming request.
 * This ID is used across all logs and error responses for tracing.
 */
const correlationMiddleware = (req, res, next) => {
  req.id = uuidv4();
  res.setHeader('X-Request-Id', req.id);
  next();
};

module.exports = correlationMiddleware;
