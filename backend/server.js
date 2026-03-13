require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const hrRoutes = require('./routes/hr');
const statsRoutes = require('./routes/stats');
const studentRoutes = require('./routes/student');
const staffRoutes = require('./routes/staff');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
    'http://localhost:5173',
    'https://learning-management-system-puce-seven.vercel.app',
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        // Allow any Vercel preview deployments
        if (origin.endsWith('.vercel.app') || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));

// Explicitly handle preflight OPTIONS requests
app.options('*', cors());

app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/staff', staffRoutes);

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 UMS Backend running on http://localhost:${PORT}`);
});
