// In-memory storage for products (temporary solution)
let products = [
    {
        id: 1,
        name: 'Laptop',
        category: 'Electronics',
        price: 999.99,
        description: 'High-performance laptop for professionals',
        inStock: true
    },
    {
        id: 2,
        name: 'Smartphone',
        category: 'Electronics',
        price: 699.99,
        description: 'Latest smartphone with advanced features',
        inStock: true
    },
    {
        id: 3,
        name: 'Coffee Maker',
        category: 'Home Appliances',
        price: 149.99,
        description: 'Automatic coffee maker for your kitchen',
        inStock: false
    }
];

// Utility function to generate unique ID
const generateId = () => {
    return products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
};


// Create a new product
const createProduct = (req, res) => {
    try {
        const { name, category, price, description, inStock } = req.body;
        
        // Basic validation
        if (!name || !category || !price) {
            return res.status(400).json({
                success: false,
                message: 'Name, category, and price are required fields'
            });
        }
        
        if (typeof price !== 'number' || price <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Price must be a positive number'
            });
        }
        
        // Create new product object
        const newProduct = {
            id: generateId(),
            name,
            category,
            price,
            description: description || '',
            inStock: inStock !== undefined ? inStock : true
        };
        
        // Add to products array
        products.push(newProduct);
        
        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: newProduct
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating product',
            error: error.message
        });
    }
};

// Update an existing product
const updateProduct = (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const { name, category, price, description, inStock } = req.body;
        
        // Find product index
        const productIndex = products.findIndex(p => p.id === productId);
        
        if (productIndex === -1) {
            return res.status(404).json({
                success: false,
                message: `Product with ID ${productId} not found`
            });
        }
        
        // Update product - only update provided fields
        const updatedProduct = {
            ...products[productIndex],
            ...(name !== undefined && { name }),
            ...(category !== undefined && { category }),
            ...(price !== undefined && { price }),
            ...(description !== undefined && { description }),
            ...(inStock !== undefined && { inStock })
        };
        
        // Validate price if provided
        if (price !== undefined && (typeof price !== 'number' || price <= 0)) {
            return res.status(400).json({
                success: false,
                message: 'Price must be a positive number'
            });
        }
        
        products[productIndex] = updatedProduct;
        
        res.json({
            success: true,
            message: 'Product updated successfully',
            data: updatedProduct
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating product',
            error: error.message
        });
    }
};

// Delete a product
const deleteProduct = (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const productIndex = products.findIndex(p => p.id === productId);
        
        if (productIndex === -1) {
            return res.status(404).json({
                success: false,
                message: `Product with ID ${productId} not found`
            });
        }
        
        // Remove product from array
        const deletedProduct = products.splice(productIndex, 1)[0];
        
        res.json({
            success: true,
            message: 'Product deleted successfully',
            data: deletedProduct
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting product',
            error: error.message
        });
    }
};

// Export all controller functions
module.exports = {
    createProduct,
    updateProduct,
    deleteProduct
};