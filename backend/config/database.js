const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
        // Create sample products if the database is empty
        await createSampleData();
    } catch (error) {
        console.error('Database connection error:', error.message);
        process.exit(1);
    }
};

const createSampleData = async () => {
    try {
        const Product = require('../models/Product');
        const productCount = await Product.countDocuments();
        
        if (productCount === 0) {
            const sampleProducts = [
                {
                    name: "Wireless Headphones",
                    description: "High-quality wireless headphones with noise cancellation",
                    price: 99.99,
                    category: "Electronics",
                    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300",
                    stock: 50
                },
                {
                    name: "Smartphone",
                    description: "Latest model smartphone with advanced features",
                    price: 699.99,
                    category: "Electronics",
                    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300",
                    stock: 30
                },
                {
                    name: "Running Shoes",
                    description: "Comfortable running shoes for daily exercise",
                    price: 79.99,
                    category: "Sports",
                    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300",
                    stock: 100
                },
                {
                    name: "Coffee Maker",
                    description: "Automatic coffee maker with programmable settings",
                    price: 129.99,
                    category: "Kitchen",
                    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300",
                    stock: 25
                },
                {
                    name: "Backpack",
                    description: "Durable backpack perfect for travel and work",
                    price: 49.99,
                    category: "Accessories",
                    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300",
                    stock: 75
                },
                {
                    name: "Desk Lamp",
                    description: "Modern LED desk lamp with adjustable brightness",
                    price: 39.99,
                    category: "Home",
                    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=300",
                    stock: 40
                }
            ];

            await Product.insertMany(sampleProducts);
            console.log('Sample products created successfully');
        }
    } catch (error) {
        console.error('Error creating sample data:', error.message);
    }
};

module.exports = connectDB;