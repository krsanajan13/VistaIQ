# VistaIQ — AI Decision Intelligence Platform

VistaIQ is a two-sided economic decision intelligence platform built to mitigate overtourism and rebalance visitors toward local, underserved businesses in regional destinations.

## Features

1. **Conversational Analytics (Decision Console):** An NL-to-SQL dashboard allowing regional tourism managers to query real-time footfall, spend, weather, reviews, and event data using natural language.
2. **Predictive Forecasting:** Simulates 30, 60, or 90-day future demand curves (footfall or transactions) using historical regressions adjusted for weekly seasonality.
3. **Automated Anomaly Detection:** Flags statistical demand drops or surges (>25% deviance from rolling baselines) and uses Gemini to logically correlate external weather or scheduled event factors.
4. **AI Concierge (Trip Planner):** A custom itinerary builder that leverages vector search (RAG) over business directories to draft tailored itineraries while guaranteeing redistribution to underserved local crafts and culinary gems.
5. **Full Explainability Traces:** Every insight, chart, forecast, and travel itinerary displays a structured "Why this answer?" traceback including sources queried, system confidence, and mathematical reasoning.

---

## Architecture

VistaIQ is designed with a lightweight, serverless-ready architecture optimized for quick deployment and zero database maintenance overhead:

- **Frontend:** Responsive, single-page web app built with vanilla HTML/JS and custom CSS (design system). Includes inline canvas charting (Chart.js) and Markdown parsing (Marked).
- **Backend:** Node.js serverless functions (designed for Vercel API functions) serving lightweight REST endpoints.
- **Database Layer:** In-memory SQLite (`sql.js` WASM engine) instantiated and seeded in-memory within milliseconds at start time using structured mock records.
- **RAG & Search:** Vector similarity engine (`text-embedding-004` model) scoring interest similarity, augmented with a programmatic 30% weight boost to push underserved businesses forward in recommendations.
- **AI Orchestration:** Google Gemini 2.0 Flash (`gemini-2.0-flash` model) configured with structured JSON outputs and schema validation.

---

## Local Setup & Run

### Prerequisites
- Node.js (v18+)
- A Gemini API Key from [Google AI Studio](https://aistudio.google.com)

### Installation
1. Clone this repository.
2. Install dependencies:
   ```bash
   node install-deps.js
   ```
3. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

### Running Locally
Start the lightweight development server:
```bash
npm run dev
```
Open [http://localhost:8000](http://localhost:8000) in your web browser. 

*Note: If no server-side API key is set in `.env`, the UI will automatically request your key via a secure modal input and attach it securely for each request header.*

---

## Deployment (Vercel)

This application is fully optimized for one-click deployment to Vercel:

1. Install the Vercel CLI: `npm i -g vercel`
2. Run `vercel` from the root directory to deploy as a preview.
3. Setup `GEMINI_API_KEY` in the Vercel Dashboard Environment Variables.
4. Deploy to production: `vercel --prod`
