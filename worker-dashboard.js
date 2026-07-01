// Worker Dashboard Logic
let currentUser = null;
let tenant = null;
let cart = [];

// Check authentication
function checkAuth() {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
        window.location.href = 'auth.html?mode=login';
        return;
    }
    
    currentUser = JSON.parse(userStr);
    
    if (currentUser.role !== 'worker') {
        window.location.href = 'dashboard.html';
        return;
    }
    
    // Get tenant data
    tenant = db.getTenantById(currentUser.tenantId);
    
    // Update UI
    document.getElementById('tenantName').textContent = tenant ? tenant.name : 'Unknown';
    document.getElementById('userName').textContent = currentUser.name;
    
    // Load products
    loadProducts();
}

// Logout
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Load products
function loadProducts() {
    const products = db.getProductsByTenant(currentUser.tenantId);
    const grid = document.getElementById('productsGrid');
    
    if (products.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center py-12 text-gray-500">No products available. Contact your manager to add products.</div>';
        return;
    }
    
    grid.innerHTML = products.map(product => `
        <div onclick="addToCart('${product.id}')" class="bg-white rounded-xl shadow-sm p-4 cursor-pointer transition-all hover:shadow-md ${product.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}">
            <div class="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            </div>
            <h3 class="font-semibold text-gray-900 mb-1">${product.name}</h3>
            <p class="text-lg font-bold text-indigo-600">$${product.price.toFixed(2)}</p>
            <p class="text-sm ${product.stock <= 0 ? 'text-red-600' : 'text-gray-500'}">
                ${product.stock <= 0 ? 'Out of stock' : product.stock + ' in stock'}
            </p>
        </div>
    `).join('');
}

// Cart functions
function addToCart(productId) {
    const product = db.getProductById(productId);
    if (!product || product.stock <= 0) return;
    
    const existingItem = cart.find(item => item.productId === productId);
    if (existingItem) {
        if (existingItem.quantity < product.stock) {
            existingItem.quantity++;
            existingItem.total = existingItem.quantity * existingItem.price;
        }
    } else {
        cart.push({
            productId: product.id,
            productName: product.name,
            price: product.price,
            quantity: 1,
            total: product.price
        });
    }
    
    updateCartUI();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.productId !== productId);
    updateCartUI();
}

function updateQuantity(productId, quantity) {
    const product = db.getProductById(productId);
    if (!product) return;
    
    if (quantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    if (quantity > product.stock) {
        quantity = product.stock;
    }
    
    const item = cart.find(item => item.productId === productId);
    if (item) {
        item.quantity = quantity;
        item.total = quantity * item.price;
    }
    
    updateCartUI();
}

function updateCartUI() {
    const cartDiv = document.getElementById('cartItems');
    const totalDiv = document.getElementById('cartTotal');
    
    if (cart.length === 0) {
        cartDiv.innerHTML = '<div class="text-center py-8 text-gray-500">Cart is empty</div>';
        totalDiv.classList.add('hidden');
        return;
    }
    
    cartDiv.innerHTML = cart.map(item => `
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex-1">
                <p class="font-medium text-gray-900">${item.productName}</p>
                <p class="text-sm text-gray-500">$${item.price.toFixed(2)} each</p>
            </div>
            <div class="flex items-center space-x-2">
                <button onclick="updateQuantity('${item.productId}', ${item.quantity - 1})" class="w-8 h-8 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors">-</button>
                <span class="w-8 text-center font-medium">${item.quantity}</span>
                <button onclick="updateQuantity('${item.productId}', ${item.quantity + 1})" class="w-8 h-8 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors">+</button>
            </div>
            <p class="font-bold text-gray-900 ml-4">$${item.total.toFixed(2)}</p>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + item.total, 0);
    document.getElementById('totalAmount').textContent = '$' + total.toFixed(2);
    totalDiv.classList.remove('hidden');
}

function clearCart() {
    cart = [];
    updateCartUI();
}

function checkout(paymentMethod) {
    if (cart.length === 0) return;
    
    const sale = {
        tenantId: currentUser.tenantId,
        workerId: currentUser.id,
        items: cart,
        total: cart.reduce((sum, item) => sum + item.total, 0),
        paymentMethod: paymentMethod
    };
    
    db.createSale(sale);
    
    // Update product stock
    cart.forEach(item => {
        const product = db.getProductById(item.productId);
        if (product) {
            db.updateProduct(item.productId, {
                stock: Math.max(0, product.stock - item.quantity)
            });
        }
    });
    
    cart = [];
    updateCartUI();
    loadProducts();
    alert('Sale completed successfully!');
}

// Initialize
checkAuth();
