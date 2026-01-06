# cors-service

Server-side proxy for Azure DevOps (ADO) so the browser never calls ADO directly.

## What you get

- Azure Functions (Node.js/TypeScript) API
  - `GET /api/healthz`
  - `/api/ado/{*path}` forwards to `https://dev.azure.com/{ADO_ORG}/{path}`
- Server-side auth (no browser credentials)
  - Default: Personal Access Token (PAT)
  - Optional: Managed Identity / Entra ID via `DefaultAzureCredential`

## Local development

Prereqs:

- Node.js 20+
- Azure Functions Core Tools v4

Setup:

1) Install deps

- `cd api`
- `npm install`

2) Create local settings

- Copy `local.settings.example.json` to `local.settings.json`
- Fill in `ADO_ORG` and **either** `ADO_PAT` **or** set `ADO_USE_MI=true`

3) Run

- `npm run build`
- `npm start`

Test:

- `curl http://localhost:7071/api/healthz`
- Example ADO call (list projects):
  - `curl "http://localhost:7071/api/ado/_apis/projects?api-version=7.1-preview.4"`

## Angular usage

Instead of calling `https://dev.azure.com/...` from the browser, call your own same-origin endpoint:

- `/api/ado/...`

Example:

- Browser used to call:
  - `https://dev.azure.com/{org}/{project}/_apis/wit/workitems?api-version=...`
- Browser should call:
  - `/api/ado/{project}/_apis/wit/workitems?api-version=...`

## Deployment (Azure)

See `infra/` and `.github/workflows/` once scaffolded.
