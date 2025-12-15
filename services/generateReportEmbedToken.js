// Service module: acquires AAD token and calls Power BI REST APIs

// read environment variables into clearer local names for readability
const azureTenantId = process.env.TENANT_ID;                 // Azure AD tenant id
const servicePrincipalClientId = process.env.CLIENT_ID;     // service principal id
const servicePrincipalClientSecret = process.env.CLIENT_SECRET; // service principal secret

const { acquireAzureAdAccessToken } = require('./powerbiAuth'); // import auth helper

// Generate an embed token and return embedUrl + reportId for a report in a workspace.
// Function name uses full words for clarity.
async function generateReportEmbedToken(workspaceId, reportId) {
  // get an AAD access token using the shared auth helper
  const accessToken = await acquireAzureAdAccessToken();

  // fetch report metadata to obtain embedUrl
  const reportUrl = `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/reports/${reportId}`;
  const reportRes = await fetch(reportUrl, {
    headers: { Authorization: `Bearer ${accessToken}` } // use token from helper
  });
  if (!reportRes.ok) {
    const body = await reportRes.text();
    throw new Error(`Report fetch error ${reportRes.status}: ${body}`);
  }
  const reportJson = await reportRes.json();
  const embedUrl = reportJson.embedUrl || '';

  // request a report embed token (minimal accessLevel: View)
  const genUrl = `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/reports/${reportId}/GenerateToken`;
  const genRes = await fetch(genUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`, // reuse same token
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ accessLevel: 'View' })
  });
  if (!genRes.ok) {
    const body = await genRes.text();
    throw new Error(`Generate token error ${genRes.status}: ${body}`);
  }
  const genJson = await genRes.json();

  // return the minimal payload the client requires
  return {
    embedToken: genJson.token,
    embedUrl,
    reportId: reportJson.id || reportId
  };
}

// export both the new descriptive name and keep the original name for compatibility
module.exports = {
  generateReportEmbedToken,                                   // new descriptive export
};