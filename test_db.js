require('dotenv').config();
const mongoose = require('mongoose');

const testConnection = async () => {
    try {
        await mongoose.connect(process.env.DB_URI);
        console.log('✅ Database connection test: PASSED');
        console.log(`📊 Connected to: ${mongoose.connection.name}`);
        await mongoose.connection.close();
        console.log('✅ Connection closed properly');
    } catch (error) {
        console.error('❌ Database connection test: FAILED');
        console.error('Error:', error.message);
    }
};

testConnection();