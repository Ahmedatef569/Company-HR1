const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./src/config/config');
const authRoutes = require('./src/routes/authRoutes');
const { AppError } = require('./src/utils/appError');
const errorHandler = require('./src/middleware/errorHandler');

// Initialize express app
const app = express();

// Middleware
app.use(cors({
    origin: config.CORS_ORIGIN,
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', time: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
const employeeRoutes = require('./src/routes/employeeRoutes');
app.use('/api/employees', employeeRoutes);

// Handle undefined routes
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = config.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Health check available at http://localhost:${PORT}/api/health`);
});
