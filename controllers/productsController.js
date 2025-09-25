const Product = require('../models/productModel');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getAllProducts = async (req, res) => {
    try {
        // Build query object for filtering
        let query = {};
        
        // Filter by category if provided
        if (req.query.category) {
            query.category = { $regex: req.query.category, $options: 'i' }; // Case insensitive
        }
        
        // Filter by name if provided
        if (req.query.name) {
            query.name = { $regex: req.query.name, $options: 'i' };
        }
        
        // Filter by inStock status if provided
        if (req.query.inStock) {
            query.inStock = req.query.inStock.toLowerCase() === 'true';
        }
        
        // Filter by price range if provided
        if (req.query.minPrice || req.query.maxPrice) {
            query.price = {};
            if (req.query.minPrice) query.price.$gte = parseFloat(req.query.minPrice);
            if (req.query.maxPrice) query.price.$lte = parseFloat(req.query.maxPrice);
        }
        
        // Execute query with Mongoose
        const products = await Product.find(query).sort({ createdAt: -1 }); // Sort by newest first
        
        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
        
    } catch (error) {
        console.error('❌ Get all products error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving products from database',
            error: error.message
        });
    }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getSingleProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        
        // Validate if ID is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID format'
            });
        }
        
        const product = await Product.findById(productId);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: `Product with ID ${productId} not found`
            });
        }
        
        res.status(200).json({
            success: true,
            data: product
        });
        
    } catch (error) {
        console.error('❌ Get single product error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving product from database',
            error: error.message
        });
    }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Public
const createProduct = async (req, res) => {
    try {
        const { name, price, description, category, inStock } = req.body;
        
        // Basic validation (Mongoose schema will also validate)
        if (!name || !price || !category) {
            return res.status(400).json({
                success: false,
                message: 'Name, price, and category are required fields'
            });
        }
        
        // Create product using Mongoose
        const newProduct = new Product({
            name,
            price: parseFloat(price),
            description: description || '',
            category,
            inStock: inStock !== undefined ? inStock : true
        });
        
        // Save to database
        const savedProduct = await newProduct.save();
        
        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: savedProduct
        });
        
    } catch (error) {
        console.error('❌ Create product error:', error);
        
        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: errors
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error creating product in database',
            error: error.message
        });
    }
};

// @desc    Update an existing product
// @route   PUT /api/products/:id
// @access  Public
const updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        
        // Validate if ID is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID format'
            });
        }
        
        // Check if product exists
        const existingProduct = await Product.findById(productId);
        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                message: `Product with ID ${productId} not found`
            });
        }
        
        // Update product using findByIdAndUpdate
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            { 
                ...req.body,
                updatedAt: Date.now() // Force update timestamp
            },
            { 
                new: true, // Return updated document
                runValidators: true // Run schema validations on update
            }
        );
        
        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: updatedProduct
        });
        
    } catch (error) {
        console.error('❌ Update product error:', error);
        
        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: errors
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error updating product in database',
            error: error.message
        });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Public
const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        
        // Validate if ID is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID format'
            });
        }
        
        const deletedProduct = await Product.findByIdAndDelete(productId);
        
        if (!deletedProduct) {
            return res.status(404).json({
                success: false,
                message: `Product with ID ${productId} not found`
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Product deleted successfully',
            data: deletedProduct
        });
        
    } catch (error) {
        console.error('❌ Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting product from database',
            error: error.message
        });
    }
};

// Import mongoose for ObjectId validation
const mongoose = require('mongoose');

module.exports = {
    getAllProducts,
    getSingleProduct,
    createProduct,
    updateProduct,
    deleteProduct
};
