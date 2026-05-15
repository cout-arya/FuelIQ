const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Pinecone } = require('@pinecone-database/pinecone');

const GEMINI_EMBEDDING_MODEL = 'text-embedding-004'; // Using correct model

let cachedIndex = null;

function getIndex() {
    if (cachedIndex) return cachedIndex;
    
    if (!process.env.PINECONE_API_KEY) {
        console.warn('⚠️ WARNING: PINECONE_API_KEY is missing from environment variables!');
        throw new Error('PINECONE_API_KEY is missing');
    }
    
    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    cachedIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME || 'spottr-nutrition');
    return cachedIndex;
}

async function generateEmbedding(text) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.gemini_key;
    if (!apiKey) throw new Error('gemini_key not configured');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: GEMINI_EMBEDDING_MODEL });
    const result = await model.embedContent(text);
    return result.embedding.values;
}

/**
 * Perform similarity search using Pinecone
 */
async function similaritySearch(queryEmbedding, topK = 3) {
    try {
        const index = getIndex();
        const response = await index.query({
            vector: queryEmbedding,
            topK: topK,
            includeMetadata: true // Needed to fetch the text and source
        });

        if (!response.matches) return [];

        // Map Pinecone results to the existing format
        return response.matches.map(match => ({
            id: match.id,
            source: match.metadata.source,
            text: match.metadata.text,
            score: match.score
        }));
    } catch (error) {
        console.error('[VectorStore] Pinecone search failed:', error.message);
        return [];
    }
}

async function retrieveContext(queryText, topK = 3) {
    try {
        const queryEmbedding = await generateEmbedding(queryText);
        return await similaritySearch(queryEmbedding, topK);
    } catch (error) {
        console.error('[VectorStore] Context retrieval failed:', error.message);
        return [];
    }
}

function formatContextForPrompt(documents) {
    if (!documents || documents.length === 0) return '';
    return documents.map((doc, i) =>
        `[Source ${i + 1}: ${doc.source}]\n${doc.text}`
    ).join('\n\n---\n\n');
}

module.exports = {
    generateEmbedding,
    similaritySearch,
    retrieveContext,
    formatContextForPrompt
};
