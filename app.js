// A minimal Express server with a placeholder /embed-token endpoint

// load environment variables from .env into process.env
require('dotenv').config();

// import Express framework
const express = require('express');

// import the modular powerbi service that handles AAD + Power BI calls
const { generateReportEmbedToken } = require('./services/generateReportEmbedToken');

// create an Express app
const app = express(); // create the Express application

// mount simple morgan logger middleware to log incoming HTTP requests
app.use(require('./middleware/requestLogger')); // uses middleware/requestLogger.js (tiny format)

// read common config from environment
const PORT = process.env.PORT || 3000;
const { TENANT_ID, CLIENT_ID, CLIENT_SECRET, WORKSPACE_ID, REPORT_ID } = process.env;

// simple endpoint that will return an embed token (not implemented yet)
app.get('/embed-token', async (req, res) => {
  // basic validation: ensure required env vars are present
  if (!TENANT_ID || !CLIENT_ID || !CLIENT_SECRET || !WORKSPACE_ID || !REPORT_ID) {
    return res.status(500).json({ error: 'Missing required environment variables' });
  }

  try {
    // call the modular service with workspace and report ids to get embed data
    const tokenResponse = await generateReportEmbedToken(WORKSPACE_ID, REPORT_ID);
    return res.json(tokenResponse);
  } catch (err) {
    // return error to client
    return res.status(501).json({ error: err.message || 'Not implemented' });
  }
});

const { powerbiReportsRouter } = require('./routes/powerbiReportsRoute'); // import the router module

app.use('/powerbi', powerbiReportsRouter); // mount it so /powerbi/groups/:groupId/reports works

// start the server and listen for requests
app.listen(PORT, () => {
  // log that the server started
  console.log(`Server listening on http://localhost:${PORT}`);
});

// remove the local placeholder getEmbedToken function (now provided by services/powerbi)