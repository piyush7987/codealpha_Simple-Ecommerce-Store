const Order = require('../models/Order');
const Product = require('../models/Product');

// Create new order
const createOrder = async (req, res) => {
    try {
        const { items, shippingAddress, paymentMethod } = req.body;

        // Validation
        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Order must contain at least one item'
            });
        }

        if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || 
            !shippingAddress.state || !shippingAddress.zipCode) {
            return res.status(400).json({
                success: false,
                message: 'Please provide complete shipping address'
            });
        }

        // Validate products and calculate total
        let totalAmount = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findById(item.productId);
            
            if (!product || !product.isActive) {
                return res.status(400).json({
                    success: false,
                    message: `Product ${item.productId} not found or unavailable`
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
                });
            }

            const itemTotal = product.price * item.quantity;
            totalAmount += itemTotal;

            orderItems.push({
                product: product._id,
                quantity: item.quantity,
                price: product.price
            });

            // Update product stock
            product.stock -= item.quantity;
            await product.save();
        }

        // Create order
        const order = await Order.create({
            user: req.user._id,
            items: orderItems,
            totalAmount,
            shippingAddress,
            paymentMethod: paymentMethod || 'cod'
        });

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            order
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Get user orders
const getUserOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;

        const filter = { user: req.user._id };
        if (status) {
            filter.status = status;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const orders = await Order.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Order.countDocuments(filter);
        const totalPages = Math.ceil(total / parseInt(limit));

        res.json({
            success: true,
            orders,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalOrders: total,
                hasNextPage: parseInt(page) < totalPages,
                hasPrevPage: parseInt(page) > 1
            }
        });
    } catch (error) {
        console.error('Get user orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Get single order
const getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if user owns the order or is admin
        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        res.json({
            success: true,
            order
        });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Update order status (Admin only)
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        order.status = status;
        await order.save();

        res.json({
            success: true,
            message: 'Order status updated successfully',
            order
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Cancel order
const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if user owns the order
        if (order.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Check if order can be cancelled
        if (order.status === 'shipped' || order.status === 'delivered') {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel order that has been shipped or delivered'
            });
        }

        if (order.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Order is already cancelled'
            });
        }

        // Restore product stock
        for (const item of order.items) {
            const product = await Product.findById(item.product._id);
            if (product) {
                product.stock += item.quantity;
                await product.save();
            }
        }

        order.status = 'cancelled';
        await order.save();

        res.json({
            success: true,
            message: 'Order cancelled successfully',
            order
        });
    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Get all orders (Admin only)
const getAllOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;

        const filter = {};
        if (status) {
            filter.status = status;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const orders = await Order.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Order.countDocuments(filter);
        const totalPages = Math.ceil(total / parseInt(limit));

        res.json({
            success: true,
            orders,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalOrders: total,
                hasNextPage: parseInt(page) < totalPages,
                hasPrevPage: parseInt(page) > 1
            }
        });
    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

module.exports = {
    createOrder,
    getUserOrders,
    getOrder,
    updateOrderStatus,
    cancelOrder,
    getAllOrders
};