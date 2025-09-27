const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the User Schema
const userSchema = new mongoose.Schema({
    // User name field
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters long'],
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    
    // Email field (unique identifier)
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    
    // Password field (will be hashed)
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false // Don't return password in queries by default
    },
    
    // Role field for access control
    role: {
        type: String,
        enum: {
            values: ['user', 'admin'],
            message: 'Role must be either "user" or "admin"'
        },
        default: 'user'
    },
    
    // Account creation timestamp
    createdAt: {
        type: Date,
        default: Date.now
    },
    
    // Last update timestamp
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware: Hash password before saving
userSchema.pre('save', async function(next) {
    // Only hash the password if it's modified (or new)
    if (!this.isModified('password')) return next();
    
    try {
        // Generate salt (complexity factor of 12)
        const salt = await bcrypt.genSalt(12);
        // Hash the password with the salt
        this.password = await bcrypt.hash(this.password, salt);
        this.updatedAt = Date.now();
        next();
    } catch (error) {
        next(error);
    }
});

// Instance method: Compare entered password with hashed password
userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Instance method: Check if user is admin
userSchema.methods.isAdmin = function() {
    return this.role === 'admin';
};

// Static method: Find user by email
userSchema.statics.findByEmail = function(email) {
    return this.findOne({ email: email.toLowerCase() });
};

// Create the User model
const User = mongoose.model('User', userSchema);

module.exports = User;