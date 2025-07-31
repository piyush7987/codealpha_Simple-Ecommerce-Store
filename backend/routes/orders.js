const express = require('express');
const {
    createOrder,
    getUserOrders,
    getOrder,
    updateOrderStatus,
    cancelOrder,
    getAllOrders
} = require('../controllers/orderController');
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();

// User routes (requires authentication)
router.post('/', authenticate, createOrder);
router.get('/', authenticate, getUserOrders);
router.get('/:id', authenticate, getOrder);
router.put('/:id/cancel', authenticate, cancelOrder);

// Admin routes
router.get('/admin/all', authenticate, isAdmin, getAllOrders);
router.put('/:id/status', authenticate, isAdmin, updateOrderStatus);

module.exports = router;