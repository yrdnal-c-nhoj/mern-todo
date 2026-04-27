/**
 * Security middleware for the MERN Todo application
 * Implements comprehensive security measures including CSP, HSTS, XSS protection, and rate limiting
 */

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

/**
 * Configures security headers using Helmet.js
 * - Content Security Policy (CSP) to prevent XSS attacks
 * - HTTP Strict Transport Security (HSTS) for HTTPS enforcement
 * - Additional security headers for browser protection
 */
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://nasapod-1.onrender.com", "https://*.vercel.app", "http://localhost:*", "https://*.render.com"],
    },
  },
  // Prevent browser-level JSON.parse errors on reporting headers
  reportingEndpoints: false,
  crossOriginEmbedderPolicy: false,
  // Ensure cross-origin resources (like the API) can be fetched
  crossOriginResourcePolicy: { policy: "cross-origin" },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

/**
 * Custom XSS protection middleware
 * Sanitizes request body data by removing script tags and potentially malicious content
 * Works as an additional layer of protection beyond CSP
 */
const xssProtection = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      }
    });
  }
  next();
};

/**
 * Global rate limiting middleware
 * Prevents brute force attacks and API abuse
 * Limits requests to 1000 per IP per 15-minute window
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  securityHeaders,
  xssProtection,
  globalLimiter
};
