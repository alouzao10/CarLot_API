// Middleware function to log the requests to the console
const logger = (req, res, next) => {
   console.log("============ Request Being Made ============");
   console.log(`Route Request: ${req.originalUrl}`);
   next();
};

// Export the logger to the app for use to log the requests made
module.exports = logger;
