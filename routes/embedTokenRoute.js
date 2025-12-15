// Creates a dedicated router for the /embed-token endpoint (keeps app.js consistent)

const express = require('express'); // Express gives us the Router feature
const { generateReportEmbedToken } = require('../services/generateReportEmbedToken'); // calls Power BI token logic

const embedTokenRouter = express.Router(); // makes a mini "sub-app" for related routes

// GET /embed-token
embedTokenRouter.get('/embed-token', async (req, res) => {
  // Read env vars at request-time (so the handler always uses current config)
  const { TENANT_ID, CLIENT_ID, CLIENT_SECRET, WORKSPACE_ID, REPORT_ID } = process.env;

  // Basic validation: fail early if config is missing
  if (!TENANT_ID || !CLIENT_ID || !CLIENT_SECRET || !WORKSPACE_ID || !REPORT_ID) {
    return res.status(500).json({ error: 'Missing required environment variables' }); // tell client what's wrong
  }

  try {
    // Ask the service to generate the embed payload (token + embedUrl + reportId)
    const tokenResponse = await generateReportEmbedToken(WORKSPACE_ID, REPORT_ID);

    return res.json(tokenResponse); // send the payload back as JSON
  } catch (err) {
    // Return a simple error response (keeps client behaviour unchanged)
    return res.status(501).json({ error: err.message || 'Not implemented' });
  }
});

module.exports = { embedTokenRouter }; // export so app.js can mount it