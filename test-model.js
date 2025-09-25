require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/productModel');

const testModel = async () => {
    try {
        // Connect to database
        await mongoose.connect(process.env.DB_URI);
        console.log('✅ Connected to database');
        
        // Test creating a product instance
        const testProduct = new Product({
            name: 'Test Product',
            price: 99.99,
            description: 'A test product for schema validation',
            category: 'Electronics'
        });
        
        // Test validation
        await testProduct.validate();
        console.log('✅ Product schema validation: PASSED');
        
        // Test virtual property
        console.log(`💰 Formatted price: ${testProduct.formattedPrice}`);
        
        // Test instance method
        console.log(`💎 Is expensive: ${testProduct.isExpensive()}`);
        
        await mongoose.connection.close();
        console.log('✅ Model test completed successfully');
        
    } catch (error) {
        console.error('❌ Model test failed:', error.message);
    }
};

testModel();