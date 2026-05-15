const app = require('./app');
const connectDB = require('./config/db');

connectDB();

// Log environment diagnostics
console.log('═══════════════════════════════════════');
console.log('  FuelIQ Server Starting...');
console.log('═══════════════════════════════════════');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('PORT:', process.env.PORT || 5001);
console.log('MONGO_URI:', process.env.MONGO_URI ? '✓ Set' : '✗ Not Set');
console.log('GEMINI_API_KEY:', (process.env.GEMINI_API_KEY || process.env.gemini_key) ? '✓ Set' : '✗ Not Set');
console.log('═══════════════════════════════════════');

const PORT = process.env.PORT || 5001;
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1';

app.listen(PORT, HOST, () => {
    console.log(`FuelIQ server running on ${HOST}:${PORT}`);
});
