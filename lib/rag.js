/**
 * RAG Vector Similarity Search Engine
 * Handles:
 * - Lazy initialization & batch embedding of business directory descriptions
 * - Cosine similarity calculations
 * - Local Gem 30% ranking boost for is_underserved businesses
 */

const { getEmbeddings } = require('./gemini');
const businesses = require('./data/businesses');

// Global cache for business embedding vectors
let embeddedBusinessesCache = null;

/**
 * Calculates cosine similarity between two float vectors
 */
function calculateCosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Batch embeds all business descriptions if cache is empty
 */
async function ensureEmbeddingsCached(apiKey = null) {
  if (embeddedBusinessesCache) {
    return embeddedBusinessesCache;
  }

  console.log("Warm-start: Generating text embeddings for 30 businesses...");
  
  // Extract descriptions
  const descriptions = businesses.map(b => b.description);
  
  // Call Gemini Embedding API (single batch request)
  const vectors = await getEmbeddings(descriptions, apiKey);
  
  // Map vectors back to businesses
  embeddedBusinessesCache = businesses.map((b, idx) => ({
    ...b,
    embedding: vectors[idx]
  }));

  console.log("Successfully cached business description embeddings.");
  return embeddedBusinessesCache;
}

/**
 * Perform vector similarity search against business descriptions
 * with a 30% ranking boost for underserved businesses.
 * 
 * @param {string} queryText - User's interests query
 * @param {number} topK - Number of results to return
 * @returns {Array} List of matched businesses with scores
 */
async function searchBusinesses(queryText, topK = 8, apiKey = null) {
  const cachedDb = await ensureEmbeddingsCached(apiKey);

  // Embed the query
  console.log(`Embedding query: "${queryText}"`);
  const queryVectorArray = await getEmbeddings(queryText, apiKey);
  const queryVector = queryVectorArray[0];

  // Compute similarities
  const scored = cachedDb.map(biz => {
    const similarity = calculateCosineSimilarity(queryVector, biz.embedding);
    
    // Apply 30% score boost if business is flagged is_underserved
    const boost = biz.is_underserved ? 1.3 : 1.0;
    const finalScore = similarity * boost;

    return {
      ...biz,
      embedding: undefined, // Strip embedding vector for transport payload
      raw_similarity: parseFloat(similarity.toFixed(4)),
      score: parseFloat(finalScore.toFixed(4))
    };
  });

  // Sort by final score descending
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, topK);
}

module.exports = {
  searchBusinesses
};
