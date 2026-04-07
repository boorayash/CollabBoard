/**
 * Structured request logger middleware.
 * Logs: { level, reqId, method, url, userId, params, body (sanitized) }
 * 
 * Sanitization rules:
 *   ❌ Remove: password, token, authorization
 *   ❌ Truncate: any value > 200 chars
 *   ✅ Log:    IDs, names, flags, roles
 */

const SENSITIVE_KEYS = ['password', 'token', 'authorization', 'secret', 'cookie'];
const MAX_VALUE_LENGTH = 200;

function sanitizeBody(body) {
  if (!body || typeof body !== 'object') return body;

  const sanitized = {};
  for (const [key, value] of Object.entries(body)) {
    if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'string' && value.length > MAX_VALUE_LENGTH) {
      sanitized[key] = value.substring(0, MAX_VALUE_LENGTH) + '...[truncated]';
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

const requestLogger = (req, res, next) => {
  const logEntry = {
    level: 'info',
    reqId: req.id || 'no-id',
    method: req.method,
    url: req.originalUrl,
    userId: req.user?.id || 'unauthenticated',
    params: req.params,
    body: sanitizeBody(req.body),
    timestamp: new Date().toISOString(),
  };

  console.log(`[req:${logEntry.reqId}] ${logEntry.method} ${logEntry.url}`);

  // Log response time on finish
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[req:${logEntry.reqId}] ${res.statusCode} ${duration}ms`);
  });

  next();
};

module.exports = requestLogger;
