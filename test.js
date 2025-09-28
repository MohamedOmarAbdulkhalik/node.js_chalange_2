require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/userModel');
const jwt = require('jsonwebtoken');
const { generateToken, verifyToken } = require('./utils/jwtUtils');

const testJWTAndRBAC = async () => {
    try {
        await mongoose.connect(process.env.DB_URI);
        console.log('✅ Connected to database for JWT testing\n');

        // Test 1: Create users
        console.log('1. Creating test users:');
        const regularUser = new User({
            name: 'Regular User',
            email: 'mohammed@example.com',
            password: 'Password123',
            role: 'user'
        });
        
        const adminUser = new User({
            name: 'Admin User',
            email: 'alii@example.com',
            password: 'Admin123',
            role: 'admin'
        });
        
        await regularUser.save();
        await adminUser.save();
        console.log('✅ Users created successfully');

        // Test 2: Generate tokens
        console.log('\n2. Testing JWT token generation:');
        const regularToken = generateToken(regularUser._id);
        const adminToken = generateToken(adminUser._id);
        console.log('✅ Regular user token generated:', regularToken.length > 100);
        console.log('✅ Admin user token generated:', adminToken.length > 100);

        // Test 3: Verify tokens
        console.log('\n3. Testing JWT token verification:');
        const regularDecoded = verifyToken(regularToken);
        const adminDecoded = verifyToken(adminToken);
        console.log('✅ Regular token valid:', regularDecoded.id === regularUser._id.toString());
        console.log('✅ Admin token valid:', adminDecoded.id === adminUser._id.toString());

        // Test 4: Test role checking
        console.log('\n4. Testing role-based access:');
        console.log('✅ Regular user is admin:', regularUser.isAdmin());
        console.log('✅ Admin user is admin:', adminUser.isAdmin());

        // Test 5: Test token expiration
        console.log('\n5. Testing token expiration:');
        const expiredToken = jwt.sign(
            { id: regularUser._id },
            process.env.JWT_SECRET,
            { expiresIn: '1ms' } // Expires immediately
        );
        
        setTimeout(() => {
            try {
                verifyToken(expiredToken);
                console.log('❌ Token should have expired');
            } catch (error) {
                console.log('✅ Token expiration works:', error.message.includes('expired'));
            }
        }, 10);

        // Cleanup
        await User.deleteMany({ email: { $in: ['regular@example.com', 'admin@example.com'] } });
        console.log('\n✅ Test data cleaned up');

    } catch (error) {
        console.error('❌ JWT/RBAC test failed:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\n📊 Database connection closed');
    }
};

testJWTAndRBAC();