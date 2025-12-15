// Wrapper: list workspaces (groups) with optional $filter, $top, $skip query params

// filepath: /Users/calumbradley/Developer/powerbi/node-react-powerbi/services/listWorkspaces.js
const { acquireAzureAdAccessToken } = require('./acquireAzureAdAccessToken'); // reuse existing auth helper

async function listWorkspaces({ filter, top, skip } = {}) {
  const accessToken = await acquireAzureAdAccessToken(); // get a Power BI API access token

  const queryParameters = new URLSearchParams(); // build query string safely

  if (filter) queryParameters.set('$filter', filter); // add optional OData filter
  if (top != null) queryParameters.set('$top', String(top)); // add optional page size
  if (skip != null) queryParameters.set('$skip', String(skip)); // add optional offset

  const queryString = queryParameters.toString(); // convert params to "?a=b&c=d" format
  const powerBiUrl = `https://api.powerbi.com/v1.0/myorg/groups${queryString ? `?${queryString}` : ''}`; // final URL

  const response = await fetch(powerBiUrl, {
    method: 'GET', // list workspaces
    headers: { Authorization: `Bearer ${accessToken}` } // send token to Power BI
  });

  if (!response.ok) {
    const errorBodyText = await response.text(); // read Power BI error details
    throw new Error(`List workspaces failed ${response.status}: ${errorBodyText}`); // throw a clear error
  }

  return await response.json(); // return the JSON payload from Power BI
}

module.exports = { listWorkspaces }; // export for routes/controllers