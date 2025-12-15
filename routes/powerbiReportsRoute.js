const express = require('express'); // import Express to create a router
const { listReportsInWorkspace } = require('../services/listReportsInWorkspace'); // import the wrapper service

const powerbiReportsRouter = express.Router(); // create a router we can mount in app.js

// GET /powerbi/groups/:groupId/reports
powerbiReportsRouter.get('/groups/:groupId/reports', async (req, res) => {
  const groupId = req.params.groupId; // read workspace (group) id from the URL

  try {
    const reportsResponse = await listReportsInWorkspace(groupId); // call Power BI API via our service
    return res.json(reportsResponse); // return the Power BI JSON response to the client
  } catch (error) {
    return res.status(502).json({ error: error.message }); // return a simple error message
  }
});

module.exports = { powerbiReportsRouter }; // export so app.js can mount it