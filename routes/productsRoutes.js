const express = require("express");
const router = express.Router();

const {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getSingleProduct,
  
} = require("../controllers/productsController");

// GET /api/products - Get all products (with optional query filters)
router.get("/", getAllProducts);

// GET /api/products/:id - Get single product by ID
router.get("/:id", getSingleProduct);

// POST /api/products - Create a new product
router.post("/", createProduct);

// PUT /api/products/:id - Update an existing product
router.put("/:id", updateProduct);

// DELETE /api/products/:id - Delete a product
router.delete("/:id", deleteProduct);

module.exports = router;
