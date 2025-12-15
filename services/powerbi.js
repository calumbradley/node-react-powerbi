// Service module: acquires AAD token and calls Power BI REST APIs

// read environment variables into clearer local names for readability
const azureTenantId = process.env.TENANT_ID;                 // Azure AD tenant id
const servicePrincipalClientId = process.env.CLIENT_ID;     // service principal id
const servicePrincipalClientSecret = process.env.CLIENT_SECRET; // service principal secret

// Acquire an Azure AD access token using client credentials flow.
// Note: Node 18+ has global fetch; install node-fetch for older Node versions.
async function acquireAzureAdAccessToken() {
  // build form-encoded request body for OAuth2 client_credentials
  const params = new URLSearchParams({
    grant_type: 'client_credentials',                         // OAuth2 grant type
    client_id: servicePrincipalClientId,                      // service principal id
    client_secret: servicePrincipalClientSecret,              // service principal secret
    scope: 'https://analysis.windows.net/powerbi/api/.default' // Power BI scope
  });

  // call Azure AD token endpoint for the tenant
  const tokenUrl = `https://login.microsoftonline.com/${azureTenantId}/oauth2/v2.0/token`;
  const resp = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params
  });

  // throw a helpful error if request failed
  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`AAD token error ${resp.status}: ${body}`);
  }

  // return the access token string
  const json = await resp.json();
  return json.access_token;
}

// Generate an embed token and return embedUrl + reportId for a report in a workspace.
// Function name uses full words for clarity.
async function generateReportEmbedToken(workspaceId, reportId) {
  // get AAD access token first
  const accessToken = await acquireAzureAdAccessToken();

  // fetch report metadata to obtain embedUrl
  const reportUrl = `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/reports/${reportId}`;
  const reportRes = await fetch(reportUrl, {
    headers: { Authorization: `Bearer ${accessToken}` }      // use AAD token
  });
  if (!reportRes.ok) {
    const body = await reportRes.text();
    throw new Error(`Report fetch error ${reportRes.status}: ${body}`);
  }
  const reportJson = await reportRes.json();
  const embedUrl = reportJson.embedUrl || '';                // embed URL for client

  // request a report embed token (minimal accessLevel: View)
  const genUrl = `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/reports/${reportId}/GenerateToken`;
  const genRes = await fetch(genUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,                 // auth header
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ accessLevel: 'View' })            // minimal permission
  });
  if (!genRes.ok) {
    const body = await genRes.text();
    throw new Error(`Generate token error ${genRes.status}: ${body}`);
  }
  const genJson = await genRes.json();

  // return the minimal payload the client requires
  return {
    embedToken: genJson.token,                                // embed token string
    embedUrl,                                                 // embed URL
    reportId: reportJson.id || reportId                       // ensure report id present
  };
}

// export both the new descriptive name and keep the original name for compatibility
module.exports = {
  generateReportEmbedToken,                                   // new descriptive export
  getEmbedToken: generateReportEmbedToken                     // legacy alias used by app.js
};