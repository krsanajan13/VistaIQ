# Vercel Deployment Guide (Free Tier)

This document outlines the step-by-step instructions to deploy the VistaIQ application to Vercel's Free Tier.

## Prerequisites
- A Vercel account (you can sign up for free at [vercel.com](https://vercel.com) using GitHub).
- Node.js (v18+) installed locally (to run the Vercel CLI).
- A standard Gemini API key from [Google AI Studio](https://aistudio.google.com).

---

## Step 1: Install Vercel CLI

Open your terminal (PowerShell, Command Prompt, or Bash) and run:
```bash
npm install -g vercel
```
*Verify the installation was successful by running:*
```bash
vercel --version
```

---

## Step 2: Authenticate and Link Project

1. Navigate to your project directory:
   ```bash
   cd d:\Hackthon-APAC\vistaiq
   ```
2. Log in to your Vercel account:
   ```bash
   vercel login
   ```
   *(Select your preferred login provider, usually GitHub, and complete the authentication in the browser).*

3. Initialize the Vercel project deployment:
   ```bash
   vercel
   ```
   *Answer the prompts as follows:*
   - **Set up and deploy “d:\Hackthon-APAC\vistaiq”?** Yes (`y`)
   - **Which scope do you want to deploy to?** (Select your personal Vercel team/scope)
   - **Link to existing project?** No (`n`)
   - **What’s your project’s name?** `vistaiq`
   - **In which directory is your code located?** `./` (Press Enter)
   - **Want to modify settings?** No (`n`)

Vercel will upload your files and generate a **Preview Deployment URL** (e.g., `https://vistaiq-username.vercel.app`).

---

## Step 3: Configure Environment Variables

The serverless API endpoints require your Google Gemini API Key. Since we want to run this on the free tier, configure it via the Vercel dashboard:

1. Open your browser and go to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click on the newly created **vistaiq** project.
3. Go to the **Settings** tab.
4. Select **Environment Variables** from the left-hand sidebar.
5. Create a new environment variable:
   - **Key:** `GEMINI_API_KEY`
   - **Value:** (Paste your active Gemini API key: e.g., `AIzaSy...` or OAuth key)
   - **Environments:** Check **Production**, **Preview**, and **Development**.
6. Click **Save**.

---

## Step 4: Deploy to Production

Once the environment variable is configured, trigger a fresh production deployment so the serverless API functions rebuild with the correct credentials:

```bash
vercel --prod
```

Vercel will output a clean, live **Production URL** (e.g., `https://vistaiq.vercel.app` or similar, depending on availability).

---

## Verification & Checks
- Open your production URL in an incognito window.
- The page should load instantly (SQLite is run in-memory within the serverless functions via WASM, so no external DB setup is needed).
- Try typing a query in the **Conversational Analytics** bar (e.g., `"Show visitor footfall by district for the last 3 months."`) to ensure that the API runs correctly and outputs insights with explainability trails.
