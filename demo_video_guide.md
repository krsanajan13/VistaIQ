# VistaIQ — 3-Minute Demo Video Script & Guide

This guide details a step-by-step recording plan and voiceover script to compile a professional, high-impact demo video under 3 minutes for your Gen AI Academy submission.

---

## 📽️ Video Recording Strategy
- **Format:** Screencast of the running application (`http://localhost:8000` or Vercel URL) combined with a brief view of the architecture diagram slide from your presentation deck.
- **Audio:** Clear voiceover explaining the features while clicking through them in real-time. Do not rush, but maintain an energetic, concise pace.
- **Preparation:** Pre-open the tabs, have example queries ready to copy-paste or click (using the suggestion chips), and make sure the API key is fully working.

---

## ⏱️ Video Breakdown (180 Seconds Total)

### Part 1: The Problem & Elevator Pitch (0:00 - 0:35)
* **Visual:** Show the VistaIQ home page on the "Decision Console" tab.
* **Action:** Hover over the logo, scroll briefly down to the Conversational Analytics section.
* **Voiceover:**
  > *"Hello, this is a demonstration of VistaIQ, a decision intelligence platform designed to tackle overtourism and balance regional visitor demand. Regional destinations face a dual challenge: core districts get overcrowded, while local artisan and culinary businesses in outer districts struggle for visibility. VistaIQ solves this by closing the loop: it uses conversational analytics to let city officials identify traffic spikes, and redirects tourists dynamically via an impact-grounded travel concierge. Let's see it in action."*

---

### Part 2: Conversational Analytics & Explanations (0:35 - 1:15)
* **Visual:** Stay on the "Decision Console" tab.
* **Action:** Click the chip for **"Footfall by district"** or type it in. The loader skeleton animates, and the analytics results section grid animates into view showing the answer, a Chart.js bar chart, and the explainability boxes.
* **Voiceover:**
  > *"First, as a city coordinator, I want to explore visitor traffic. I'll run this conversational analytics query. Behind the scenes, Gemini compiles this into a clean SQLite statement, runs it against our regional datasets, and outputs a clear summarized insight alongside an interactive chart. VistaIQ is built on full explainability—every output comes with a 'Why this answer?' panel showing the sources used, confidence level, and execution reasoning."*
* **Action:** Click the **"Generated SQL Statement"** accordion to expand it, and do the same for the **"Why this answer?"** panel.

---

### Part 3: Forecasting & Anomaly Scan (1:15 - 1:55)
* **Visual:** Click **"District Forecasting"** quick action, then click **"Compute Forecast"**.
* **Action:** Once the line chart renders showing projected trends with confidence bounds, click **"Anomaly Scanner"** quick action and run the scanner.
* **Voiceover:**
  > *"To plan ahead, we can project traffic. Here, we calculate a 30-day demand forecast for the Harbor district complete with weekday seasonality curves and a 90% confidence interval. Now, if we scan for anomalies, the system automatically flags sudden drops or surges. Using Gemini's reasoning core, it correlates these anomalies with local events or bad weather records—explaining, for example, how a major flood in October caused a sudden 85% drop in footfall."*
* **Action:** Scroll through the anomaly cards showing weather/event correlations.

---

### Part 4: AI Concierge (1:55 - 2:40)
* **Visual:** Switch tabs to the **"AI Concierge"** tab.
* **Action:** Change the Stay duration range to **"3 Days"**, select **"Avoid Hotspots"** crowd tolerance, choose some interests (e.g., Local Crafts, Food & Drink), and click **"Generate Itinerary"**.
* **Voiceover:**
  > *"Next, let's look at the visitor side. VistaIQ shifts demand toward outer districts using our AI Concierge. Visitors select their interests and crowd tolerance. When we generate an itinerary, our RAG search retrieves local businesses using Gemini embeddings, applies a programmatic 30% weight boost to underserved outer-district artisans, and structures a customized day-by-day travel plan. Local gems are prominently highlighted, and we provide transparent citation cards at the bottom so visitors know these recommendations are grounded in actual local data."*
* **Action:** Scroll down the itinerary, show the highlighted **"Local Gem"** badges, and point out the citations list.

---

### Part 5: Technical Architecture & Close (2:40 - 3:00)
* **Visual:** Switch to your presentation slides showing the architecture diagram (SQLite WASM / Gemini API / RAG).
* **Action:** Highlight the serverless components.
* **Voiceover:**
  > *"Under the hood, VistaIQ is built entirely serverless for Vercel, combining an in-memory SQL.js engine, text-embedding-004 RAG retrievals, and Gemini 2.0 Flash structured outputs. By shifting economic demand, we help destinations grow sustainably. The project repository and live links are attached. Thank you!"*

---

## 💡 Quick Tips for the Recording:
1. **Resolution:** Record in standard 1080p (1920x1080) for clarity.
2. **Cursor:** Use a highlight cursor tool or enlarge your cursor so viewers can easily track your clicks.
3. **Pacing:** If Gemini takes 1.5 seconds to respond, keep talking through the load state rather than pausing. The app has beautiful skeleton loader states specifically designed to keep the presentation fluid.
