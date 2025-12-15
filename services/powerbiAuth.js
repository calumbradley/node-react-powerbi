// Auth helper: acquire an Azure AD token using client credentials

require('dotenv').config(); // load .env into process.env

// descriptive env var names for clarity
const azureTenantId = process.env.TENANT_ID;
const servicePrincipalClientId = process.env.CLIENT_ID;
const servicePrincipalClientSecret = process.env.CLIENT_SECRET;

// Acquire an Azure AD access token using client credentials flow.
// Returns a Bearer token string for Power BI API calls.
async function acquireAzureAdAccessToken() {
  // build form body for OAuth2 client_credentials
  const params = new URLSearchParams({
    grant_type: 'client_credentials',                             // OAuth2 flow
    client_id: servicePrincipalClientId,                          // app/client id
    client_secret: servicePrincipalClientSecret,                  // app secret
    scope: 'https://analysis.windows.net/powerbi/api/.default'    // Power BI scope
  });

  // token endpoint for the tenant
  const tokenUrl = `https://login.microsoftonline.com/${azureTenantId}/oauth2/v2.0/token`;

  // POST to Azure AD to obtain token
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params
  });

  // surface error details if token request fails
  if (!response.ok) {
    const bodyText = await response.text();
    throw new Error(`AAD token request failed ${response.status}: ${bodyText}`);
  }

  // return the access token string
  const json = await response.json();
  return json.access_token;
}

module.exports = { acquireAzureAdAccessToken };