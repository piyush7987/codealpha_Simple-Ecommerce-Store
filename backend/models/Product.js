const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxlength: [200, 'Product name cannot exceed 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Price cannot be negative']
    },
    category: {
        type: String,
        required: [true, 'Product category is required'],
        enum: ['Electronics', 'Clothing', 'Sports', 'Kitchen', 'Home', 'Books', 'Accessories', 'Other']
    },
    image: {
        type: String,
        required: [true, 'Product image is required'],
        default: 'https://via.placeholder.com/300x300?text=No+Image'
    },
    stock: {
        type: Number,
        required: [true, 'Stock quantity is required'],
        min: [0, 'Stock cannot be negative'],
        default: 0
    },
    ratings: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0
        }
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for search functionality
productSchema.index({ name: 'text', description: 'text', category: 'text' });

// Virtual for availability status
productSchema.virtual('isAvailable').get(function() {
    return this.stock > 0 && this.isActive;
});

// Ensure virtual fields are serialized
productSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);