require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const { Pinecone } = require('@pinecone-database/pinecone');

const EMBEDDINGS_FILE = path.join(__dirname, '../data/vectors/nutrition_embeddings.json');

async function migrate() {
    console.log('Starting migration to Pinecone...');
    if (!process.env.PINECONE_API_KEY || !process.env.PINECONE_INDEX_NAME) {
        throw new Error('PINECONE_API_KEY or PINECONE_INDEX_NAME is missing in .env');
    }

    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const indexName = process.env.PINECONE_INDEX_NAME;

    try {
        console.log(`Checking if index ${indexName} exists...`);
        const existingIndexes = (await pinecone.listIndexes()).indexes.map(idx => idx.name);
        
        if (existingIndexes.includes(indexName)) {
            console.log(`Deleting existing index ${indexName} due to dimension mismatch...`);
            await pinecone.deleteIndex(indexName);
            // wait for deletion to propagate
            await new Promise(r => setTimeout(r, 10000));
        }

        console.log(`Creating index ${indexName} with dimension 3072...`);
        await pinecone.createIndex({
            name: indexName,
            dimension: 3072,
            metric: 'cosine',
            spec: { serverless: { cloud: 'aws', region: 'us-east-1' } }
        });
        console.log(`Waiting for index to be ready...`);
        await new Promise(r => setTimeout(r, 15000));
    } catch (e) {
        console.warn('Index creation might have failed or already exists:', e.message);
    }

    const index = pinecone.Index(indexName);

    console.log('Loading JSON file...');
    const data = await fs.readFile(EMBEDDINGS_FILE, 'utf-8');
    const records = JSON.parse(data);

    // Format for Pinecone
    const pineconeRecords = records
        .filter(record => Array.isArray(record.embedding) && record.embedding.length > 0)
        .map(record => ({
            id: record.id || Math.random().toString(36).substring(7),
            values: record.embedding,
            metadata: {
                text: record.text || '',
                source: record.source || 'unknown'
            }
        }));

    console.log(`Uploading ${pineconeRecords.length} vectors to Pinecone in batches...`);
    
    // Pinecone handles batches best in chunks of ~100
    const batchSize = 100;
    for (let i = 0; i < pineconeRecords.length; i += batchSize) {
        const batch = pineconeRecords.slice(i, i + batchSize);
        console.log(`Upserting batch of size ${batch.length}`);
        if (batch.length === 0) continue;
        try {
            await index.upsert(batch); // newest SDK
        } catch (err) {
            await index.upsert({ records: batch }); // older SDK
        }
        console.log(`Uploaded batch ${i / batchSize + 1} / ${Math.ceil(pineconeRecords.length / batchSize)}`);
    }

    console.log('Migration complete!');
}

migrate().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
