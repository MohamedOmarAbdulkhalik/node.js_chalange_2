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
// GET /api/products - Get all products
router.get('/', getAllProducts);

// GET /api/products/:id - Get single product by ID
router.get('/:id', getSingleProduct);

// POST /api/products - Create a new product (with validation)
router.post('/', validateProduct, handleValidationErrors, createProduct);

// PUT /api/products/:id - Update an existing product (with validation)
router.put('/:id', validateProduct, handleValidationErrors, updateProduct);

// DELETE /api/products/:id - Delete a product
router.delete('/:id', deleteProduct);

module.exports = router;