const express = require('express'); // Express lets us define HTTP routes
const { listWorkspaces } = require('../services/listWorkspaces'); // our Power BI wrapper function

const powerbiWorkspacesRouter = express.Router(); // router you can mount under /powerbi

// GET /powerbi/workspaces?filter=...&top=...&skip=...
powerbiWorkspacesRouter.get('/workspaces', async (req, res) => {
  // read optional query parameters from the URL
  const filter = req.query.filter; // maps to Power BI $filter
  const top = req.query.top;       // maps to Power BI $top
  const skip = req.query.skip;     // maps to Power BI $skip

  try {
    // call the service that talks to Power BI (returns JSON)
    const workspacesResponse = await listWorkspaces({ filter, top, skip });
    return res.json(workspacesResponse); // send Power BI response to the client
  } catch (error) {
    // 502 means "bad gateway" (our server couldn't get a good response upstream)
    return res.status(502).json({ error: error.message });
  }
});

module.exports = { powerbiWorkspacesRouter }; // export so app.js can mount it