const Product = require('../models/productModel');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

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
// @access  Private
const createProduct = async (req, res) => {
    try {
        // Check for validation errors from express-validator middleware
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array().map(error => ({
                    field: error.param,
                    message: error.msg,
                    value: error.value
                }))
            });
        }

        const { name, price, description, category, inStock } = req.body;
        
        // Additional server-side validation (backup to express-validator)
        if (!name || !price || !category) {
            return res.status(400).json({
                success: false,
                message: 'Name, price, and category are required fields'
            });
        }

        // Validate price is a positive number
        if (isNaN(price) || parseFloat(price) < 0) {
            return res.status(400).json({
                success: false,
                message: 'Price must be a positive number'
            });
        }

        // Validate category is one of the allowed values
        const allowedCategories = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Other'];
        if (!allowedCategories.includes(category)) {
            return res.status(400).json({
                success: false,
                message: `Category must be one of: ${allowedCategories.join(', ')}`
            });
        }
        
        // Create product using Mongoose
        const newProduct = new Product({
            name: name.trim(),
            price: parseFloat(price),
            description: description ? description.trim() : '',
            category,
            inStock: inStock !== undefined ? inStock : true
        });
        
        // Save to database
        const savedProduct = await newProduct.save();

        // Emit real-time notification if Socket.io is available
        if (req.app.get('io')) {
            req.app.get('io').emit('newProduct', {
                type: 'product_created',
                message: `New product created: ${savedProduct.name}`,
                product: savedProduct,
                timestamp: new Date().toISOString(),
                user: req.user ? req.user.name : 'System'
            });
        }
        
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

        // Handle duplicate key errors (if any unique constraints)
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Product with this name already exists'
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
// @access  Private
const updateProduct = async (req, res) => {
    try {
        // Check for validation errors from express-validator middleware
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array().map(error => ({
                    field: error.param,
                    message: error.msg,
                    value: error.value
                }))
            });
        }

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

        // Validate price if provided in update
        if (req.body.price && (isNaN(req.body.price) || parseFloat(req.body.price) < 0)) {
            return res.status(400).json({
                success: false,
                message: 'Price must be a positive number'
            });
        }

        // Validate category if provided in update
        if (req.body.category) {
            const allowedCategories = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Other'];
            if (!allowedCategories.includes(req.body.category)) {
                return res.status(400).json({
                    success: false,
                    message: `Category must be one of: ${allowedCategories.join(', ')}`
                });
            }
        }
        
        // Prepare update data
        const updateData = { ...req.body };
        if (updateData.name) updateData.name = updateData.name.trim();
        if (updateData.description) updateData.description = updateData.description.trim();
        if (updateData.price) updateData.price = parseFloat(updateData.price);
        updateData.updatedAt = Date.now();

        // Update product using findByIdAndUpdate
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            updateData,
            { 
                new: true, // Return updated document
                runValidators: true // Run schema validations on update
            }
        );

        // Emit real-time notification if Socket.io is available
        if (req.app.get('io')) {
            req.app.get('io').emit('productUpdated', {
                type: 'product_updated',
                message: `Product updated: ${updatedProduct.name}`,
                product: updatedProduct,
                timestamp: new Date().toISOString(),
                user: req.user ? req.user.name : 'System'
            });
        }
        
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
// @access  Private/Admin
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

        // Emit real-time notification if Socket.io is available
        if (req.app.get('io')) {
            req.app.get('io').emit('productDeleted', {
                type: 'product_deleted',
                message: `Product deleted: ${deletedProduct.name}`,
                productId: productId,
                timestamp: new Date().toISOString(),
                user: req.user ? req.user.name : 'System'
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

// Export controller functions
module.exports = {
    getAllProducts,
    getSingleProduct,
    createProduct,
    updateProduct,
    deleteProduct
};