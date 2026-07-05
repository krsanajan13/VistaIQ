/**
 * Conversational Analytics (NL-to-SQL) Endpoint
 * POST /api/console/ask
 * Body: { question: string }
 */

const { query } = require('../../lib/database');
const { generateStructured } = require('../../lib/gemini');
const { schemaText, fewShots } = require('../../lib/data/schema');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { question } = req.body;
  if (!question || question.trim() === '') {
    return res.status(400).json({ message: 'Missing question in request body.' });
  }

  // Parse custom API key override from auth headers
  const authHeader = req.headers.authorization;
  const apiKey = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.split(' ')[1] 
    : null;

  try {
    // --- STEP 1: Generate SQL from natural language ---
    const sqlSchema = {
      type: "OBJECT",
      properties: {
        sql: { 
          type: "STRING", 
          description: "The exact SQLite-compatible SQL query to run. Use standard SQLite functions, dates inside 2025, and use column aliases for clarity." 
        },
        explanation: { 
          type: "STRING", 
          description: "A short 1-sentence explanation of what the query is selecting." 
        }
      },
      required: ["sql", "explanation"]
    };

    const sqlSystemInstruction = `
You are a senior data analyst. Translate the user's natural language question into a single, clean, valid SQLite statement.
Database schema:
${schemaText}

Few-shot examples:
${fewShots.map(f => `Question: "${f.question}"\nSQL: ${f.sql}`).join('\n\n')}

CRITICAL rules:
- Return ONLY valid SQLite syntax.
- The synthetic dataset covers the year 2025 only. Ensure all date comparisons match the format 'YYYY-MM-DD' and fall within '2025-01-01' to '2025-12-31'.
- Do not output markdown code ticks or explanations outside of the structured JSON.
`;

    const sqlResult = await generateStructured(
      `Translate this question to SQL: "${question}"`,
      sqlSystemInstruction,
      sqlSchema,
      apiKey
    );

    const generatedSql = sqlResult.sql;
    console.log(`Generated SQL: ${generatedSql}`);

    // --- STEP 2: Execute query against database ---
    let dbResult;
    try {
      dbResult = await query(generatedSql);
    } catch (dbError) {
      console.error(`Database query failed. SQL: ${generatedSql}`, dbError);
      return res.status(422).json({
        message: "SQL compilation succeeded, but database execution failed.",
        sql: generatedSql,
        error: dbError.message
      });
    }

    // --- STEP 3: Summarize results and select chart ---
    const summarySchema = {
      type: "OBJECT",
      properties: {
        answer: { 
          type: "STRING", 
          description: "A 1-2 sentence conversational answer summarizing the rows for the user. Highlight key numbers/results in bold markdown." 
        },
        chart_type: { 
          type: "STRING", 
          enum: ["bar", "line", "doughnut", "none"], 
          description: "Suggest a chart representation. Use 'line' for chronological trends, 'bar' for categories, 'doughnut' for proportions, and 'none' if rendering a chart is not applicable (e.g., empty result, single value)." 
        },
        chart_title: { 
          type: "STRING", 
          description: "A short descriptive title for the chart." 
        },
        confidence: { 
          type: "STRING", 
          enum: ["high", "medium", "low"], 
          description: "Confidence level in this answer. Use 'low' if results are empty, 'medium' if query was ambiguous, 'high' otherwise." 
        },
        reasoning: { 
          type: "STRING", 
          description: "Short description of how the answer was computed (e.g. 'Aggregated spend amount grouped by category')." 
        },
        sources: {
          type: "ARRAY",
          items: { type: "STRING" },
          description: "Database tables queried (e.g. ['spend', 'businesses'])."
        }
      },
      required: ["answer", "chart_type", "chart_title", "confidence", "reasoning", "sources"]
    };

    const summarySystemInstruction = `
You are a business intelligence assistant analyzing SQL database output.
Review the user's question, the executed SQL, and the returned data. Summarize the findings into a structured summary.
User Question: "${question}"
Executed SQL: "${generatedSql}"
Data:
${JSON.stringify(dbResult.rows || [])}
`;

    const summaryResult = await generateStructured(
      "Summarize the data results.",
      summarySystemInstruction,
      summarySchema,
      apiKey
    );

    // Format response
    return res.status(200).json({
      answer: summaryResult.answer,
      sql_used: generatedSql,
      columns: dbResult.columns || [],
      rows: dbResult.rows || [],
      chart_type: summaryResult.chart_type,
      chart_title: summaryResult.chart_title,
      explainability: {
        sources: summaryResult.sources,
        confidence: summaryResult.confidence,
        reasoning: summaryResult.reasoning
      }
    });

  } catch (error) {
    console.error("NL-to-SQL API failure:", error);
    return res.status(500).json({ 
      message: "An internal AI error occurred during analytics compilation.", 
      error: error.message 
    });
  }
};
