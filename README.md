# Zephyr

Zephyr is a small web experience inspired by the [Cloud Resume Challenge](https://cloudresumechallenge.dev/docs/the-challenge/azure/). The project consists of a Vite + TS + React frontend and a C# Azure Functions backend. The backend exposes two APIs. A weather API to get the precipitation at a fixed real-world location and a visitor counter backed by Azure Table Storage.

The frontend and the weather API are hosted as a Static Web App. The visitor counter is hosted as a separate Azure Function App and connects to the storage using Entra ID. All infrastructure is deployed using an IaC approach with Bicep.

## Tech Stack
- Vite
- TypeScript
- React
- Three.js
- C# / .NET
- Azure Static Web App
- Azure Functions
- Azure Table Storage