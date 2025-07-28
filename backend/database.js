const { Pool } = require('pg');
const LoggingMiddleware = require('./loggingMiddleware');

const logger = new LoggingMiddleware();

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'url_shortener',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

// Initialize database tables
async function initializeDatabase() {
  try {
    await logger.Log('Database Initialization', 'info', 'database', 'Starting database initialization');

    // Create short_urls table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS short_urls (
        id SERIAL PRIMARY KEY,
        original_url TEXT NOT NULL,
        shortcode VARCHAR(20) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        is_active BOOLEAN DEFAULT TRUE
      )
    `);
    await logger.logDatabaseOperation('CREATE', 'short_urls', 'Table created successfully');

    // Create clicks table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS clicks (
        id SERIAL PRIMARY KEY,
        short_url_id INTEGER REFERENCES short_urls(id) ON DELETE CASCADE,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        source VARCHAR(255),
        user_agent TEXT,
        ip_address INET,
        location VARCHAR(255)
      )
    `);
    await logger.logDatabaseOperation('CREATE', 'clicks', 'Table created successfully');

    // Create indexes for better performance
    await pool.query('CREATE INDEX IF NOT EXISTS idx_short_urls_shortcode ON short_urls(shortcode)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_short_urls_expires_at ON short_urls(expires_at)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_clicks_short_url_id ON clicks(short_url_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_clicks_timestamp ON clicks(timestamp)');

    await logger.Log('Database Initialization', 'info', 'database', 'Database initialization completed successfully');
  } catch (error) {
    await logger.Log('Database Initialization', 'error', 'database', `Database initialization failed: ${error.message}`);
    throw error;
  }
}

// URL operations
const urlOperations = {
  // Create new short URL
  async createShortUrl(originalUrl, shortcode, validityMinutes) {
    try {
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + validityMinutes);

      const result = await pool.query(
        'INSERT INTO short_urls (original_url, shortcode, expires_at) VALUES ($1, $2, $3) RETURNING *',
        [originalUrl, shortcode, expiresAt]
      );

      await logger.logDatabaseOperation('INSERT', 'short_urls', {
        shortcode,
        originalUrl,
        validityMinutes
      });

      return result.rows[0];
    } catch (error) {
      await logger.Log('Database Operation', 'error', 'database', `Failed to create short URL: ${error.message}`);
      throw error;
    }
  },

  // Get URL by shortcode
  async getUrlByShortcode(shortcode) {
    try {
      const result = await pool.query(
        'SELECT * FROM short_urls WHERE shortcode = $1 AND is_active = TRUE',
        [shortcode]
      );

      await logger.logDatabaseOperation('SELECT', 'short_urls', { shortcode });

      return result.rows[0];
    } catch (error) {
      await logger.Log('Database Operation', 'error', 'database', `Failed to get URL by shortcode: ${error.message}`);
      throw error;
    }
  },

  // Get all URLs with click counts
  async getAllUrls() {
    try {
      const result = await pool.query(`
        SELECT 
          s.*,
          COUNT(c.id) as total_clicks,
          ARRAY_AGG(
            JSON_BUILD_OBJECT(
              'timestamp', c.timestamp,
              'source', c.source,
              'location', c.location
            )
          ) FILTER (WHERE c.id IS NOT NULL) as click_data
        FROM short_urls s
        LEFT JOIN clicks c ON s.id = c.short_url_id
        WHERE s.is_active = TRUE
        GROUP BY s.id
        ORDER BY s.created_at DESC
      `);

      await logger.logDatabaseOperation('SELECT', 'short_urls', 'Retrieved all URLs with click data');

      return result.rows.map(row => ({
        ...row,
        clickData: row.click_data || []
      }));
    } catch (error) {
      await logger.Log('Database Operation', 'error', 'database', `Failed to get all URLs: ${error.message}`);
      throw error;
    }
  },

  // Record click
  async recordClick(shortUrlId, source, userAgent, ipAddress, location) {
    try {
      const result = await pool.query(
        'INSERT INTO clicks (short_url_id, source, user_agent, ip_address, location) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [shortUrlId, source, userAgent, ipAddress, location]
      );

      await logger.logDatabaseOperation('INSERT', 'clicks', {
        shortUrlId,
        source,
        ipAddress
      });

      return result.rows[0];
    } catch (error) {
      await logger.Log('Database Operation', 'error', 'database', `Failed to record click: ${error.message}`);
      throw error;
    }
  },

  // Check if shortcode exists
  async shortcodeExists(shortcode) {
    try {
      const result = await pool.query(
        'SELECT COUNT(*) FROM short_urls WHERE shortcode = $1',
        [shortcode]
      );

      return parseInt(result.rows[0].count) > 0;
    } catch (error) {
      await logger.Log('Database Operation', 'error', 'database', `Failed to check shortcode existence: ${error.message}`);
      throw error;
    }
  },

  // Clean up expired URLs
  async cleanupExpiredUrls() {
    try {
      const result = await pool.query(
        'UPDATE short_urls SET is_active = FALSE WHERE expires_at < NOW() AND is_active = TRUE'
      );

      if (result.rowCount > 0) {
        await logger.Log('Database Cleanup', 'info', 'database', `Cleaned up ${result.rowCount} expired URLs`);
      }

      return result.rowCount;
    } catch (error) {
      await logger.Log('Database Cleanup', 'error', 'database', `Failed to cleanup expired URLs: ${error.message}`);
      throw error;
    }
  }
};

module.exports = {
  pool,
  initializeDatabase,
  urlOperations
}; 