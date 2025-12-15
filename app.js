// A minimal Express server with a placeholder /embed-token endpoint

// load environment variables from .env into process.env
require('dotenv').config();

// import Express framework
const express = require('express'); // Express builds the HTTP server

// import the modular powerbi service that handles AAD + Power BI calls
const { generateReportEmbedToken } = require('./services/generateReportEmbedToken');

// create an Express app
const app = express(); // creates the Express application

// mount simple morgan logger middleware to log incoming HTTP requests
app.use(require('./middleware/requestLogger')); // uses middleware/requestLogger.js (tiny format)

// enable CORS for all origins (test-only)
const cors = require('cors'); // imports the CORS middleware package

app.use(cors()); // allows all origins (test-only) to call your API

// read common config from environment
const PORT = process.env.PORT || 3000; // uses PORT from .env, otherwise defaults to 3000

// mount the /embed-token route from routes/ (keeps app.js consistent with other routes)
const { embedTokenRouter } = require('./routes/embedTokenRoute'); // imports the router module
app.use(embedTokenRouter); // registers GET /embed-token

const { powerbiReportsRouter } = require('./routes/powerbiReportsRoute'); // import the router module
app.use('/powerbi', powerbiReportsRouter); // mount it so /powerbi/groups/:groupId/reports works
const { powerbiWorkspacesRouter } = require('./routes/powerbiWorkspacesRoute'); // loads the router module
app.use('/powerbi', powerbiWorkspacesRouter); // enables /powerbi/workspaces alongside your other routes

// start the server and listen for requests
app.listen(PORT, () => {
  // log that the server started
  console.log(`Server listening on http://localhost:${PORT}`);
});

// remove the local placeholder getEmbedToken function (now provided by services/powerbi)