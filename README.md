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

Notes
- Node 18+ includes global fetch; install a polyfill (e.g., node-fetch) if using older Node.
- The service principal must be allowed by tenant settings and added to the Power BI workspace with Member/Contributor/Admin (reshare) rights.

Shall I add this README to the repository? 