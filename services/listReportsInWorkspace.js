// Wrapper: list reports in a specific Power BI workspace (group)

const { acquireAzureAdAccessToken } = require('./acquireAzureAdAccessToken'); // reuse existing auth helper

async function listReportsInWorkspace(groupId) {
  // guard against missing input early
  if (!groupId) throw new Error('groupId is required'); // fail fast with a clear message

  const accessToken = await acquireAzureAdAccessToken(); // get an AAD token for Power BI APIs

  // build the Power BI REST API URL for listing reports in a workspace
  const powerBiReportsUrl = `https://api.powerbi.com/v1.0/myorg/groups/${groupId}/reports`;

  // call Power BI API with Bearer auth
  const response = await fetch(powerBiReportsUrl, {
    method: 'GET', // list reports
    headers: { Authorization: `Bearer ${accessToken}` } // send the AAD token
  });

  // if Power BI returns an error, include the response body for debugging
  if (!response.ok) {
    const errorBodyText = await response.text(); // read error details
    throw new Error(`List reports failed ${response.status}: ${errorBodyText}`); // throw a helpful error
  }

  return await response.json(); // return the JSON response from Power BI
}

module.exports = { listReportsInWorkspace }; // export for routes/controllers