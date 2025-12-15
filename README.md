# node-react-powerbi

![Node.js](https://img.shields.io/badge/Node-18%2B-339933?logo=node.js&logoColor=white) ![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white) ![Power BI](https://img.shields.io/badge/Power%20BI-Embedded-F2C811?logo=microsoft-power-bi&logoColor=black) ![React](https://img.shields.io/badge/React-18-blue?logo=react&logoColor=white) ![dotenv](https://img.shields.io/badge/dotenv-.env-lightgrey)

A minimal Node backend that returns Power BI embed tokens for a React client using powerbi-client-react.

Quick start
- Create a `.env` in the project root with required values:
  ```
  TENANT_ID=your-azure-tenant-id
  CLIENT_ID=your-service-principal-client-id
  CLIENT_SECRET=your-service-principal-client-secret
  WORKSPACE_ID=your-powerbi-workspace-id
  REPORT_ID=your-powerbi-report-id
  PORT=3000
  ```
- Install deps:
  ```
  npm install express dotenv
  ```
- Run the server:
  ```
  node app.js
  ```
- Get an embed payload:
  ```
  curl http://localhost:3000/embed-token
  ```
  Response: { "embedToken": "...", "embedUrl": "...", "reportId": "..." }

## Setup (Azure + Power BI)

- Azure AD app registration  
  - Create a confidential app (record Tenant ID and Client ID). (creates service principal used by the server)
  - Add a client secret or certificate and save its value. (used for client credentials auth)

- API permissions & consent  
  - Add Power BI Service API permissions and click "Grant admin consent". (allows app to call Power BI APIs)

- Power BI tenant settings (Admin portal)  
  - Ensure "Service principals can call Fabric public APIs" or "Allow service principals to use Power BI APIs" is enabled. (lets apps use Power BI REST)
  - If restricting by groups, add the app's service principal to the allowed security group. (limits which apps can call APIs)

- Workspace & report access (Power BI service)  
  - Open the target workspace → Access → Add → enter the service principal (app) and assign Viewer.

- Local app configuration (.env)  
  - Set TENANT_ID, CLIENT_ID, CLIENT_SECRET, WORKSPACE_ID, REPORT_ID, PORT. (required by the Node server)

- Verify & test  
  - Start server with `node app.js` and call `/embed-token;` with `curl http://localhost:3000/embed-token`

## Required Power BI Service API permissions (Application)

- Report.Read.All — read reports (needed to get embedUrl).  
- Dataset.Read.All — read datasets (needed if report uses datasets). 

**Important — apply admin consent for all permissions**  
- After you add the required API permissions in Azure AD, click "Grant admin consent for <your-tenant-name>" to apply tenant-wide admin consent for all configured permissions.