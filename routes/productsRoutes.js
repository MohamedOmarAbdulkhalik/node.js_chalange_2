const express = require('express');
const router = express.Router();
const { getAllProducts, getSingleProduct } = require('../controllers/productsController');

// GET /api/products - Get all products (with optional query filters)
router.get('/', getAllProducts);

// GET /api/products/:id - Get single product by ID
router.get('/:id', getSingleProduct);

module.exports = router;