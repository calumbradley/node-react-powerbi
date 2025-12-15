// simple morgan request-logging middleware

const morgan = require('morgan');               // import morgan logger

// create and export a tiny-format morgan middleware (concise logs)
const requestLogger = morgan('tiny');

module.exports = requestLogger;                  // export for mounting in app.js