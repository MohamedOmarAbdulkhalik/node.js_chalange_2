const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
require('dotenv').config(); // Load environment variables

const productRoutes = require('./routes/productsRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware Setup

// 1. Morgan logging middleware (shows request details in terminal)
app.use(morgan('dev'));

// 2. Custom middleware to log date and time of each request
app.use((req, res, next) => {
    console.log(`📅 Request received at: ${new Date().toISOString()}`);
    console.log(`🌐 Request method: ${req.method}`);
    console.log(`🔗 Request URL: ${req.url}`);
    next(); // Important: This passes control to the next middleware
});

// 3. Express JSON middleware (to parse JSON requests)
app.use(express.json());

// Database Connection
const connectDB = async () => {
    try {
        // Connect to MongoDB using the connection string from .env file
        await mongoose.connect(process.env.DB_URI);
        console.log('✅ MongoDB Connected Successfully!');
        console.log(`📊 Database: ${mongoose.connection.name}`);
        console.log(`🎯 Host: ${mongoose.connection.host}`);
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1); // Exit the process if connection fails
    }
};

// Routes
app.use('/api/products', productRoutes);

// Basic error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);
    res.status(500).json({ 
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// 404 handler for unmatched routes
app.use((req, res) => {
    res.status(404).json({ 
        success: false,
        message: 'Route not found' 
    });
});

// Start server only after database connection
const startServer = async () => {
    try {
        // First connect to database
        await connectDB();
        
        // Then start the server
        app.listen(PORT, () => {
            console.log('\n🚀 Server Information:');
            console.log(`✅ Server is running on port ${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`📡 API Base URL: http://localhost:${PORT}/api/products`);
            console.log('=' .repeat(50));
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
    }
};

// Start the application
startServer();

module.exports = app;