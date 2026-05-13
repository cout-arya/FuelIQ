/**
 * FuelIQ Knowledge Base Embedder
 * 
 * Reads all text files from the knowledge base and Indian food database,
 * chunks them, generates Gemini embeddings, and saves to the vector store.
 * 
 * Usage: node scripts/embed_knowledge.js
 */

const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { GoogleGenerativeAI } = require('@google/generative-ai');

const KNOWLEDGE_DIR = path.join(__dirname, '../../knowledge/nutrition');
const FOOD_DB_DIR = path.join(__dirname, '../data');
const OUTPUT_FILE = path.join(__dirname, '../data/vectors/nutrition_embeddings.json');
const GEMINI_EMBEDDING_MODEL = 'gemini-embedding-001';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function generateEmbedding(text) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.gemini_key;
    if (!apiKey) throw new Error('GEMINI_API_KEY or gemini_key not set in .env');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: GEMINI_EMBEDDING_MODEL });
    const result = await model.embedContent(text);
    return result.embedding.values;
}

function chunkText(text, source, maxChunkSize = 1500) {
    // Split by section headers (═══ lines or double newlines)
    const sections = text.split(/═{3,}/).filter(s => s.trim());
    const chunks = [];

    for (const section of sections) {
        const trimmed = section.trim();
        if (trimmed.length === 0) continue;

        if (trimmed.length <= maxChunkSize) {
            chunks.push({
                text: trimmed,
                source
            });
        } else {
            // Split by double newlines for sub-chunking
            const subSections = trimmed.split(/\n\n+/);
            let current = '';

            for (const sub of subSections) {
                if ((current + '\n\n' + sub).length > maxChunkSize && current.length > 0) {
                    chunks.push({ text: current.trim(), source });
                    current = sub;
                } else {
                    current = current ? current + '\n\n' + sub : sub;
                }
            }
            if (current.trim()) {
                chunks.push({ text: current.trim(), source });
            }
        }
    }

    return chunks;
}

async function main() {
    console.log('═══════════════════════════════════════');
    console.log('  FuelIQ Knowledge Base Embedder');
    console.log('═══════════════════════════════════════\n');

    const allChunks = [];

    // 1. Load existing knowledge base files
    try {
        const files = await fs.readdir(KNOWLEDGE_DIR);
        for (const file of files) {
            if (!file.endsWith('.txt')) continue;
            const filePath = path.join(KNOWLEDGE_DIR, file);
            const content = await fs.readFile(filePath, 'utf-8');
            const chunks = chunkText(content, file);
            console.log(`  📄 ${file}: ${chunks.length} chunks`);
            allChunks.push(...chunks);
        }
    } catch (err) {
        console.warn('  ⚠ Knowledge directory not found, skipping');
    }

    // 2. Load all food/nutrition database files from server/data/
    try {
        const dataFiles = await fs.readdir(FOOD_DB_DIR);
        for (const file of dataFiles) {
            if (!file.endsWith('.txt')) continue;
            const filePath = path.join(FOOD_DB_DIR, file);
            const stat = await fs.stat(filePath);
            if (!stat.isFile()) continue;
            const content = await fs.readFile(filePath, 'utf-8');
            const chunks = chunkText(content, file);
            console.log(`  📄 ${file}: ${chunks.length} chunks`);
            allChunks.push(...chunks);
        }
    } catch (err) {
        console.warn('  ⚠ Food database directory not found, skipping');
    }

    console.log(`\n  Total chunks to embed: ${allChunks.length}\n`);

    if (allChunks.length === 0) {
        console.log('  No content to embed. Exiting.');
        return;
    }

    // 3. Generate embeddings
    const embeddings = [];
    for (let i = 0; i < allChunks.length; i++) {
        const chunk = allChunks[i];
        const id = `${chunk.source.replace('.txt', '')}_chunk_${i}`;

        try {
            process.stdout.write(`  Embedding ${i + 1}/${allChunks.length}: ${id}...`);
            const embedding = await generateEmbedding(chunk.text);

            embeddings.push({
                id,
                source: chunk.source,
                text: chunk.text,
                embedding
            });

            console.log(` ✓ (${embedding.length}-dim)`);

            // Rate limiting: 1 request per 200ms to stay under quota
            if (i < allChunks.length - 1) {
                await sleep(250);
            }
        } catch (err) {
            console.log(` ✗ ERROR: ${err.message}`);
            // If rate limited, wait longer and retry
            if (err.message?.includes('429') || err.message?.includes('quota')) {
                console.log('  ⏳ Rate limited. Waiting 10s...');
                await sleep(10000);
                i--; // Retry this chunk
            }
        }
    }

    // 4. Save to vector store
    console.log(`\n  💾 Saving ${embeddings.length} embeddings to ${OUTPUT_FILE}...`);
    await fs.writeFile(OUTPUT_FILE, JSON.stringify(embeddings, null, 2));
    console.log('  ✅ Done! Vector store updated.\n');

    // Summary
    const sources = [...new Set(embeddings.map(e => e.source))];
    console.log('  Sources embedded:');
    sources.forEach(s => {
        const count = embeddings.filter(e => e.source === s).length;
        console.log(`    - ${s}: ${count} chunks`);
    });
}

main().catch(err => {
    console.error('\n  ❌ Fatal error:', err.message);
    process.exit(1);
});
