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

// Get all products with optional filtering
const getAllProducts = (req, res) => {
    try {
        let filteredProducts = [...products];
        
        // Filter by category if provided in query string
        if (req.query.category) {
            filteredProducts = filteredProducts.filter(product =>
                product.category.toLowerCase().includes(req.query.category.toLowerCase())
            );
        }
        
        // Filter by name if provided in query string
        if (req.query.name) {
            filteredProducts = filteredProducts.filter(product =>
                product.name.toLowerCase().includes(req.query.name.toLowerCase())
            );
        }
        
        // Filter by inStock status if provided
        if (req.query.inStock) {
            const inStock = req.query.inStock.toLowerCase() === 'true';
            filteredProducts = filteredProducts.filter(product => product.inStock === inStock);
        }
        
        res.json({
            success: true,
            count: filteredProducts.length,
            data: filteredProducts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving products',
            error: error.message
        });
    }
};

// Get single product by ID
const getSingleProduct = (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const product = products.find(p => p.id === productId);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: `Product with ID ${productId} not found`
            });
        }
        
        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving product',
            error: error.message
        });
    }
};

// Export controller functions
module.exports = {
    getAllProducts,
    getSingleProduct
};