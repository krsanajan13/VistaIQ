# VistaIQ — Solution Description (Gen AI Academy Submission Brief)

Use the content below to fill out the project details and description sections in your Gen AI Academy submission form.

---

## 1. Project Elevator Pitch (1-2 sentences)
VistaIQ is a two-sided economic decision intelligence platform that mitigates overtourism and drives footfall to regional, underserved local businesses. It uses conversational database analytics to give tourism coordinators traffic insights, and dynamically redirects visitors to outer-district artisans through an impact-guided, RAG-grounded travel concierge.

---

## 2. Key Problem Solved
Regional tourist destinations face a dual economic crisis: popular districts experience critical overcrowding and environmental strain (overtourism), while small, authentic businesses in outer-district zones remain under-visited and economically isolated. 

Current analytics dashboards are gatekept behind complex query languages, preventing local coordinators from acting dynamically. On the consumer side, traditional travel algorithms recommend mainstream hotspots, exacerbating overcrowding. VistaIQ closes the loop by turning local analytics into direct, balanced tourist routing.

---

## 3. High-Level Features
* **Conversational Analytics (Decision Console):** Translates plain natural language questions into valid, executed SQL statements over regional footfall, spend, events, and weather datasets.
* **Predictive Demand Forecasting:** Simulates 30-to-90-day future demand curves using linear trends adjusted for weekly seasonal cycles.
* **Correlated Anomaly Scanner:** Instantly flags statistical traffic deviations and uses Gemini to logically correlate external factors (e.g., severe weather or scheduled block party disruptions).
* **AI Concierge (Trip Planner):** Uses vector similarity (RAG) to build customized visitor itineraries. It applies a 30% ranking boost for underserved businesses, injecting "local gems" into tourist routes.
* **Full Explainability & Citations:** Every analytics chart and itinerary recommendation is accompanied by an audit trail showing the precise database sources queried, calculation reasoning, and local business citations.

---

## 4. Technical Architecture & Tech Stack
* **Frontend:** Interactive Single-Page Application (HTML5, Custom CSS3, Vanilla JS) with responsive rendering, skeleton loaders, and live analytics charts powered by Chart.js.
* **Backend:** Node.js Serverless API routes optimized for quick, serverless deployments (Vercel).
* **Database Layer:** Ultra-lightweight SQL.js (SQLite compiled to WebAssembly), loaded and seeded in-memory within milliseconds at server startup.
* **LLM & Embeddings:** Gemini 2.0 Flash (`gemini-2.0-flash`) for structured JSON schema outputs and text generation, and `text-embedding-004` for semantic RAG vector calculations.
* **Explainability Engine:** A programmatic parsing layer that binds data-source metadata, SQL traces, and prompt reasoning vectors directly to API response payloads.

---

## 5. Economic & Business Impact
* **Demand Redistribution:** Automatically balances visitor loads by routing tourists away from congested hotspots to secondary areas like Artisan Quarters.
* **Local Spend Growth:** Increases conversion rate and customer acquisition for underserved small-scale craft workshops and co-ops.
* **Data-Driven Governance:** Empowers non-technical city coordinators to make infrastructure, event-scheduling, and policy choices based on visual, plain-english query insights.
