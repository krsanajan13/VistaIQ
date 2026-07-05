/**
 * Google Gemini API Client Wrapper
 * Wraps @google/generative-ai SDK to provide simple helper methods:
 * - text generation
 * - structured JSON generation
 * - text embedding
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Helper to get client key, checking environment or argument
const getGenAI = (customKey) => {
  const key = customKey || process.env.GEMINI_API_KEY;
  if (!key || key === "your_key_here") {
    throw new Error("GEMINI_API_KEY is not configured. Please supply a valid key.");
  }
  return new GoogleGenerativeAI(key);
};

/**
 * Generate a text response from Gemini 2.0 Flash
 */
async function generateText(prompt, systemInstruction = "", apiKey = null) {
  try {
    const ai = getGenAI(apiKey);
    const model = ai.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: systemInstruction || undefined
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini text generation failed:", error);
    throw error;
  }
}

/**
 * Generate structured JSON output matching a provided schema
 */
async function generateStructured(prompt, systemInstruction = "", schema = null, apiKey = null) {
  try {
    const ai = getGenAI(apiKey);
    
    // Set configuration for JSON output
    const generationConfig = {
      responseMimeType: "application/json"
    };

    if (schema) {
      generationConfig.responseSchema = schema;
    }

    const model = ai.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: systemInstruction || undefined,
      generationConfig
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini structured generation failed:", error);
    throw error;
  }
}

/**
 * Generate a list of embeddings for the given input texts
 */
async function getEmbeddings(texts, apiKey = null) {
  try {
    const ai = getGenAI(apiKey);
    const model = ai.getGenerativeModel({ model: "text-embedding-004" });
    
    if (typeof texts === 'string') {
      texts = [texts];
    }

    const embeddings = [];
    for (const text of texts) {
      const result = await model.embedContent(text);
      embeddings.push(result.embedding.values);
    }
    
    return embeddings;
  } catch (error) {
    console.error("Gemini embedding generation failed:", error);
    throw error;
  }
}

module.exports = {
  generateText,
  generateStructured,
  getEmbeddings
};
