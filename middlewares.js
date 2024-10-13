const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit');


// Error logging middleware
const errorLogger = (err, req, res, next) => {
  const logFile = path.join(__dirname, './logs/errors.log');
  
  // Log error details to a file
  const logMessage = `[${new Date().toISOString()}] ${err.message}\nStack: ${err.stack}\nRequest: ${req.method} ${req.url}\n\n`;
  fs.appendFile(logFile, logMessage, (error) => {
    if (error) {
      console.error("Failed to write error log:", error);
    }
  });

  // Send a generic response
  res.status(500).json({
    message: "An internal server error occurred. Please try again later."
  });
};

// Setup rate limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
      status: 429,
      message: 'Too many requests, please try again later.',
    },
  });
  


module.exports = { errorLogger, apiLimiter };