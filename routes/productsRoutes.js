const express = require('express');
const router = express.Router();
const {
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productsController');


// POST /api/products - Create a new product
router.post('/', createProduct);

// PUT /api/products/:id - Update an existing product
router.put('/:id', updateProduct);

// DELETE /api/products/:id - Delete a product
router.delete('/:id', deleteProduct);

module.exports = router;

