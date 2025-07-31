// Orders Management

// Load user orders
const loadUserOrders = requireAuth(async function(page = 1) {
    showLoading();
    
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/orders?page=${page}&limit=10`);
        const data = await response.json();
        
        if (data.success) {
            displayOrders(data.orders);
            displayOrdersPagination(data.pagination);
        } else {
            showToast('Failed to load orders', 'error');
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        showToast('Failed to load orders', 'error');
    } finally {
        hideLoading();
    }
});

// Display orders list
function displayOrders(orders) {
    const ordersListEl = document.getElementById('orders-list');
    
    if (!orders || orders.length === 0) {
        ordersListEl.innerHTML = `
            <div class="empty-orders">
                <i class="fas fa-receipt"></i>
                <h3>No orders found</h3>
                <p>You haven't placed any orders yet</p>
                <button class="btn btn-primary" onclick="showProducts()">Start Shopping</button>
            </div>
        `;
        return;
    }
    
    ordersListEl.innerHTML = orders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <div class="order-info">
                    <div class="order-number">Order #${order.orderNumber}</div>
                    <div class="order-date">${formatDate(order.createdAt)}</div>
                </div>
                <div class="order-status status-${order.status}">
                    ${order.status}
                </div>
            </div>
            
            <div class="order-items">
                ${order.items.map(item => `
                    <div class="order-item">
                        <img src="${item.product.image}" alt="${item.product.name}" class="order-item-image" onerror="this.src='https://via.placeholder.com/50x50?text=No+Image'">
                        <div class="order-item-info">
                            <div class="order-item-name">${item.product.name}</div>
                            <div class="order-item-details">
                                Quantity: ${item.quantity} × $${item.price.toFixed(2)}
                            </div>
                        </div>
                        <div class="order-item-total">
                            $${(item.quantity * item.price).toFixed(2)}
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="order-shipping">
                <h4>Shipping Address</h4>
                <p>
                    ${order.shippingAddress.street}<br>
                    ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
                    ${order.shippingAddress.country}
                </p>
            </div>
            
            <div class="order-footer">
                <div class="order-actions">
                    <button class="btn btn-primary" onclick="showOrderDetails('${order._id}')">
                        View Details
                    </button>
                    ${order.status === 'pending' || order.status === 'processing' ? 
                        `<button class="btn btn-danger" onclick="cancelOrder('${order._id}')">
                            Cancel Order
                        </button>` : ''
                    }
                </div>
                <div class="order-total">
                    Total: $${order.totalAmount.toFixed(2)}
                </div>
            </div>
        </div>
    `).join('');
}

// Display orders pagination
function displayOrdersPagination(pagination) {
    // Similar to products pagination but for orders
    // Implementation would be similar to displayPagination in products.js
    // but calling loadUserOrders instead of loadProducts
}

// Show order details in modal
const showOrderDetails = requireAuth(async function(orderId) {
    showLoading();
    
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/orders/${orderId}`);
        const data = await response.json();
        
        if (data.success) {
            const order = data.order;
            
            // Create order details modal
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.style.display = 'block';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                    <div class="order-details">
                        <h2>Order Details</h2>
                        
                        <div class="order-summary">
                            <div class="order-info-row">
                                <strong>Order Number:</strong> ${order.orderNumber}
                            </div>
                            <div class="order-info-row">
                                <strong>Order Date:</strong> ${formatDate(order.createdAt)}
                            </div>
                            <div class="order-info-row">
                                <strong>Status:</strong> 
                                <span class="order-status status-${order.status}">${order.status}</span>
                            </div>
                            <div class="order-info-row">
                                <strong>Payment Method:</strong> ${formatPaymentMethod(order.paymentMethod)}
                            </div>
                            <div class="order-info-row">
                                <strong>Payment Status:</strong> 
                                <span class="payment-status status-${order.paymentStatus}">${order.paymentStatus}</span>
                            </div>
                        </div>
                        
                        <h3>Items Ordered</h3>
                        <div class="order-items-detail">
                            ${order.items.map(item => `
                                <div class="order-item-detail">
                                    <img src="${item.product.image}" alt="${item.product.name}" class="order-item-image" onerror="this.src='https://via.placeholder.com/60x60?text=No+Image'">
                                    <div class="item-info">
                                        <div class="item-name">${item.product.name}</div>
                                        <div class="item-price">$${item.price.toFixed(2)} each</div>
                                        <div class="item-quantity">Quantity: ${item.quantity}</div>
                                    </div>
                                    <div class="item-total">
                                        $${(item.quantity * item.price).toFixed(2)}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        
                        <h3>Shipping Address</h3>
                        <div class="shipping-address">
                            <p>
                                ${order.shippingAddress.street}<br>
                                ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
                                ${order.shippingAddress.country}
                            </p>
                        </div>
                        
                        <div class="order-total-detail">
                            <h3>Total Amount: $${order.totalAmount.toFixed(2)}</h3>
                        </div>
                        
                        <div class="order-actions-detail">
                            ${order.status === 'pending' || order.status === 'processing' ? 
                                `<button class="btn btn-danger" onclick="cancelOrder('${order._id}'); this.closest('.modal').remove();">
                                    Cancel Order
                                </button>` : ''
                            }
                            <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
        } else {
            showToast('Failed to load order details', 'error');
        }
    } catch (error) {
        console.error('Error loading order details:', error);
        showToast('Failed to load order details', 'error');
    } finally {
        hideLoading();
    }
});

// Cancel order
const cancelOrder = requireAuth(async function(orderId) {
    if (!confirm('Are you sure you want to cancel this order?')) {
        return;
    }
    
    showLoading();
    
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
            method: 'PUT'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Order cancelled successfully', 'success');
            loadUserOrders(); // Reload orders list
        } else {
            showToast(data.message || 'Failed to cancel order', 'error');
        }
    } catch (error) {
        console.error('Error cancelling order:', error);
        showToast('Failed to cancel order', 'error');
    } finally {
        hideLoading();
    }
});

// Track order (placeholder for future implementation)
function trackOrder(orderId) {
    showToast('Order tracking feature coming soon!', 'info');
}

// Reorder items (add order items back to cart)
const reorderItems = requireAuth(async function(orderId) {
    showLoading();
    
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/orders/${orderId}`);
        const data = await response.json();
        
        if (data.success) {
            const order = data.order;
            
            // Add each item back to cart
            for (const item of order.items) {
                await addToCart(item.product._id, item.quantity);
            }
            
            showToast('Items added to cart successfully!', 'success');
            showCart();
            
        } else {
            showToast('Failed to reorder items', 'error');
        }
    } catch (error) {
        console.error('Error reordering items:', error);
        showToast('Failed to reorder items', 'error');
    } finally {
        hideLoading();
    }
});

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Format payment method for display
function formatPaymentMethod(method) {
    const methods = {
        'credit_card': 'Credit Card',
        'debit_card': 'Debit Card',
        'paypal': 'PayPal',
        'cod': 'Cash on Delivery'
    };
    return methods[method] || method;
}

// Filter orders by status
function filterOrdersByStatus(status) {
    // This would be implemented to filter orders
    // For now, we'll just reload with a status filter
    loadUserOrders(1, { status });
}

// Search orders
function searchOrders(query) {
    // Implementation for order search
    // This would typically be done on the backend
    showToast('Order search feature coming soon!', 'info');
}

// Export order details (placeholder)
function exportOrderDetails(orderId) {
    showToast('Export feature coming soon!', 'info');
}

// Get order status color class
function getStatusClass(status) {
    const statusClasses = {
        'pending': 'status-pending',
        'processing': 'status-processing',
        'shipped': 'status-shipped',
        'delivered': 'status-delivered',
        'cancelled': 'status-cancelled'
    };
    return statusClasses[status] || 'status-pending';
}

// Calculate order statistics
function calculateOrderStats(orders) {
    if (!orders || orders.length === 0) {
        return {
            totalOrders: 0,
            totalSpent: 0,
            averageOrderValue: 0,
            statusCounts: {}
        };
    }
    
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const averageOrderValue = totalSpent / totalOrders;
    
    const statusCounts = orders.reduce((counts, order) => {
        counts[order.status] = (counts[order.status] || 0) + 1;
        return counts;
    }, {});
    
    return {
        totalOrders,
        totalSpent,
        averageOrderValue,
        statusCounts
    };
}

// Display order statistics (for admin or user dashboard)
function displayOrderStats(orders) {
    const stats = calculateOrderStats(orders);
    
    return `
        <div class="order-stats">
            <div class="stat-card">
                <h3>Total Orders</h3>
                <div class="stat-value">${stats.totalOrders}</div>
            </div>
            <div class="stat-card">
                <h3>Total Spent</h3>
                <div class="stat-value">${stats.totalSpent.toFixed(2)}</div>
            </div>
            <div class="stat-card">
                <h3>Average Order</h3>
                <div class="stat-value">${stats.averageOrderValue.toFixed(2)}</div>
            </div>
        </div>
    `;
}