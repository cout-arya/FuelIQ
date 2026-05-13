const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    process.env.CLIENT_URL // Allow production frontend URL
].filter(Boolean);

// Log environment diagnostics
console.log('═══════════════════════════════════════');
console.log('  FuelIQ Server Starting...');
console.log('═══════════════════════════════════════');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('PORT:', process.env.PORT || 5001);
console.log('MONGO_URI:', process.env.MONGO_URI ? '✓ Set' : '✗ Not Set');
console.log('GEMINI_API_KEY:', (process.env.GEMINI_API_KEY || process.env.gemini_key) ? '✓ Set' : '✗ Not Set');
console.log('═══════════════════════════════════════');

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors({
    origin: true, // Allow all origins for the MVP deployment
    credentials: true
}));

// Health check
app.get('/', (req, res) => {
    res.json({ app: 'FuelIQ', status: 'running', version: '1.0.0' });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/nutrition', require('./routes/nutritionRoutes'));
app.use('/api/mealplan', require('./routes/mealPlanRoutes'));
app.use('/api/progress', require('./routes/progressRoutes'));
app.use('/api/export', require('./routes/exportRoutes'));

// Error handling
const { notFound, errorHandler } = require('./middleware/errorHandler');
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1';

app.listen(PORT, HOST, () => {
    console.log(`FuelIQ server running on ${HOST}:${PORT}`);
});
