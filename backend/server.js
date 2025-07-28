const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const shortid = require('shortid');
const validUrl = require('valid-url');
const moment = require('moment');
require('dotenv').config();

const LoggingMiddleware = require('../logging-middleware/loggingMiddleware');
const { initializeDatabase, urlOperations } = require('./database');

const app = express();
const PORT = process.env.PORT || 8000;

// Initialize logging middleware
const logger = new LoggingMiddleware();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use(logger.requestLogger());

// Validation utilities
const validation = {
  isValidUrl(url) {
    return validUrl.isUri(url);
  },

  isValidShortcode(shortcode) {
    return /^[a-zA-Z0-9]+$/.test(shortcode) && shortcode.length <= 20;
  },

  isValidValidity(validity) {
    return Number.isInteger(validity) && validity > 0 && validity <= 10080; // Max 1 week
  }
};

// Generate unique shortcode
function generateShortcode() {
  return shortid.generate().substring(0, 6);
}

// Get location from IP (simplified)
function getLocationFromIp(ip) {
  // In a real application, you would use a geolocation service
  return 'Unknown Location';
}

// API Routes

// 1. Create Short URL
app.post('/shorturls', async (req, res) => {
  try {
    const { url, validity = 30, shortcode } = req.body;

    // Validate required fields
    if (!url) {
      await logger.logValidationError('url', url, 'URL is required');
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL format
    if (!validation.isValidUrl(url)) {
      await logger.logValidationError('url', url, 'Invalid URL format');
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Validate validity
    if (!validation.isValidValidity(validity)) {
      await logger.logValidationError('validity', validity, 'Validity must be between 1 and 10080 minutes');
      return res.status(400).json({ error: 'Validity must be between 1 and 10080 minutes (1 week)' });
    }

    // Handle custom shortcode
    let finalShortcode = shortcode;
    if (shortcode) {
      if (!validation.isValidShortcode(shortcode)) {
        await logger.logValidationError('shortcode', shortcode, 'Shortcode must be alphanumeric and less than 20 characters');
        return res.status(400).json({ error: 'Shortcode must be alphanumeric and less than 20 characters' });
      }

      // Check if shortcode already exists
      const exists = await urlOperations.shortcodeExists(shortcode);
      if (exists) {
        await logger.Log('URL Creation', 'warn', 'url-shortener', `Shortcode collision: ${shortcode}`);
        return res.status(409).json({ error: 'Shortcode already exists' });
      }
    } else {
      // Generate unique shortcode
      do {
        finalShortcode = generateShortcode();
      } while (await urlOperations.shortcodeExists(finalShortcode));
    }

    // Create short URL
    const shortUrl = await urlOperations.createShortUrl(url, finalShortcode, validity);
    
    await logger.logUrlShortening(url, finalShortcode, validity);

    const response = {
      shortLink: `http://localhost:${PORT}/${finalShortcode}`,
      expiry: moment(shortUrl.expires_at).toISOString()
    };

    res.status(201).json(response);

  } catch (error) {
    await logger.Log('URL Creation', 'error', 'url-shortener', `Failed to create short URL: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 4. Get all URLs
app.get('/shorturls', async (req, res) => {
  try {
    const urls = await urlOperations.getAllUrls();
    
    const response = urls.map(url => ({
      id: url.id,
      shortLink: `http://localhost:${PORT}/${url.shortcode}`,
      originalUrl: url.original_url,
      createdAt: moment(url.created_at).toISOString(),
      expiry: moment(url.expires_at).toISOString(),
      totalClicks: parseInt(url.total_clicks) || 0,
      clickData: url.clickData
    }));

    await logger.Log('URL List', 'info', 'url-shortener', `Retrieved ${response.length} URLs`);

    res.json(response);

  } catch (error) {
    await logger.Log('URL List', 'error', 'url-shortener', `Failed to get URLs: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. Get URL statistics
app.get('/shorturls/:shortcode', async (req, res) => {
  try {
    const { shortcode } = req.params;

    const urlData = await urlOperations.getUrlByShortcode(shortcode);
    
    if (!urlData) {
      await logger.Log('URL Statistics', 'warn', 'url-shortener', `Shortcode not found for stats: ${shortcode}`);
      return res.status(404).json({ error: 'Short URL not found' });
    }

    // Get click data for this URL
    const { pool } = require('./database');
    const result = await pool.query(`
      SELECT timestamp, source, location
      FROM clicks
      WHERE short_url_id = $1
      ORDER BY timestamp DESC
    `, [urlData.id]);

    const response = {
      shortLink: `http://localhost:${PORT}/${shortcode}`,
      originalUrl: urlData.original_url,
      createdAt: moment(urlData.created_at).toISOString(),
      expiry: moment(urlData.expires_at).toISOString(),
      totalClicks: result.rows.length,
      clickData: result.rows
    };

    await logger.Log('URL Statistics', 'info', 'url-shortener', `Retrieved statistics for ${shortcode}`);

    res.json(response);

  } catch (error) {
    await logger.Log('URL Statistics', 'error', 'url-shortener', `Failed to get statistics: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. Redirect to original URL
app.get('/:shortcode', async (req, res) => {
  try {
    const { shortcode } = req.params;

    // Get URL by shortcode
    const urlData = await urlOperations.getUrlByShortcode(shortcode);
    
    if (!urlData) {
      await logger.Log('URL Redirect', 'warn', 'url-shortener', `Shortcode not found: ${shortcode}`);
      return res.status(404).json({ error: 'Short URL not found' });
    }

    // Check if URL is expired
    if (moment().isAfter(urlData.expires_at)) {
      await logger.Log('URL Redirect', 'warn', 'url-shortener', `Expired URL accessed: ${shortcode}`);
      return res.status(410).json({ error: 'URL has expired' });
    }

    // Record click
    const userAgent = req.get('User-Agent') || 'Unknown';
    const ipAddress = req.ip || req.connection.remoteAddress;
    const location = getLocationFromIp(ipAddress);
    const source = req.get('Referer') || 'Direct';

    await urlOperations.recordClick(urlData.id, source, userAgent, ipAddress, location);
    await logger.logUrlRedirect(shortcode, userAgent, ipAddress);

    // Redirect to original URL
    res.redirect(302, urlData.original_url);

  } catch (error) {
    await logger.Log('URL Redirect', 'error', 'url-shortener', `Failed to redirect: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// Error handling middleware
app.use(logger.errorLogger());

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  res.status(500).json({ error: 'Internal server error' });
});

// Cleanup expired URLs every hour
setInterval(async () => {
  try {
    await urlOperations.cleanupExpiredUrls();
  } catch (error) {
    await logger.Log('Cleanup Job', 'error', 'url-shortener', `Cleanup failed: ${error.message}`);
  }
}, 60 * 60 * 1000); // 1 hour

// Start server
async function startServer() {
  try {
    // Initialize database
    await initializeDatabase();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      logger.Log('Server Startup', 'info', 'url-shortener', `Server started on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer(); 