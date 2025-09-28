const express = require('express');
const router = express.Router();
const {
    getAllProducts,
    getSingleProduct,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productsController');

const{
    validateProduct,
    handleValidationErrors
} = require('../middleware/validation');

const { protect, authorize } = require('../middleware/auth'); 

// GET /api/products - Get all products
router.get('/', getAllProducts);

// GET /api/products/:id - Get single product by ID
router.get('/:id', getSingleProduct);

// POST /api/products - Create a new product (with validation)
router.post('/', protect, validateProduct, handleValidationErrors, createProduct);

// PUT /api/products/:id - Update an existing product (with validation)
router.put('/:id', protect, validateProduct, handleValidationErrors, updateProduct);

// DELETE /api/products/:id - Delete a product
router.delete('/:id', protect, authorize('admin'), deleteProduct);

module.exports = router;