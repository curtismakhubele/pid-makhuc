# PID Facilities Management System — Deployment Guide

This is a static, single-page web app (`index.html`, no build step, no server required).
It's ready to push to GitHub and host on Azure Static Web Apps for free.

## Before you deploy — read this

- **Data storage:** the app now uses your browser's `localStorage` when hosted outside Claude.ai.
  This means data is saved **per device/per browser only** — if you open the app on your phone and
  your laptop, they won't see each other's data, and clearing browser data wipes it. This is fine for
  a demo or single-user use, but **not fine for a real multi-person team tool.** For that you'll need a
  real backend + database (see "Next step" at the bottom).
- **WhatsApp and Microsoft 365 tabs** are working UI only — no live account is connected. Wiring those
  up for real requires a WhatsApp Business API account / Azure AD app registration plus a backend to
  hold the access tokens securely. Don't put real credentials into this static site's code — secrets in
  client-side JavaScript are visible to anyone who views the page source.

## Step 1 — Push to GitHub

1. Go to [github.com/new](https://github.com/new) and create a new repository (e.g. `pid-facilities`).
   Keep it **Public** or **Private** — either works with Azure Static Web Apps' free tier.
2. On your computer, in the folder containing `index.html` and the `.github` folder from this package:
   ```bash
   git init
   git add .
   git commit -m "Initial commit — PID Facilities Management System"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/pid-facilities.git
   git push -u origin main
   ```
   (Replace `YOUR-USERNAME` and the repo name with your own.)

## Step 2 — Create the Azure Static Web App

1. Go to the [Azure Portal](https://portal.azure.com) and search for **Static Web Apps** → **Create**.
2. Fill in:
   - **Subscription / Resource group**: your own
   - **Name**: e.g. `pid-facilities`
   - **Plan type**: **Free**
   - **Region**: closest to you (e.g. South Africa North, if available — otherwise West Europe)
   - **Deployment source**: **GitHub**
3. Sign in to GitHub when prompted and select:
   - **Organization**: your account
   - **Repository**: the repo you just created
   - **Branch**: `main`
4. Under **Build Details**:
   - **Build presets**: Custom
   - **App location**: `/`
   - **Output location**: *(leave blank)*
5. Click **Review + Create**, then **Create**.

Azure will automatically commit a GitHub Actions workflow to your repo (or use the one already included
here at `.github/workflows/azure-static-web-apps.yml`) and it will connect the `AZURE_STATIC_WEB_APPS_API_TOKEN`
secret for you. Within a few minutes your app will build and deploy.

## Step 3 — Find your live URL

In the Azure Portal, open your Static Web App resource — the URL is shown at the top
(something like `https://calm-sand-0a1b2c3.azurestaticapps.net`). Every future push to `main`
will auto-redeploy.

## Optional — custom domain

In the Static Web App resource, go to **Custom domains** → **Add**, and follow the DNS instructions
Azure gives you (a CNAME or TXT record with your domain registrar).

## Next step — making this a real multi-user production system

To go beyond "works great for one person on one device," you'd need:
1. **A backend API** (e.g. Azure Functions, which pairs naturally with Static Web Apps) to handle
   reads/writes to a real database instead of localStorage.
2. **A database** (e.g. Azure Cosmos DB or Azure SQL) so all users see the same data.
3. **Authentication** (Azure Static Web Apps has built-in auth providers, including Microsoft/Entra ID —
   a natural fit given you want Microsoft 365 integration).
4. **Azure AD app registration** for real Microsoft Graph access (email/calendar), and a
   **WhatsApp Business API** account for real WhatsApp messaging — both need their credentials held
   server-side in the backend, never in this static frontend.

Happy to help design and build that backend piece by piece when you're ready — it's a meaningfully
bigger project than the frontend, so it's worth tackling as its own phase.
