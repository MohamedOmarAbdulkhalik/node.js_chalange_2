const mongoose = require('mongoose');

// Define the Product Schema
const productSchema = new mongoose.Schema({
    // Product name field
    name: {
        type: String,
        required: [true, 'Product name is required'], // Custom error message
        trim: true, // Removes extra spaces from beginning and end
        minlength: [2, 'Product name must be at least 2 characters long'],
        maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    
    // Product price field
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Price cannot be negative'], // Prevent negative prices
        validate: {
            validator: function(value) {
                return value >= 0; // Custom validation
            },
            message: 'Price must be a positive number'
        }
    },
    
    // Product description field
    description: {
        type: String,
        required: false, // Optional field
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters'],
        default: '' // Default value if not provided
    },
    
    // Product category field
    category: {
        type: String,
        required: [true, 'Product category is required'],
        trim: true,
        enum: {
            values: ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Other'],
            message: 'Category must be one of: Electronics, Clothing, Books, Home, Sports, Other'
        }
    },
    
    // Stock availability field
    inStock: {
        type: Boolean,
        default: true // Default to in stock
    },
    
    // Created at timestamp (automatically added)
    createdAt: {
        type: Date,
        default: Date.now // Sets to current date/time
    },
    
    // Updated at timestamp (automatically updated)
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware: Update the updatedAt field before saving
productSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Static method: Find products by category
productSchema.statics.findByCategory = function(category) {
    return this.find({ category: new RegExp(category, 'i') }); // Case insensitive
};

// Instance method: Check if product is expensive
productSchema.methods.isExpensive = function() {
    return this.price > 100;
};

// Virtual property: Formatted price with currency symbol
productSchema.virtual('formattedPrice').get(function() {
    return `$${this.price.toFixed(2)}`;
});

// Create the Product model from the schema
const Product = mongoose.model('Product', productSchema);

// Export the Product model
module.exports = Product;