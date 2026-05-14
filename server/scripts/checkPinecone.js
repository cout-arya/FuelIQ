require('dotenv').config();
const { Pinecone } = require('@pinecone-database/pinecone');

async function checkPinecone() {
    try {
        console.log('Connecting to Pinecone...');
        const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
        const indexName = process.env.PINECONE_INDEX_NAME;
        const index = pinecone.Index(indexName);

        // 1. Check Index Stats
        console.log('\n--- 📊 Index Statistics ---');
        const stats = await index.describeIndexStats();
        console.log(`Total Vectors Stored: ${stats.totalRecordCount}`);
        console.log(`Dimension: ${stats.dimension}`);
        console.log(`Index Fullness: ${stats.indexFullness}`);

        if (stats.totalRecordCount === 0) {
            console.log('❌ No vectors found in Pinecone!');
            return;
        }

        // 2. Run a Test Query
        console.log('\n--- 🔍 Running Test Similarity Search ---');
        // Create a dummy vector of 3072 dimensions filled with small numbers
        const dummyVector = new Array(3072).fill(0.1);
        
        const queryResponse = await index.query({
            vector: dummyVector,
            topK: 2,
            includeMetadata: true
        });

        console.log(`Successfully retrieved ${queryResponse.matches.length} matches.`);
        
        if (queryResponse.matches.length > 0) {
            console.log('\nTop Match Data:');
            console.log(`ID: ${queryResponse.matches[0].id}`);
            console.log(`Score: ${queryResponse.matches[0].score}`);
            console.log(`Source: ${queryResponse.matches[0].metadata?.source}`);
            console.log(`Text Preview: ${queryResponse.matches[0].metadata?.text?.substring(0, 100)}...`);
            console.log('\n✅ Pinecone integration is working perfectly!');
        }

    } catch (error) {
        console.error('Error checking Pinecone:', error.message);
    }
}

checkPinecone();
