// Authentication Management
const API_BASE_URL = 'http://localhost:3000/api';

// Check if user is authenticated
function isAuthenticated() {
    return localStorage.getItem('token') !== null;
}

// Get current user data
function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

// Get auth token
function getAuthToken() {
    return localStorage.getItem('token');
}

// Set authentication data
function setAuthData(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    updateAuthUI();
}

// Clear authentication data
function clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    updateAuthUI();
}

// Update authentication UI
function updateAuthUI() {
    const loginLink = document.getElementById('login-link');
    const registerLink = document.getElementById('register-link');
    const userMenu = document.getElementById('user-menu');
    const userName = document.getElementById('user-name');

    if (isAuthenticated()) {
        const user = getCurrentUser();
        loginLink.style.display = 'none';
        registerLink.style.display = 'none';
        userMenu.style.display = 'block';
        userName.textContent = user.name;
    } else {
        loginLink.style.display = 'inline';
        registerLink.style.display = 'inline';
        userMenu.style.display = 'none';
    }
}

// Check authentication status on page load
function checkAuthStatus() {
    updateAuthUI();
}

// Show login form
function showLogin() {
    const authModal = document.getElementById('auth-modal');
    const authForms = document.getElementById('auth-forms');
    
    authForms.innerHTML = `
        <div class="form-container">
            <h2>Login</h2>
            <form id="login-form">
                <div class="form-group">
                    <label for="login-email">Email:</label>
                    <input type="email" id="login-email" required>
                </div>
                <div class="form-group">
                    <label for="login-password">Password:</label>
                    <input type="password" id="login-password" required>
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%;">Login</button>
            </form>
            <div class="form-toggle">
                <p>Don't have an account? <a href="#" onclick="showRegister()">Register here</a></p>
            </div>
        </div>
    `;
    
    authModal.style.display = 'block';
    
    // Handle login form submission
    document.getElementById('login-form').addEventListener('submit', handleLogin);
}

// Show register form
function showRegister() {
    const authModal = document.getElementById('auth-modal');
    const authForms = document.getElementById('auth-forms');
    
    authForms.innerHTML = `
        <div class="form-container">
            <h2>Register</h2>
            <form id="register-form">
                <div class="form-group">
                    <label for="register-name">Full Name:</label>
                    <input type="text" id="register-name" required>
                </div>
                <div class="form-group">
                    <label for="register-email">Email:</label>
                    <input type="email" id="register-email" required>
                </div>
                <div class="form-group">
                    <label for="register-password">Password:</label>
                    <input type="password" id="register-password" minlength="6" required>
                </div>
                <div class="form-group">
                    <label for="register-confirm-password">Confirm Password:</label>
                    <input type="password" id="register-confirm-password" minlength="6" required>
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%;">Register</button>
            </form>
            <div class="form-toggle">
                <p>Already have an account? <a href="#" onclick="showLogin()">Login here</a></p>
            </div>
        </div>
    `;
    
    authModal.style.display = 'block';
    
    // Handle register form submission
    document.getElementById('register-form').addEventListener('submit', handleRegister);
}

// Handle login form submission
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            setAuthData(data.token, data.user);
            showToast('Login successful!', 'success');
            closeAuthModal();
        } else {
            showToast(data.message || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast('Network error. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

// Handle register form submission
async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    if (!name || !email || !password || !confirmPassword) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 6) {
        showToast('Password must be at least 6 characters long', 'error');
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            setAuthData(data.token, data.user);
            showToast('Registration successful!', 'success');
            closeAuthModal();
        } else {
            showToast(data.message || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Register error:', error);
        showToast('Network error. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

// Logout function
function logout() {
    clearAuthData();
    showToast('Logged out successfully', 'info');
    
    // Redirect to home page
    showHome();
    
    // Clear cart
    localStorage.removeItem('cart');
    updateCartCount();
}

// Make authenticated API requests
async function authenticatedFetch(url, options = {}) {
    const token = getAuthToken();
    
    if (!token) {
        throw new Error('No authentication token found');
    }
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };
    
    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };
    
    const response = await fetch(url, mergedOptions);
    
    // Handle token expiration
    if (response.status === 401) {
        clearAuthData();
        showToast('Session expired. Please login again.', 'error');
        showLogin();
        throw new Error('Token expired');
    }
    
    return response;
}

// Require authentication for certain actions
function requireAuth(callback) {
    return function(...args) {
        if (!isAuthenticated()) {
            showToast('Please login to continue', 'error');
            showLogin();
            return;
        }
        return callback.call(this, ...args);
    };
}