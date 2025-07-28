const axios = require('axios');

/**
 * Logging Middleware - Makes API calls to test server
 * Structure: Log(stack, level, package, message)
 */
class LoggingMiddleware {
  constructor() {
    this.testServerUrl = process.env.TEST_SERVER_URL || 'https://httpbin.org/post';
    this.packageName = 'url-shortener-backend';
  }

  /**
   * Main logging function that makes API call to test server
   * @param {string} stack - Stack trace or context
   * @param {string} level - Log level (info, warn, error, debug)
   * @param {string} packageName - Package name
   * @param {string} message - Log message
   */
  async Log(stack, level, packageName, message) {
    try {
             const logData = {
         timestamp: new Date().toISOString(),
         level: level,
         package: packageName,
         message: message,
         stack: stack,
         requestId: this.generateRequestId()
       };

      // Make API call to test server
      await axios.post(this.testServerUrl, logData, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'URL-Shortener-Logging-Middleware/1.0.0'
        },
        timeout: 5000
      });

             // Also log to console for development
       console.log(`[${level.toUpperCase()}] ${packageName}: ${message}`);
      
    } catch (error) {
      // Fallback logging if test server is unavailable
      console.error('Logging middleware error:', error.message);
             console.log(`[${level.toUpperCase()}] ${packageName}: ${message}`);
    }
  }

  /**
   * Generate unique request ID
   */
  generateRequestId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Express middleware for request logging
   */
  requestLogger() {
    return async (req, res, next) => {
      const startTime = Date.now();
      const requestId = this.generateRequestId();
      
      // Log request
      await this.Log(
        'Request Middleware',
        'info',
        this.packageName,
        `Incoming ${req.method} request to ${req.path} from ${req.ip}`
      );

      // Override res.end to log response
      const originalEnd = res.end;
      res.end = function(chunk, encoding) {
        const duration = Date.now() - startTime;
        
        // Log response
        this.Log(
          'Response Middleware',
          'info',
          this.packageName,
          `Response ${res.statusCode} for ${req.method} ${req.path} (${duration}ms)`
        );

        originalEnd.call(res, chunk, encoding);
      }.bind(this);

      next();
    };
  }

  /**
   * Error logging middleware
   */
  errorLogger() {
    return async (err, req, res, next) => {
      await this.Log(
        err.stack || 'No stack trace',
        'error',
        this.packageName,
        `Error: ${err.message} - ${req.method} ${req.path}`
      );
      next(err);
    };
  }

  /**
   * Database operation logging
   */
  async logDatabaseOperation(operation, table, details) {
    await this.Log(
      'Database Operation',
      'info',
      this.packageName,
      `${operation} on ${table}: ${JSON.stringify(details)}`
    );
  }

  /**
   * URL shortening operation logging
   */
  async logUrlShortening(originalUrl, shortcode, validity) {
    await this.Log(
      'URL Shortening',
      'info',
      this.packageName,
      `Created shortcode ${shortcode} for ${originalUrl} with ${validity} minutes validity`
    );
  }

  /**
   * URL redirect logging
   */
  async logUrlRedirect(shortcode, userAgent, ipAddress) {
    await this.Log(
      'URL Redirect',
      'info',
      this.packageName,
      `Redirect for ${shortcode} from ${ipAddress} (${userAgent})`
    );
  }

  /**
   * Validation error logging
   */
  async logValidationError(field, value, error) {
    await this.Log(
      'Validation Error',
      'warn',
      this.packageName,
      `Invalid ${field}: "${value}" - ${error}`
    );
  }

  /**
   * Security event logging
   */
  async logSecurityEvent(event, details) {
    await this.Log(
      'Security Event',
      'warn',
      this.packageName,
      `${event}: ${JSON.stringify(details)}`
    );
  }
}

module.exports = LoggingMiddleware; 