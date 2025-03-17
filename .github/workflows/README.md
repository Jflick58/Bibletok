# GitHub Actions CI/CD for Bibletok

This workflow handles continuous integration and deployment for the Bibletok application.

## Workflow Overview

The CI/CD process consists of three main jobs:

1. **Frontend Tests**: Runs linting, tests, and builds the frontend React application
2. **Backend Tests**: Runs tests and builds the Node.js backend
3. **Deployment**: Deploys both frontend and backend to Vercel if all tests pass

## Required Secrets

To use this workflow with Vercel, you need to add the following secrets to your GitHub repository:

- `VERCEL_TOKEN`: Your Vercel API token
- `VERCEL_ORG_ID`: Your Vercel organization ID
- `VERCEL_PROJECT_ID_FRONTEND`: Project ID for your frontend application
- `VERCEL_PROJECT_ID_BACKEND`: Project ID for your backend application

## Getting Vercel Credentials

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel login` and authenticate
3. For each project (frontend/backend):
   - Navigate to the project directory
   - Run `vercel link` to link to a Vercel project
   - Get the project ID and org ID values from the `.vercel/project.json` file

## Environment Variables

Make sure to configure environment variables in your Vercel project settings, including:
- `BIBLE_API_KEY`: Your API key for the Bible API

## Customizing the Workflow

You can modify the `ci.yml` file to add additional tests, change Node.js versions, or customize the deployment process.