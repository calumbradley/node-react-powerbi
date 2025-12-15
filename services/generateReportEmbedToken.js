// Service module: acquires AAD token and calls Power BI REST APIs (with simple logging)

// read environment variables into clearer local names for readability
const azureTenantId = process.env.TENANT_ID;                 // Azure AD tenant id
const servicePrincipalClientId = process.env.CLIENT_ID;     // service principal id
const servicePrincipalClientSecret = process.env.CLIENT_SECRET; // service principal secret

const { acquireAzureAdAccessToken } = require('./acquireAzureAdAccessToken'); // import auth helper

// small helper to produce ISO timestamps for logs
function nowIso() {
  return new Date().toISOString(); // return current time in ISO format
}

// Generate an embed token and return embedUrl + reportId for a report in a workspace.
// Function name uses full words for clarity.
async function generateReportEmbedToken(workspaceId, reportId) {
  // log entry with workspace and report identifiers
  console.log(`[${nowIso()}] generateReportEmbedToken - started`, { workspaceId, reportId });

  try {
    // get an AAD access token using the shared auth helper
    const accessToken = await acquireAzureAdAccessToken();
    console.log(`[${nowIso()}] acquireAzureAdAccessToken - success`); // log successful token acquisition

    // fetch report metadata to obtain embedUrl
    const reportUrl = `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/reports/${reportId}`;
    const reportRes = await fetch(reportUrl, {
      headers: { Authorization: `Bearer ${accessToken}` } // use token from helper
    });
    if (!reportRes.ok) {
      const body = await reportRes.text();
      // log the error response from Power BI before throwing
      console.error(`[${nowIso()}] Report fetch error`, { status: reportRes.status, body });
      throw new Error(`Report fetch error ${reportRes.status}: ${body}`);
    }
    const reportJson = await reportRes.json();
    const embedUrl = reportJson.embedUrl || '';
    console.log(`[${nowIso()}] Report metadata fetched`, { embedUrl }); // log embedUrl for debugging

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
      // log the embed token generation failure
      console.error(`[${nowIso()}] Generate token error`, { status: genRes.status, body });
      throw new Error(`Generate token error ${genRes.status}: ${body}`);
    }
    const genJson = await genRes.json();

    // log success and return the minimal payload the client requires
    console.log(`[${nowIso()}] Embed token generated successfully`);
    return {
      embedToken: genJson.token,
      embedUrl,
      reportId: reportJson.id || reportId
    };
  } catch (err) {
    // log unexpected errors and rethrow for upstream handling
    console.error(`[${nowIso()}] generateReportEmbedToken - unexpected error`, { message: err.message });
    throw err;
  }
}

// export both the new descriptive name and keep the original name for compatibility
module.exports = {
  generateReportEmbedToken,                                   // new descriptive export
};