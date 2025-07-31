// Products Management
let currentPage = 1;
let currentFilters = {
    search: '',
    category: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc'
};

// Load products with filters and pagination
async function loadProducts(page = 1, filters = {}) {
    showLoading();
    
    try {
        // Merge current filters with new ones
        currentFilters = { ...currentFilters, ...filters };
        currentPage = page;
        
        // Build query parameters
        const params = new URLSearchParams({
            page: page.toString(),
            limit: '12',
            ...currentFilters
        });
        
        // Remove empty parameters
        for (const [key, value] of params.entries()) {
            if (!value || value === 'all' || value === '') {
                params.delete(key);
            }
        }
        
        const response = await fetch(`${API_BASE_URL}/products?${params}`);
        const data = await response.json();
        
        if (data.success) {
            displayProducts(data.products);
            displayPagination(data.pagination);
        } else {
            showToast('Failed to load products', 'error');
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showToast('Network error. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

// Display products in grid
function displayProducts(products) {
    const productsGrid = document.getElementById('products-grid');
    
    if (!products || products.length === 0) {
        productsGrid.innerHTML = `
            <div class="no-products">
                <i class="fas fa-box-open"></i>
                <h3>No products found</h3>
                <p>Try adjusting your search or filters</p>
            </div>
        `;
        return;
    }
    
    productsGrid.innerHTML = products.map(product => `
        <div class="product-card" onclick="showProductDetails('${product._id}')">
            <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description.substring(0, 100)}${product.description.length > 100 ? '...' : ''}</p>
                <div class="product-price">${product.price.toFixed(2)}</div>
                <div class="product-meta">
                    <span class="product-category">${product.category}</span>
                    <span class="product-stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">
                        ${product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </span>
                </div>
                <div class="product-actions">
                    <button class="btn btn-primary" onclick="event.stopPropagation(); showProductDetails('${product._id}')">
                        View Details
                    </button>
                    <button class="btn btn-secondary ${product.stock <= 0 ? 'disabled' : ''}" 
                            onclick="event.stopPropagation(); addToCart('${product._id}')" 
                            ${product.stock <= 0 ? 'disabled' : ''}>
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Display pagination
function displayPagination(pagination) {
    const paginationEl = document.getElementById('pagination');
    
    if (!pagination || pagination.totalPages <= 1) {
        paginationEl.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <button onclick="loadProducts(${pagination.currentPage - 1})" 
                ${!pagination.hasPrevPage ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i> Previous
        </button>
    `;
    
    // Page numbers
    const startPage = Math.max(1, pagination.currentPage - 2);
    const endPage = Math.min(pagination.totalPages, pagination.currentPage + 2);
    
    if (startPage > 1) {
        paginationHTML += `<button onclick="loadProducts(1)">1</button>`;
        if (startPage > 2) {
            paginationHTML += `<span>...</span>`;
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button onclick="loadProducts(${i})" 
                    ${i === pagination.currentPage ? 'class="active"' : ''}>
                ${i}
            </button>
        `;
    }
    
    if (endPage < pagination.totalPages) {
        if (endPage < pagination.totalPages - 1) {
            paginationHTML += `<span>...</span>`;
        }
        paginationHTML += `<button onclick="loadProducts(${pagination.totalPages})">${pagination.totalPages}</button>`;
    }
    
    // Next button
    paginationHTML += `
        <button onclick="loadProducts(${pagination.currentPage + 1})" 
                ${!pagination.hasNextPage ? 'disabled' : ''}>
            Next <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    paginationEl.innerHTML = paginationHTML;
}

// Show product details in modal
async function showProductDetails(productId) {
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`);
        const data = await response.json();
        
        if (data.success) {
            const product = data.product;
            
            document.getElementById('product-details').innerHTML = `
                <div class="product-detail">
                    <img src="${product.image}" alt="${product.name}" class="product-detail-image" onerror="this.src='https://via.placeholder.com/300x300?text=No+Image'">
                    <div class="product-detail-info">
                        <h2>${product.name}</h2>
                        <div class="product-detail-price">${product.price.toFixed(2)}</div>
                        <div class="product-category">Category: ${product.category}</div>
                        <div class="product-stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">
                            ${product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                        </div>
                        <div class="product-detail-description">
                            <h4>Description</h4>
                            <p>${product.description}</p>
                        </div>
                        <div class="product-detail-actions">
                            <button class="btn btn-secondary ${product.stock <= 0 ? 'disabled' : ''}" 
                                    onclick="addToCart('${product._id}')" 
                                    ${product.stock <= 0 ? 'disabled' : ''}>
                                <i class="fas fa-shopping-cart"></i> Add to Cart
                            </button>
                            <button class="btn btn-primary" onclick="closeModal()">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            document.getElementById('product-modal').style.display = 'block';
        } else {
            showToast('Failed to load product details', 'error');
        }
    } catch (error) {
        console.error('Error loading product details:', error);
        showToast('Network error. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

// Load product categories
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/products/categories`);
        const data = await response.json();
        
        if (data.success) {
            const categoryFilter = document.getElementById('category-filter');
            
            // Clear existing options (except "All Categories")
            categoryFilter.innerHTML = '<option value="all">All Categories</option>';
            
            // Add category options
            data.categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categoryFilter.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Set up product filters
function setupProductFilters() {
    // Search filter
    const searchInput = document.getElementById('search-input');
    let searchTimeout;
    
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentFilters.search = this.value;
            loadProducts(1, { search: this.value });
        }, 500); // Debounce search
    });
    
    // Category filter
    document.getElementById('category-filter').addEventListener('change', function() {
        currentFilters.category = this.value;
        loadProducts(1, { category: this.value });
    });
    
    // Sort filter
    document.getElementById('sort-filter').addEventListener('change', function() {
        const [sortBy, sortOrder] = this.value.split('-');
        currentFilters.sortBy = sortBy;
        currentFilters.sortOrder = sortOrder;
        loadProducts(1, { sortBy, sortOrder });
    });
}

// Initialize product filters when products section is shown
function initializeProductFilters() {
    if (!document.getElementById('search-input').hasEventListener) {
        setupProductFilters();
        document.getElementById('search-input').hasEventListener = true;
    }
}

// Override showProducts to initialize filters
const originalShowProducts = showProducts;
showProducts = function() {
    originalShowProducts();
    initializeProductFilters();
    if (document.getElementById('products-grid').children.length === 0) {
        loadProducts();
    }
};