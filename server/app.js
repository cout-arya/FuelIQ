const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const compression = require('compression');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
app.use(compression());

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    process.env.CLIENT_URL // Allow production frontend URL
].filter(Boolean);

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

app.get('/api/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    res.json({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        database: dbStatus
    });
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

module.exports = app;
