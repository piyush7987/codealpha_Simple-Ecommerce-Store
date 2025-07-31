// Shopping Cart Management
let cart = [];

// Load cart from localStorage
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    cart = savedCart ? JSON.parse(savedCart) : [];
    updateCartCount();
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

// Update cart count in navigation
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

// Add product to cart
async function addToCart(productId, quantity = 1) {
    showLoading();
    
    try {
        // Get product details
        const response = await fetch(`${API_BASE_URL}/products/${productId}`);
        const data = await response.json();
        
        if (!data.success) {
            showToast('Product not found', 'error');
            return;
        }
        
        const product = data.product;
        
        // Check stock availability
        if (product.stock <= 0) {
            showToast('Product is out of stock', 'error');
            return;
        }
        
        // Check if product already exists in cart
        const existingItem = cart.find(item => item.productId === productId);
        
        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            
            if (newQuantity > product.stock) {
                showToast(`Only ${product.stock} items available in stock`, 'error');
                return;
            }
            
            existingItem.quantity = newQuantity;
        } else {
            if (quantity > product.stock) {
                showToast(`Only ${product.stock} items available in stock`, 'error');
                return;
            }
            
            cart.push({
                productId: product._id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: quantity,
                stock: product.stock
            });
        }
        
        saveCart();
        showToast(`${product.name} added to cart`, 'success');
        
    } catch (error) {
        console.error('Error adding to cart:', error);
        showToast('Failed to add item to cart', 'error');
    } finally {
        hideLoading();
    }
}

// Remove item from cart
function removeFromCart(productId) {
    const itemIndex = cart.findIndex(item => item.productId === productId);
    
    if (itemIndex > -1) {
        const item = cart[itemIndex];
        cart.splice(itemIndex, 1);
        saveCart();
        showToast(`${item.name} removed from cart`, 'info');
        displayCart();
    }
}

// Update item quantity in cart
function updateCartQuantity(productId, newQuantity) {
    const item = cart.find(item => item.productId === productId);
    
    if (!item) return;
    
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    if (newQuantity > item.stock) {
        showToast(`Only ${item.stock} items available in stock`, 'error');
        return;
    }
    
    item.quantity = newQuantity;
    saveCart();
    displayCart();
}

// Display cart items
function displayCart() {
    const cartItemsEl = document.getElementById('cart-items');
    const cartTotalEl = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    if (cart.length === 0) {
        cartItemsEl.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h3>Your cart is empty</h3>
                <p>Add some products to get started</p>
                <button class="btn btn-primary" onclick="showProducts()">Continue Shopping</button>
            </div>
        `;
        cartTotalEl.textContent = '0.00';
        checkoutBtn.disabled = true;
        return;
    }
    
    cartItemsEl.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image" onerror="this.src='https://via.placeholder.com/80x80?text=No+Image'">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">$${item.price.toFixed(2)} each</div>
                <div class="cart-item-total">Total: $${(item.price * item.quantity).toFixed(2)}</div>
            </div>
            <div class="cart-item-controls">
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateCartQuantity('${item.productId}', ${item.quantity - 1})">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateCartQuantity('${item.productId}', ${item.quantity + 1})">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <button class="remove-btn" onclick="removeFromCart('${item.productId}')">
                    <i class="fas fa-trash"></i> Remove
                </button>
            </div>
        </div>
    `).join('');
    
    // Calculate and display total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotalEl.textContent = total.toFixed(2);
    checkoutBtn.disabled = false;
}

// Show checkout modal
const showCheckout = requireAuth(function() {
    if (cart.length === 0) {
        showToast('Your cart is empty', 'error');
        return;
    }
    
    // Populate checkout items
    const checkoutItemsEl = document.getElementById('checkout-items');
    const checkoutTotalEl = document.getElementById('checkout-total');
    
    checkoutItemsEl.innerHTML = cart.map(item => `
        <div class="checkout-item">
            <span>${item.name} x ${item.quantity}</span>
            <span>$${(item.price * item.quantity).toFixed(2)}</span>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    checkoutTotalEl.textContent = total.toFixed(2);
    
    document.getElementById('checkout-modal').style.display = 'block';
    
    // Handle checkout form submission
    const checkoutForm = document.getElementById('checkout-form');
    checkoutForm.onsubmit = handleCheckout;
});

// Handle checkout form submission
async function handleCheckout(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const shippingAddress = {
        street: document.getElementById('street').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        zipCode: document.getElementById('zipCode').value,
        country: document.getElementById('country').value
    };
    
    const paymentMethod = document.getElementById('paymentMethod').value;
    
    // Validate form
    if (!shippingAddress.street || !shippingAddress.city || 
        !shippingAddress.state || !shippingAddress.zipCode) {
        showToast('Please fill in all shipping address fields', 'error');
        return;
    }
    
    showLoading();
    
    try {
        // Prepare order data
        const orderData = {
            items: cart.map(item => ({
                productId: item.productId,
                quantity: item.quantity
            })),
            shippingAddress,
            paymentMethod
        };
        
        const response = await authenticatedFetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Clear cart
            cart = [];
            saveCart();
            
            // Close checkout modal
            closeCheckoutModal();
            
            // Show success message
            showToast('Order placed successfully!', 'success');
            
            // Show order details or redirect to orders page
            showOrderSuccess(data.order);
            
        } else {
            showToast(data.message || 'Failed to place order', 'error');
        }
    } catch (error) {
        console.error('Checkout error:', error);
        showToast('Failed to place order. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

// Show order success message
function showOrderSuccess(order) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="order-success">
                <i class="fas fa-check-circle" style="font-size: 4rem; color: #28a745; margin-bottom: 1rem;"></i>
                <h2>Order Placed Successfully!</h2>
                <p>Your order <strong>${order.orderNumber}</strong> has been placed successfully.</p>
                <p>Total Amount: <strong>$${order.totalAmount.toFixed(2)}</strong></p>
                <p>You will receive a confirmation email shortly.</p>
                <div style="margin-top: 2rem;">
                    <button class="btn btn-primary" onclick="this.closest('.modal').remove(); showOrders();">
                        View My Orders
                    </button>
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove(); showProducts();">
                        Continue Shopping
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Auto remove modal after 10 seconds
    setTimeout(() => {
        if (document.body.contains(modal)) {
            modal.remove();
        }
    }, 10000);
}

// Clear entire cart
function clearCart() {
    if (cart.length === 0) {
        showToast('Cart is already empty', 'info');
        return;
    }
    
    if (confirm('Are you sure you want to clear your cart?')) {
        cart = [];
        saveCart();
        displayCart();
        showToast('Cart cleared', 'info');
    }
}

// Get cart summary
function getCartSummary() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    return {
        items: cart,
        totalItems,
        totalAmount,
        isEmpty: cart.length === 0
    };
}