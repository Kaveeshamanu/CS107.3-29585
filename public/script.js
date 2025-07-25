// Global state
let currentUser = null;
let socket = null;
let cart = [];

// DOM elements
const elements = {
    loginBtn: document.getElementById('loginBtn'),
    loginModal: document.getElementById('loginModal'),
    loginForm: document.getElementById('loginForm'),
    chatWidget: document.getElementById('chatWidget'),
    chatToggle: document.getElementById('chatToggle'),
    chatInput: document.getElementById('chatInput'),
    chatSend: document.getElementById('chatSend'),
    chatMessages: document.getElementById('chatMessages'),
    chatSuggestions: document.getElementById('chatSuggestions'),
    startChatBtn: document.getElementById('startChatBtn'),
    browseProductsBtn: document.getElementById('browseProductsBtn'),
    productsGrid: document.getElementById('productsGrid'),
    productsLoading: document.getElementById('productsLoading'),
    categoryFilter: document.getElementById('categoryFilter'),
    sortFilter: document.getElementById('sortFilter'),
    cartBtn: document.getElementById('cartBtn'),
    cartCount: document.getElementById('cartCount'),
    ordersList: document.getElementById('ordersList'),
    profileCard: document.getElementById('profileCard'),
    preferencesForm: document.getElementById('preferencesForm'),
    productModal: document.getElementById('productModal'),
    productModalTitle: document.getElementById('productModalTitle'),
    productModalBody: document.getElementById('productModalBody')
};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    initializeSocket();
    loadProducts();
});

function initializeApp() {
    // Check for saved user session
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUIForLoggedInUser();
    }

    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
    }

    // Set initial section
    showSection('home');
}

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('href').substring(1);
            showSection(section);
            updateActiveNavLink(link);
        });
    });

    // Login
    elements.loginBtn.addEventListener('click', () => {
        elements.loginModal.classList.add('active');
    });

    elements.loginForm.addEventListener('submit', handleLogin);

    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal').classList.remove('active');
        });
    });

    // Chat functionality
    elements.chatToggle.addEventListener('click', toggleChat);
    elements.startChatBtn.addEventListener('click', openChat);
    elements.chatSend.addEventListener('click', sendMessage);
    elements.chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // Chat suggestions
    elements.chatSuggestions.addEventListener('click', (e) => {
        if (e.target.classList.contains('suggestion-btn')) {
            sendSuggestion(e.target.textContent);
        }
    });

    // Product filters
    elements.categoryFilter.addEventListener('change', filterProducts);
    elements.sortFilter.addEventListener('change', filterProducts);

    // Hero actions
    elements.browseProductsBtn.addEventListener('click', () => {
        showSection('products');
        updateActiveNavLink(document.querySelector('[href="#products"]'));
    });

    // Cart
    elements.cartBtn.addEventListener('click', showCart);

    // Close modals when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });
}

function initializeSocket() {
    socket = io();
    
    socket.on('connect', () => {
        console.log('Connected to server');
        if (currentUser) {
            socket.emit('join_chat', currentUser.id);
        }
    });

    socket.on('ai_response', (data) => {
        addMessageToChat(data.message, 'ai');
    });
}

// Authentication
async function handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
        const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            currentUser = data.user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            elements.loginModal.classList.remove('active');
            updateUIForLoggedInUser();
            socket.emit('join_chat', currentUser.id);
            showNotification('Login successful!', 'success');
        } else {
            showNotification(data.error || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Login failed. Please try again.', 'error');
    }
}

function updateUIForLoggedInUser() {
    elements.loginBtn.textContent = currentUser.name;
    elements.loginBtn.onclick = logout;
    loadUserData();
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    elements.loginBtn.textContent = 'Login';
    elements.loginBtn.onclick = () => elements.loginModal.classList.add('active');
    showNotification('Logged out successfully', 'info');
}

// Navigation
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');

    // Load section-specific data
    switch(sectionId) {
        case 'products':
            loadProducts();
            break;
        case 'orders':
            loadOrders();
            break;
        case 'profile':
            loadProfile();
            break;
    }
}

function updateActiveNavLink(activeLink) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    activeLink.classList.add('active');
}

// Chat functionality
function toggleChat() {
    elements.chatWidget.classList.toggle('minimized');
    const icon = elements.chatToggle.querySelector('i');
    icon.className = elements.chatWidget.classList.contains('minimized') 
        ? 'fas fa-plus' 
        : 'fas fa-minus';
}

function openChat() {
    elements.chatWidget.classList.remove('minimized');
    elements.chatInput.focus();
}

async function sendMessage() {
    const message = elements.chatInput.value.trim();
    if (!message) return;

    // Add user message to chat
    addMessageToChat(message, 'user');
    elements.chatInput.value = '';

    // Send to AI
    try {
        const response = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message,
                userId: currentUser?.id,
                context: getConversationContext()
            }),
        });

        const data = await response.json();
        
        if (response.ok) {
            addMessageToChat(data.response, 'ai');
            updateChatSuggestions(data.suggestions);
        } else {
            addMessageToChat('Sorry, I encountered an error. Please try again.', 'ai');
        }
    } catch (error) {
        console.error('Chat error:', error);
        addMessageToChat('Sorry, I encountered an error. Please try again.', 'ai');
    }
}

function sendSuggestion(suggestion) {
    elements.chatInput.value = suggestion;
    sendMessage();
}

function addMessageToChat(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = type === 'ai' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    content.innerHTML = `
        <p>${message}</p>
        <span class="message-time">${new Date().toLocaleTimeString()}</span>
    `;
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    
    elements.chatMessages.appendChild(messageDiv);
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

function updateChatSuggestions(suggestions) {
    if (!suggestions) return;
    
    elements.chatSuggestions.innerHTML = '';
    suggestions.forEach(suggestion => {
        const btn = document.createElement('button');
        btn.className = 'suggestion-btn';
        btn.textContent = suggestion;
        elements.chatSuggestions.appendChild(btn);
    });
}

function getConversationContext() {
    const messages = elements.chatMessages.querySelectorAll('.message');
    return Array.from(messages).slice(-5).map(msg => {
        const content = msg.querySelector('.message-content p').textContent;
        const type = msg.classList.contains('user-message') ? 'user' : 'ai';
        return { content, type };
    });
}

// Products
async function loadProducts() {
    showLoading('productsLoading');
    
    try {
        const category = elements.categoryFilter.value;
        const sortBy = elements.sortFilter.value;
        
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (sortBy) params.append('sortBy', sortBy);
        
        const response = await fetch(`/api/products?${params}`);
        const data = await response.json();
        
        if (response.ok) {
            displayProducts(data.products);
        } else {
            showNotification('Failed to load products', 'error');
        }
    } catch (error) {
        console.error('Products load error:', error);
        showNotification('Failed to load products', 'error');
    } finally {
        hideLoading('productsLoading');
    }
}

function displayProducts(products) {
    elements.productsGrid.innerHTML = '';
    
    products.forEach(product => {
        const productCard = createProductCard(product);
        elements.productsGrid.appendChild(productCard);
    });
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.onclick = () => showProductDetails(product.id);
    
    const stars = '★'.repeat(Math.floor(product.rating)) + '☆'.repeat(5 - Math.floor(product.rating));
    
    card.innerHTML = `
        <div class="product-image">
            <i class="fas fa-image"></i>
        </div>
        <div class="product-info">
            <h3 class="product-title">${product.name}</h3>
            <div class="product-price">
                <span class="current-price">$${product.price}</span>
                ${product.originalPrice ? `<span class="original-price">$${product.originalPrice}</span>` : ''}
            </div>
            <div class="product-rating">
                <span class="stars">${stars}</span>
                <span class="rating-text">${product.rating} (${product.reviewCount} reviews)</span>
            </div>
            <div class="product-actions">
                <button class="btn-primary btn-small" onclick="event.stopPropagation(); addToCart(${product.id})">
                    Add to Cart
                </button>
                <button class="btn-secondary btn-small" onclick="event.stopPropagation(); showProductDetails(${product.id})">
                    Details
                </button>
            </div>
        </div>
    `;
    
    return card;
}

async function showProductDetails(productId) {
    try {
        const response = await fetch(`/api/products/${productId}`);
        const data = await response.json();
        
        if (response.ok) {
            displayProductModal(data.product, data.relatedProducts);
        } else {
            showNotification('Failed to load product details', 'error');
        }
    } catch (error) {
        console.error('Product details error:', error);
        showNotification('Failed to load product details', 'error');
    }
}

function displayProductModal(product, relatedProducts) {
    elements.productModalTitle.textContent = product.name;
    
    const stars = '★'.repeat(Math.floor(product.rating)) + '☆'.repeat(5 - Math.floor(product.rating));
    
    elements.productModalBody.innerHTML = `
        <div class="product-details">
            <div class="product-main">
                <div class="product-image-large">
                    <i class="fas fa-image" style="font-size: 4rem; color: #94a3b8;"></i>
                </div>
                <div class="product-info-detailed">
                    <h2>${product.name}</h2>
                    <div class="product-price">
                        <span class="current-price">$${product.price}</span>
                        ${product.originalPrice ? `<span class="original-price">$${product.originalPrice}</span>` : ''}
                    </div>
                    <div class="product-rating">
                        <span class="stars">${stars}</span>
                        <span class="rating-text">${product.rating} (${product.reviewCount} reviews)</span>
                    </div>
                    <p class="product-description">${product.description}</p>
                    <div class="product-features">
                        <h4>Features:</h4>
                        <ul>
                            ${product.features.map(feature => `<li>${feature}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="product-actions">
                        <button class="btn-primary btn-large" onclick="addToCart(${product.id})">
                            Add to Cart - $${product.price}
                        </button>
                    </div>
                </div>
            </div>
            ${relatedProducts.length > 0 ? `
                <div class="related-products">
                    <h3>Related Products</h3>
                    <div class="related-grid">
                        ${relatedProducts.map(p => `
                            <div class="related-item" onclick="showProductDetails(${p.id})">
                                <div class="related-image">
                                    <i class="fas fa-image"></i>
                                </div>
                                <h4>${p.name}</h4>
                                <span class="price">$${p.price}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
    
    elements.productModal.classList.add('active');
}

function filterProducts() {
    loadProducts();
}

// Cart functionality
function addToCart(productId) {
    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ productId, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
    showNotification('Product added to cart!', 'success');
}

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    elements.cartCount.textContent = totalItems;
    elements.cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
}

function showCart() {
    // This would show a cart modal or navigate to cart page
    showNotification('Cart functionality would be implemented here', 'info');
}

// Orders
async function loadOrders() {
    if (!currentUser) {
        elements.ordersList.innerHTML = '<p>Please log in to view your orders.</p>';
        return;
    }
    
    try {
        const response = await fetch(`/api/orders/user/${currentUser.id}`);
        const data = await response.json();
        
        if (response.ok) {
            displayOrders(data.orders);
        } else {
            showNotification('Failed to load orders', 'error');
        }
    } catch (error) {
        console.error('Orders load error:', error);
        showNotification('Failed to load orders', 'error');
    }
}

function displayOrders(orders) {
    if (orders.length === 0) {
        elements.ordersList.innerHTML = '<p>No orders found.</p>';
        return;
    }
    
    elements.ordersList.innerHTML = '';
    
    orders.forEach(order => {
        const orderCard = createOrderCard(order);
        elements.ordersList.appendChild(orderCard);
    });
}

function createOrderCard(order) {
    const card = document.createElement('div');
    card.className = 'order-card';
    
    card.innerHTML = `
        <div class="order-header">
            <span class="order-id">Order #${order.id}</span>
            <span class="order-status ${order.status}">${order.status.toUpperCase()}</span>
        </div>
        <div class="order-details">
            <p><strong>Total:</strong> $${order.total}</p>
            <p><strong>Date:</strong> ${new Date(order.orderDate).toLocaleDateString()}</p>
            <p><strong>Items:</strong> ${order.products.length} item(s)</p>
            ${order.trackingNumber ? `<p><strong>Tracking:</strong> ${order.trackingNumber}</p>` : ''}
        </div>
        <div class="order-actions">
            <button class="btn-primary btn-small" onclick="trackOrder(${order.id})">
                Track Order
            </button>
        </div>
    `;
    
    return card;
}

async function trackOrder(orderId) {
    try {
        const response = await fetch(`/api/orders/${orderId}/track`);
        const data = await response.json();
        
        if (response.ok) {
            showTrackingModal(data);
        } else {
            showNotification('Failed to load tracking information', 'error');
        }
    } catch (error) {
        console.error('Tracking error:', error);
        showNotification('Failed to load tracking information', 'error');
    }
}

function showTrackingModal(trackingData) {
    // This would show a tracking modal with timeline
    showNotification(`Order status: ${trackingData.status}`, 'info');
}

// Profile
async function loadProfile() {
    if (!currentUser) {
        elements.profileCard.innerHTML = '<p>Please log in to view your profile.</p>';
        elements.preferencesForm.innerHTML = '';
        return;
    }
    
    displayProfile();
    loadPreferences();
}

function displayProfile() {
    elements.profileCard.innerHTML = `
        <div class="profile-info">
            <h3>${currentUser.name}</h3>
            <p><strong>Email:</strong> ${currentUser.email}</p>
            <p><strong>Member since:</strong> January 2024</p>
        </div>
    `;
}

function loadPreferences() {
    elements.preferencesForm.innerHTML = `
        <div class="form-group">
            <label>Preferred Categories</label>
            <div class="checkbox-group">
                <label><input type="checkbox" value="Electronics"> Electronics</label>
                <label><input type="checkbox" value="Sports"> Sports</label>
                <label><input type="checkbox" value="Home"> Home</label>
                <label><input type="checkbox" value="Fashion"> Fashion</label>
                <label><input type="checkbox" value="Books"> Books</label>
            </div>
        </div>
        <div class="form-group">
            <label>Price Range</label>
            <div class="price-range">
                <input type="range" id="minPrice" min="0" max="1000" value="0">
                <input type="range" id="maxPrice" min="0" max="1000" value="1000">
                <div class="price-display">
                    <span>$<span id="minPriceDisplay">0</span></span> - 
                    <span>$<span id="maxPriceDisplay">1000</span></span>
                </div>
            </div>
        </div>
        <button class="btn-primary" onclick="savePreferences()">Save Preferences</button>
    `;
    
    // Set current preferences
    if (currentUser.preferences) {
        currentUser.preferences.categories.forEach(category => {
            const checkbox = elements.preferencesForm.querySelector(`input[value="${category}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }
}

function savePreferences() {
    // This would save preferences to the server
    showNotification('Preferences saved!', 'success');
}

async function loadUserData() {
    // Load user-specific data like recommendations
    try {
        const response = await fetch('/api/ai/recommendations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: currentUser.id,
                category: currentUser.preferences?.categories?.[0],
                priceRange: currentUser.preferences?.priceRange
            }),
        });

        const data = await response.json();
        
        if (response.ok) {
            // Display recommendations somewhere in the UI
            console.log('User recommendations:', data.recommendations);
        }
    } catch (error) {
        console.error('Failed to load user recommendations:', error);
    }
}

// Utility functions
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) element.style.display = 'block';
}

function hideLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) element.style.display = 'none';
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    
    // Add styles if not already added
    if (!document.getElementById('notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 100px;
                right: 20px;
                padding: 1rem 1.5rem;
                border-radius: 0.5rem;
                color: white;
                z-index: 3000;
                display: flex;
                align-items: center;
                gap: 1rem;
                animation: slideIn 0.3s ease-out;
                max-width: 400px;
            }
            .notification-success { background: #10b981; }
            .notification-error { background: #ef4444; }
            .notification-info { background: #3b82f6; }
            .notification button {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                font-size: 1.2rem;
                padding: 0;
            }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Add some additional styles for the product modal
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    .product-details {
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }
    
    .product-main {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
        align-items: start;
    }
    
    .product-image-large {
        background: #f1f5f9;
        border-radius: 1rem;
        height: 300px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .product-info-detailed h2 {
        margin-bottom: 1rem;
        color: #1e293b;
    }
    
    .product-description {
        margin: 1rem 0;
        color: #64748b;
        line-height: 1.6;
    }
    
    .product-features ul {
        list-style: none;
        padding: 0;
    }
    
    .product-features li {
        padding: 0.5rem 0;
        border-bottom: 1px solid #e2e8f0;
    }
    
    .product-features li:before {
        content: "✓";
        color: #10b981;
        font-weight: bold;
        margin-right: 0.5rem;
    }
    
    .related-products {
        border-top: 1px solid #e2e8f0;
        padding-top: 2rem;
    }
    
    .related-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
    }
    
    .related-item {
        text-align: center;
        padding: 1rem;
        border: 1px solid #e2e8f0;
        border-radius: 0.5rem;
        cursor: pointer;
        transition: all 0.3s;
    }
    
    .related-item:hover {
        border-color: #3b82f6;
        transform: translateY(-2px);
    }
    
    .related-image {
        height: 80px;
        background: #f1f5f9;
        border-radius: 0.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 0.5rem;
        color: #94a3b8;
    }
    
    .related-item h4 {
        font-size: 0.9rem;
        margin: 0.5rem 0;
        color: #1e293b;
    }
    
    .related-item .price {
        color: #3b82f6;
        font-weight: 600;
    }
    
    .checkbox-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .checkbox-group label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
    }
    
    .price-range {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .price-display {
        text-align: center;
        font-weight: 500;
        color: #3b82f6;
    }
    
    @media (max-width: 768px) {
        .product-main {
            grid-template-columns: 1fr;
        }
        
        .related-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }
`;
document.head.appendChild(additionalStyles);