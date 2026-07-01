// Manager Dashboard Logic
let currentUser = null;
let tenant = null;
let salesChartInstance = null;
let productsChartInstance = null;

// Check authentication
function checkAuth() {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
        window.location.href = 'auth.html?mode=login';
        return;
    }

    currentUser = JSON.parse(userStr);

    if (currentUser.role !== 'manager') {
        window.location.href = 'worker-dashboard.html';
        return;
    }

    // Get tenant data
    tenant = db.getTenantById(currentUser.tenantId);

    // Update UI
    document.getElementById('tenantName').textContent = tenant ? tenant.name : 'Unknown';
    document.getElementById('userName').textContent = currentUser.name;

    // Load all data (free version)
    loadOverviewData();
    loadProducts();
    loadSales();
    loadEmployees();
    loadInvitations();
    loadCustomers();
}

// Check subscription status (disabled for free version)
// function checkSubscriptionStatus() {
//     const subscription = db.getSubscription(currentUser.tenantId);
//     const subscriptionStatus = document.getElementById('subscriptionStatus');

//     if (!subscription) {
//         // Check for recent payments
//         const paymentCheck = db.checkPaymentStatus(currentUser.tenantId);
//         if (paymentCheck.success) {
//             showNotification('Subscription activated successfully!', 'success');
//             checkSubscriptionStatus();
//         } else {
//             subscriptionStatus.innerHTML = `
//                 <div class="bg-red-50 border border-red-200 rounded-lg p-4">
//                     <div class="flex items-center justify-between">
//                         <div class="flex items-center">
//                             <span class="text-2xl mr-3">🔒</span>
//                             <div>
//                                 <p class="font-semibold text-red-800">Subscription Required</p>
//                                 <p class="text-sm text-red-700">Please complete your payment to activate your marketplace</p>
//                             </div>
//                         </div>
//                         <button onclick="showPaymentInstructions()" class="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">Payment Info</button>
//                     </div>
//                 </div>
//             `;
//             // Disable all tabs
//             disableAllTabs();
//         }
//     } else if (subscription.status === 'pending') {
//         subscriptionStatus.innerHTML = `
//             <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
//                 <div class="flex items-center justify-between">
//                     <div class="flex items-center">
//                         <span class="text-2xl mr-3">⏳</span>
//                         <div>
//                             <p class="font-semibold text-yellow-800">Subscription Pending</p>
//                             <p class="text-sm text-yellow-700">Waiting for payment verification</p>
//                         </div>
//                     </div>
//                     <button onclick="showPaymentInstructions()" class="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700">Payment Info</button>
//                 </div>
//             </div>
//         `;
//         disableAllTabs();
//     } else if (subscription.status === 'active') {
//         const daysLeft = Math.ceil((new Date(subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24));
//         subscriptionStatus.innerHTML = `
//             <div class="bg-green-50 border border-green-200 rounded-lg p-4">
//                 <div class="flex items-center justify-between">
//                     <div class="flex items-center">
//                         <span class="text-2xl mr-3">✅</span>
//                         <div>
//                             <p class="font-semibold text-green-800">${subscription.planName} Plan Active</p>
//                             <p class="text-sm text-green-700">${daysLeft} days remaining</p>
//                         </div>
//                     </div>
//                     <button onclick="showSubscriptionDetails()" class="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">View Details</button>
//                 </div>
//             </div>
//         `;
//         enableAllTabs();
//     }
// }

// Tab control functions (disabled for free version)
// function disableAllTabs() {
//     document.querySelectorAll('.tab-btn').forEach(btn => {
//         btn.disabled = true;
//         btn.classList.add('opacity-50', 'cursor-not-allowed');
//     });
// }

// function enableAllTabs() {
//     document.querySelectorAll('.tab-btn').forEach(btn => {
//         btn.disabled = false;
//         btn.classList.remove('opacity-50', 'cursor-not-allowed');
//     });
// }

// Payment functions (disabled for free version)
// function showPaymentInstructions() {
//     const payments = db.getPaymentHistory(currentUser.tenantId);
//     const latestPayment = payments.length > 0 ? payments[payments.length - 1] : null;

//     const amount = latestPayment ? latestPayment.amount : 42000;
//     alert(`Payment Instructions\n\nPlease send ${amount} XAF via Mobile Money to:\n\n📱 +237 683 134 568\n\nPayment Methods:\n- Orange Money: #150*1*1#\n- MTN Mobile Money: *126#\n\nYour subscription will be activated automatically after admin verifies your payment.\n\nThis usually takes 1-2 hours during business hours.`);
// }

// function showSubscriptionDetails() {
//     const details = db.getSubscriptionDetails(currentUser.tenantId);
//     const subscription = details.subscription;

//     alert(`Subscription Details\n\nPlan: ${subscription.planName}\nAmount: ${subscription.amount} XAF/month\nStatus: ${subscription.status}\nStart Date: ${new Date(subscription.startDate).toLocaleDateString()}\nEnd Date: ${new Date(subscription.endDate).toLocaleDateString()}\nDays Remaining: ${details.daysUntilRenewal}\nTotal Paid: ${details.totalPaid} XAF\n\nPayment Method: ${subscription.paymentMethod}\nMobile Number: ${subscription.mobileNumber}`);
// }

// Load subscription status in settings (disabled for free version)
// function loadSubscriptionStatus() {
//     const details = db.getSubscriptionDetails(currentUser.tenantId);
//     const subscription = details.subscription;

//     if (subscription) {
//         document.getElementById('currentPlanName').textContent = subscription.planName;
//         document.getElementById('currentPlanStatus').textContent = subscription.status;
//     }
// }

// Upgrade functions (disabled for free version)
// function showUpgradeForm() {
//     const subscription = db.getSubscription(currentUser.tenantId);
//     if (!subscription) {
//         alert('No active subscription found.');
//         return;
//     }

//     const upgradeSelect = document.getElementById('upgradePlanSelect');
//     upgradeSelect.innerHTML = '<option value="">Choose a plan...</option>';

//     // Show available upgrade options based on current plan
//     if (subscription.plan === 'starter') {
//         upgradeSelect.innerHTML += '<option value="professional">Professional - 42,000 XAF/month</option>';
//         upgradeSelect.innerHTML += '<option value="enterprise">Enterprise - Custom (Contact Us)</option>';
//     } else if (subscription.plan === 'professional') {
//         upgradeSelect.innerHTML += '<option value="enterprise">Enterprise - Custom (Contact Us)</option>';
//     }

//     document.getElementById('upgradeForm').classList.remove('hidden');
// }

// function hideUpgradeForm() {
//     document.getElementById('upgradeForm').classList.add('hidden');
//     document.getElementById('upgradePlanSelect').value = '';
//     document.getElementById('upgradePaymentSection').classList.add('hidden');
// }

// Handle plan selection change (disabled for free version)
// document.addEventListener('DOMContentLoaded', function() {
//     const upgradeSelect = document.getElementById('upgradePlanSelect');
//     if (upgradeSelect) {
//         upgradeSelect.addEventListener('change', function() {
//             const paymentSection = document.getElementById('upgradePaymentSection');
//             if (this.value === 'enterprise') {
//                 paymentSection.classList.add('hidden');
//                 alert('For Enterprise plan, please contact us at +237 683 134 568 for custom pricing.');
//             } else if (this.value) {
//                 paymentSection.classList.remove('hidden');
//             } else {
//                 paymentSection.classList.add('hidden');
//             }
//         });
//     }
// });

// Process upgrade (disabled for free version)
// function processUpgrade() {
//     const newPlan = document.getElementById('upgradePlanSelect').value;
//     const mobileNumber = document.getElementById('upgradeMobileNumber').value;

//     if (!newPlan) {
//         alert('Please select a plan to upgrade to.');
//         return;
//     }

//     if (newPlan === 'enterprise') {
//         alert('For Enterprise plan, please contact us at +237 683 134 568 for custom pricing.\n\nYour subscription will be manually activated after agreement.');
//         // Create pending enterprise subscription
//         db.upgradePlan(currentUser.tenantId, 'enterprise');
//         hideUpgradeForm();
//         checkSubscriptionStatus();
//         return;
//     }

//     if (newPlan === 'professional') {
//         const amount = 42000;
//         db.createPayment(currentUser.tenantId, amount, 'mobile_money', mobileNumber);
        
//         alert(`Upgrade to Professional plan initiated!\n\nPlease send 42,000 XAF via Mobile Money to:\n\n📱 +237 683 134 568\n\nPayment Methods:\n- Orange Money: #150*1*1#\n- MTN Mobile Money: *126#\n\nYour subscription will be upgraded automatically after admin verifies your payment.`);
//         hideUpgradeForm();
//         return;
//     }

//     hideUpgradeForm();
// }

// Logout
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Quick search
document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        showQuickSearch();
    }
    if (e.key === 'Escape') {
        hideQuickSearch();
    }
});

function showQuickSearch() {
    document.getElementById('searchModal').classList.remove('hidden');
    document.getElementById('quickSearchInput').focus();
}

function hideQuickSearch() {
    document.getElementById('searchModal').classList.add('hidden');
    document.getElementById('quickSearchInput').value = '';
    document.getElementById('searchResults').innerHTML = '';
}

function showNotification(message, type = 'info') {
    showToast(message, type);
}

function maybeShowLowStockNotification(lowStockProducts) {
    const settings = db.getSettings(currentUser.tenantId);
    if (!settings.notifications || !settings.notifications.lowStock) return;
    if (lowStockProducts.length === 0) return;

    const firstProduct = lowStockProducts[0];
    showNotification(`Low stock alert: ${firstProduct.name} has only ${firstProduct.stock} units left.`, 'warning');
}

document.getElementById('quickSearchInput').addEventListener('input', function(e) {
    const query = e.target.value.toLowerCase();
    if (query.length < 2) {
        document.getElementById('searchResults').innerHTML = '';
        return;
    }
    
    const results = [];
    
    // Search products
    const products = db.getProductsByTenant(currentUser.tenantId);
    products.forEach(p => {
        if (p.name.toLowerCase().includes(query) || p.sku?.toLowerCase().includes(query)) {
            results.push({ type: 'Product', name: p.name, details: p.sku || 'No SKU', id: p.id });
        }
    });
    
    // Search customers
    const customers = db.getCustomersByTenant(currentUser.tenantId);
    customers.forEach(c => {
        if (c.name.toLowerCase().includes(query) || c.email?.toLowerCase().includes(query)) {
            results.push({ type: 'Customer', name: c.name, details: c.email || 'No email', id: c.id });
        }
    });
    
    // Search sales
    const sales = db.getSalesByTenant(currentUser.tenantId);
    sales.forEach(s => {
        if (s.id.toLowerCase().includes(query)) {
            results.push({ type: 'Sale', name: 'Sale #' + s.id.slice(0, 8), details: new Date(s.date).toLocaleDateString(), id: s.id });
        }
    });
    
    const resultsHtml = results.slice(0, 10).map(r => `
        <div class="p-3 hover:bg-gray-50 cursor-pointer rounded-lg" onclick="handleSearchResult('${r.type}', '${r.id}')">
            <div class="flex items-center justify-between">
                <div>
                    <span class="text-xs font-medium text-indigo-600">${r.type}</span>
                    <p class="font-medium text-gray-900">${r.name}</p>
                </div>
                <span class="text-sm text-gray-500">${r.details}</span>
            </div>
        </div>
    `).join('');
    
    document.getElementById('searchResults').innerHTML = resultsHtml || '<p class="text-gray-500 text-center">No results found</p>';
});

function handleSearchResult(type, id) {
    hideQuickSearch();
    if (type === 'Product') {
        showTab('inventory');
        // Could highlight the product
    } else if (type === 'Customer') {
        showTab('customers');
    } else if (type === 'Sale') {
        showTab('sales');
    }
}

// Barcode/QR Code Generation
function generateBarcodes() {
    const products = db.getProductsByTenant(currentUser.tenantId);
    if (products.length === 0) {
        alert('No products found. Add products first.');
        return;
    }
    
    const barcodeWindow = window.open('', '_blank', 'width=800,height=600');
    barcodeWindow.document.write(`
        <html>
        <head>
            <title>Product Barcodes - Askia</title>
            <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.0/dist/JsBarcode.all.min.js"></script>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .barcode-item { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
                .barcode-item h3 { margin: 0 0 10px 0; }
                @media print { .no-print { display: none; } }
            </style>
        </head>
        <body>
            <h1>Product Barcodes</h1>
            <button class="no-print" onclick="window.print()" style="padding: 10px 20px; background: #6366f1; color: white; border: none; border-radius: 5px; cursor: pointer;">Print Barcodes</button>
            ${products.map(p => `
                <div class="barcode-item">
                    <h3>${p.name}</h3>
                    <p>SKU: ${p.sku || 'N/A'}</p>
                    <p>Price: ${p.price} XAF</p>
                    <svg id="barcode-${p.id}"></svg>
                </div>
            `).join('')}
            <script>
                ${products.map(p => `
                    JsBarcode("#barcode-${p.id}", "${p.sku || p.id}", {
                        format: "CODE128",
                        width: 2,
                        height: 80,
                        displayValue: true
                    });
                `).join('')}
            </script>
        </body>
        </html>
    `);
}

function generateQRCode(productId) {
    const product = db.getProductById(productId);
    if (!product) return;
    
    const qrWindow = window.open('', '_blank', 'width=400,height=500');
    qrWindow.document.write(`
        <html>
        <head>
            <title>QR Code - ${product.name}</title>
            <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js"></script>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; text-align: center; }
                #qrcode { margin: 20px auto; }
            </style>
        </head>
        <body>
            <h1>${product.name}</h1>
            <p>SKU: ${product.sku || 'N/A'}</p>
            <p>Price: ${product.price} XAF</p>
            <div id="qrcode"></div>
            <script>
                QRCode.toCanvas(document.getElementById('qrcode'), '${product.id}', { width: 256 });
            </script>
        </body>
        </html>
    `);
}

// Tab navigation
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // Show selected tab
    document.getElementById(tabName + 'Tab').classList.remove('hidden');
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('border-indigo-500', 'text-indigo-600');
        btn.classList.add('border-transparent', 'text-gray-500');
    });
    
    const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
    activeBtn.classList.remove('border-transparent', 'text-gray-500');
    activeBtn.classList.add('border-indigo-500', 'text-indigo-600');
    
    // Refresh data for the tab
    if (tabName === 'overview') loadOverviewData();
    if (tabName === 'analytics') loadAnalytics();
    if (tabName === 'inventory') {
        loadProducts();
        checkInventoryAlerts();
    }
    if (tabName === 'sales') loadSales();
    if (tabName === 'locations') loadLocations();
    if (tabName === 'employees') loadEmployees();
    if (tabName === 'invitations') loadInvitations();
    if (tabName === 'customers') loadCustomers();
    if (tabName === 'suppliers') loadSuppliers();
    if (tabName === 'purchaseOrders') loadPurchaseOrders();
    if (tabName === 'coupons') loadCoupons();
    if (tabName === 'taxRates') loadTaxRates();
    if (tabName === 'shifts') loadShifts();
    if (tabName === 'kitchen') loadKitchenOrders();
    if (tabName === 'loyalty') loadLoyaltyTiers();
    if (tabName === 'settings') {
        loadSettings();
        loadSubscriptionStatus();
    }
    if (tabName === 'reports') loadReports();
}

// Load overview data
function loadOverviewData() {
    const products = db.getProductsByTenant(currentUser.tenantId);
    const sales = db.getSalesByTenant(currentUser.tenantId);
    const employees = db.getEmployeesByTenant(currentUser.tenantId);
    const customers = db.getCustomersByTenant(currentUser.tenantId);
    
    const totalSalesAmount = sales.reduce((sum, sale) => sum + sale.total, 0);
    
    document.getElementById('totalSales').textContent = totalSalesAmount.toLocaleString() + ' XAF';
    document.getElementById('totalProducts').textContent = products.length;
    document.getElementById('totalEmployees').textContent = employees.length;
    document.getElementById('totalCustomers').textContent = customers.length;
    
    // Load charts
    loadSalesChart(sales);
    loadProductsChart(sales, products);

    // Notification alerts
    const lowStockProducts = db.getLowStockProducts(currentUser.tenantId, 5);
    maybeShowLowStockNotification(lowStockProducts);
}

function loadSalesChart(sales) {
    const ctx = document.getElementById('salesChart').getContext('2d');
    if (salesChartInstance) {
        salesChartInstance.destroy();
    }
    
    // Get last 7 days data
    const last7Days = [];
    const salesData = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        last7Days.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        
        const daySales = sales.filter(s => s.date.startsWith(dateStr));
        salesData.push(daySales.reduce((sum, s) => sum + s.total, 0));
    }
    
    salesChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: last7Days,
            datasets: [{
                label: 'Sales (XAF)',
                data: salesData,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

function loadProductsChart(sales, products) {
    const ctx = document.getElementById('productsChart').getContext('2d');
    if (productsChartInstance) {
        productsChartInstance.destroy();
    }
    
    // Calculate product sales
    const productSales = {};
    sales.forEach(sale => {
        sale.items.forEach(item => {
            productSales[item.productId] = (productSales[item.productId] || 0) + item.quantity;
        });
    });
    
    // Get top 5 products
    const sortedProducts = Object.entries(productSales)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    const labels = sortedProducts.map(([id]) => {
        const product = products.find(p => p.id === id);
        return product ? product.name : 'Unknown';
    });
    const data = sortedProducts.map(([, qty]) => qty);
    
    productsChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Quantity Sold',
                data: data,
                backgroundColor: ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// Product management
function showAddProductForm() {
    document.getElementById('addProductForm').classList.remove('hidden');
}

function hideAddProductForm() {
    document.getElementById('addProductForm').classList.add('hidden');
    document.getElementById('productForm').reset();
}

function checkInventoryAlerts() {
    const products = db.getProductsByTenant(currentUser.tenantId);
    const lowStockProducts = [];
    const expiringProducts = [];
    
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    products.forEach(product => {
        // Check low stock
        if (product.lowStockAlert && product.stock <= product.lowStockAlert) {
            lowStockProducts.push(product);
        }
        
        // Check expiry
        if (product.expiryDate) {
            const expiryDate = new Date(product.expiryDate);
            if (expiryDate <= thirtyDaysFromNow) {
                expiringProducts.push(product);
            }
        }
    });
    
    // Show low stock alerts
    const lowStockAlertsDiv = document.getElementById('lowStockAlerts');
    if (lowStockProducts.length > 0) {
        lowStockAlertsDiv.classList.remove('hidden');
        document.getElementById('lowStockList').innerHTML = lowStockProducts.map(p => `
            <div class="flex items-center justify-between py-2 border-b border-red-200 last:border-0">
                <span class="text-red-800">${p.name}</span>
                <span class="text-red-600 font-semibold">${p.stock} left (Alert: ${p.lowStockAlert})</span>
            </div>
        `).join('');
    } else {
        lowStockAlertsDiv.classList.add('hidden');
    }
    
    // Show expiry alerts
    const expiryAlertsDiv = document.getElementById('expiryAlerts');
    if (expiringProducts.length > 0) {
        expiryAlertsDiv.classList.remove('hidden');
        document.getElementById('expiryList').innerHTML = expiringProducts.map(p => {
            const expiryDate = new Date(p.expiryDate);
            const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
            const isExpired = daysLeft < 0;
            return `
                <div class="flex items-center justify-between py-2 border-b border-yellow-200 last:border-0">
                    <span class="text-yellow-800">${p.name}</span>
                    <span class="${isExpired ? 'text-red-600' : 'text-yellow-600'} font-semibold">${isExpired ? 'Expired' : daysLeft + ' days left'}</span>
                </div>
            `;
        }).join('');
    } else {
        expiryAlertsDiv.classList.add('hidden');
    }
}

function loadProducts() {
    const products = db.getProductsByTenant(currentUser.tenantId);
    const tbody = document.getElementById('productsTableBody');
    
    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-12 text-center text-gray-500">No products yet. Add your first product to get started.</td></tr>';
        return;
    }
    
    tbody.innerHTML = products.map(product => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${product.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$${product.price.toFixed(2)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.stock}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.sku || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <button onclick="deleteProduct('${product.id}')" class="text-red-600 hover:text-red-900">Delete</button>
            </td>
        </tr>
    `).join('');
}

document.getElementById('productForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const product = {
        tenantId: currentUser.tenantId,
        name: document.getElementById('productName').value,
        description: document.getElementById('productDescription').value,
        price: parseFloat(document.getElementById('productPrice').value),
        stock: parseInt(document.getElementById('productStock').value),
        sku: document.getElementById('productSku').value,
        lowStockAlert: parseInt(document.getElementById('productLowStock').value) || null,
        expiryDate: document.getElementById('productExpiry').value || null,
        barcode: document.getElementById('productBarcode').value
    };
    
    db.createProduct(product);
    hideAddProductForm();
    loadProducts();
    checkInventoryAlerts();
    loadOverviewData();
});

function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        db.deleteProduct(productId);
        loadProducts();
        loadOverviewData();
    }
}

// Reports
function loadReports() {
    document.getElementById('reportContent').classList.add('hidden');
}

function generateDailySalesReport() {
    const sales = db.getSalesByTenant(currentUser.tenantId);
    const today = new Date().toISOString().split('T')[0];
    const todaySales = sales.filter(s => s.date.startsWith(today));
    
    const totalSales = todaySales.reduce((sum, s) => sum + s.total, 0);
    const totalItems = todaySales.reduce((sum, s) => sum + s.items.length, 0);
    
    document.getElementById('reportTitle').textContent = 'Daily Sales Report - ' + new Date().toLocaleDateString();
    document.getElementById('reportData').innerHTML = `
        <div class="grid grid-cols-3 gap-4 mb-6">
            <div class="bg-indigo-50 p-4 rounded-lg">
                <p class="text-sm text-gray-600">Total Sales</p>
                <p class="text-2xl font-bold text-indigo-600">${totalSales.toLocaleString()} XAF</p>
            </div>
            <div class="bg-green-50 p-4 rounded-lg">
                <p class="text-sm text-gray-600">Transactions</p>
                <p class="text-2xl font-bold text-green-600">${todaySales.length}</p>
            </div>
            <div class="bg-purple-50 p-4 rounded-lg">
                <p class="text-sm text-gray-600">Items Sold</p>
                <p class="text-2xl font-bold text-purple-600">${totalItems}</p>
            </div>
        </div>
        <table class="w-full">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-4 py-2 text-left text-sm font-medium text-gray-500">Time</th>
                    <th class="px-4 py-2 text-left text-sm font-medium text-gray-500">Sale ID</th>
                    <th class="px-4 py-2 text-left text-sm font-medium text-gray-500">Items</th>
                    <th class="px-4 py-2 text-left text-sm font-medium text-gray-500">Total</th>
                </tr>
            </thead>
            <tbody>
                ${todaySales.map(s => `
                    <tr class="border-b">
                        <td class="px-4 py-2 text-sm">${new Date(s.date).toLocaleTimeString()}</td>
                        <td class="px-4 py-2 text-sm font-mono">${s.id.slice(0, 8)}</td>
                        <td class="px-4 py-2 text-sm">${s.items.length}</td>
                        <td class="px-4 py-2 text-sm font-semibold">${s.total.toLocaleString()} XAF</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    document.getElementById('reportContent').classList.remove('hidden');
}

function generateTaxReport() {
    const sales = db.getSalesByTenant(currentUser.tenantId);
    const today = new Date().toISOString().split('T')[0];
    const todaySales = sales.filter(s => s.date.startsWith(today));
    
    const totalSales = todaySales.reduce((sum, s) => sum + s.total, 0);
    const taxRate = 0.19; // 19% VAT
    const taxAmount = totalSales * taxRate;
    const netSales = totalSales - taxAmount;
    
    document.getElementById('reportTitle').textContent = 'Tax Report - ' + new Date().toLocaleDateString();
    document.getElementById('reportData').innerHTML = `
        <div class="space-y-4">
            <div class="flex justify-between p-4 bg-gray-50 rounded-lg">
                <span class="text-gray-600">Gross Sales</span>
                <span class="font-semibold">${totalSales.toLocaleString()} XAF</span>
            </div>
            <div class="flex justify-between p-4 bg-red-50 rounded-lg">
                <span class="text-gray-600">VAT (19%)</span>
                <span class="font-semibold text-red-600">-${taxAmount.toLocaleString()} XAF</span>
            </div>
            <div class="flex justify-between p-4 bg-green-50 rounded-lg">
                <span class="text-gray-600">Net Sales</span>
                <span class="font-semibold text-green-600">${netSales.toLocaleString()} XAF</span>
            </div>
        </div>
    `;
    document.getElementById('reportContent').classList.remove('hidden');
}

function generateProfitLossReport() {
    const sales = db.getSalesByTenant(currentUser.tenantId);
    const products = db.getProductsByTenant(currentUser.tenantId);
    
    const today = new Date().toISOString().split('T')[0];
    const todaySales = sales.filter(s => s.date.startsWith(today));
    
    const revenue = todaySales.reduce((sum, s) => sum + s.total, 0);
    
    // Calculate cost of goods sold (simplified)
    let costOfGoodsSold = 0;
    todaySales.forEach(sale => {
        sale.items.forEach(item => {
            const product = products.find(p => p.id === item.productId);
            if (product) {
                // Assume 60% of price is cost (simplified)
                costOfGoodsSold += (product.price * 0.6) * item.quantity;
            }
        });
    });
    
    const grossProfit = revenue - costOfGoodsSold;
    const expenses = revenue * 0.1; // Assume 10% for expenses
    const netProfit = grossProfit - expenses;
    
    document.getElementById('reportTitle').textContent = 'Profit/Loss Statement - ' + new Date().toLocaleDateString();
    document.getElementById('reportData').innerHTML = `
        <div class="space-y-4">
            <div class="p-4 bg-indigo-50 rounded-lg">
                <h4 class="font-semibold text-gray-900 mb-2">Revenue</h4>
                <p class="text-2xl font-bold text-indigo-600">${revenue.toLocaleString()} XAF</p>
            </div>
            <div class="p-4 bg-red-50 rounded-lg">
                <h4 class="font-semibold text-gray-900 mb-2">Cost of Goods Sold</h4>
                <p class="text-2xl font-bold text-red-600">-${costOfGoodsSold.toLocaleString()} XAF</p>
            </div>
            <div class="p-4 bg-green-50 rounded-lg">
                <h4 class="font-semibold text-gray-900 mb-2">Gross Profit</h4>
                <p class="text-2xl font-bold text-green-600">${grossProfit.toLocaleString()} XAF</p>
            </div>
            <div class="p-4 bg-orange-50 rounded-lg">
                <h4 class="font-semibold text-gray-900 mb-2">Operating Expenses (10%)</h4>
                <p class="text-2xl font-bold text-orange-600">-${expenses.toLocaleString()} XAF</p>
            </div>
            <div class="p-4 ${netProfit >= 0 ? 'bg-green-100' : 'bg-red-100'} rounded-lg">
                <h4 class="font-semibold text-gray-900 mb-2">Net Profit</h4>
                <p class="text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}">${netProfit >= 0 ? '+' : ''}${netProfit.toLocaleString()} XAF</p>
            </div>
        </div>
    `;
    document.getElementById('reportContent').classList.remove('hidden');
}

function printReport() {
    window.print();
}

// Sales
function loadSales() {
    const sales = db.getSalesByTenant(currentUser.tenantId);
    const tbody = document.getElementById('salesTableBody');
    
    if (sales.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-12 text-center text-gray-500">No sales recorded yet.</td></tr>';
        return;
    }
    
    tbody.innerHTML = sales.map(sale => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${new Date(sale.createdAt).toLocaleDateString()}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${sale.items.length} items</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">$${sale.total.toFixed(2)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">${sale.paymentMethod}</td>
        </tr>
    `).join('');
}

// Employees
function loadEmployees() {
    const employees = db.getEmployeesByTenant(currentUser.tenantId);
    const tbody = document.getElementById('employeesTableBody');
    
    if (employees.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="px-6 py-12 text-center text-gray-500">No employees yet. Use the Invitations tab to add team members.</td></tr>';
        return;
    }
    
    tbody.innerHTML = employees.map(employee => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${employee.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${employee.email}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">${employee.role.replace('_', ' ')}</td>
        </tr>
    `).join('');
}

// Invitations
document.getElementById('invitationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('inviteEmail').value;
    const role = document.getElementById('inviteRole').value;
    
    const existingInvitations = db.getInvitationsByTenant(currentUser.tenantId);
    const existing = existingInvitations.find(i => i.email === email && !i.used);
    
    if (existing) {
        alert('An active invitation already exists for this email');
        return;
    }
    
    const invitation = db.createInvitation({
        tenantId: currentUser.tenantId,
        managerId: currentUser.id,
        email: email,
        role: role
    });
    
    const link = window.location.origin + '/invite.html?token=' + invitation.token;
    document.getElementById('generatedLink').value = link;
    document.getElementById('invitationLinkResult').classList.remove('hidden');
    
    document.getElementById('inviteEmail').value = '';
    document.getElementById('inviteRole').value = 'worker';
    loadInvitations();
});

function copyInvitationLink() {
    const linkField = document.getElementById('generatedLink');
    const link = linkField ? linkField.value : '';
    if (!link) {
        showNotification('No invitation link is available to copy.', 'error');
        return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(link)
            .then(() => showNotification('Invitation link copied to clipboard.', 'success'))
            .catch(() => showNotification('Unable to copy link. Please copy manually.', 'error'));
    } else {
        linkField.select();
        document.execCommand('copy');
        showNotification('Invitation link copied to clipboard.', 'success');
    }
}

function loadInvitations() {
    const invitations = db.getInvitationsByTenant(currentUser.tenantId);
    const tbody = document.getElementById('invitationsTableBody');
    
    if (invitations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-12 text-center text-gray-500">No invitations sent yet.</td></tr>';
        return;
    }
    
    tbody.innerHTML = invitations.map(invitation => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${invitation.email}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">${invitation.role.replace('_', ' ')}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span class="px-2 py-1 rounded-full text-xs ${invitation.used ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}">
                    ${invitation.used ? 'Accepted' : 'Pending'}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(invitation.createdAt).toLocaleDateString()}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(invitation.expiresAt).toLocaleDateString()}</td>
        </tr>
    `).join('');
}

// Customers
function showAddCustomerForm() {
    document.getElementById('addCustomerForm').classList.remove('hidden');
}

function hideAddCustomerForm() {
    document.getElementById('addCustomerForm').classList.add('hidden');
    document.getElementById('customerForm').reset();
}

function loadCustomers() {
    const customers = db.getCustomersByTenant(currentUser.tenantId);
    const tbody = document.getElementById('customersTableBody');
    
    if (customers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-12 text-center text-gray-500">No customers yet.</td></tr>';
        return;
    }
    
    tbody.innerHTML = customers.map(customer => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${customer.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${customer.email || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${customer.phone || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${customer.loyaltyPoints || 0}</td>
        </tr>
    `).join('');
}

document.getElementById('customerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const customer = {
        tenantId: currentUser.tenantId,
        name: document.getElementById('customerName').value,
        email: document.getElementById('customerEmail').value,
        phone: document.getElementById('customerPhone').value,
        loyaltyPoints: 0
    };
    
    db.createCustomer(customer);
    hideAddCustomerForm();
    loadCustomers();
    loadOverviewData();
    showNotification('Customer added successfully.', 'success');
});

// Analytics
function loadAnalytics() {
    // Set default dates
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    document.getElementById('analyticsEndDate').value = today.toISOString().split('T')[0];
    document.getElementById('analyticsStartDate').value = lastMonth.toISOString().split('T')[0];
}

function generateAnalyticsReport() {
    const startDate = document.getElementById('analyticsStartDate').value;
    const endDate = document.getElementById('analyticsEndDate').value;
    
    if (!startDate || !endDate) {
        alert('Please select date range');
        return;
    }
    
    const analytics = db.getSalesAnalytics(currentUser.tenantId, startDate, endDate);
    
    document.getElementById('analyticsTotalSales').textContent = analytics.totalSales;
    document.getElementById('analyticsTotalRevenue').textContent = '$' + analytics.totalRevenue.toFixed(2);
    document.getElementById('analyticsAvgOrder').textContent = '$' + analytics.averageOrderValue.toFixed(2);
    document.getElementById('analyticsPaymentMethods').textContent = Object.keys(analytics.paymentMethods).length;
    
    // Top products
    const topProducts = db.getTopProducts(currentUser.tenantId, 10);
    document.getElementById('topProductsList').innerHTML = topProducts.map((p, i) => `
        <div class="flex justify-between items-center p-2 bg-gray-50 rounded">
            <span class="font-medium">${i + 1}. ${p.name}</span>
            <span class="text-gray-600">$${p.revenue.toFixed(2)}</span>
        </div>
    `).join('');
    
    // Low stock alerts
    const lowStock = db.getLowStockProducts(currentUser.tenantId, 10);
    document.getElementById('lowStockList').innerHTML = lowStock.map(p => `
        <div class="flex justify-between items-center p-2 bg-red-50 rounded">
            <span class="font-medium text-red-700">${p.name}</span>
            <span class="text-red-600">${p.stock} left</span>
        </div>
    `).join('');
    
    document.getElementById('analyticsResults').classList.remove('hidden');
}

function exportAnalyticsReport() {
    const startDate = document.getElementById('analyticsStartDate').value;
    const endDate = document.getElementById('analyticsEndDate').value;
    const analytics = db.getSalesAnalytics(currentUser.tenantId, startDate, endDate);
    
    let csv = 'Date,Sales,Revenue\n';
    Object.entries(analytics.salesByDay).forEach(([day, data]) => {
        csv += `${day},${data.count},${data.revenue}\n`;
    });
    
    downloadCSV(csv, 'analytics-report.csv');
}

// Locations
function showAddLocationForm() {
    document.getElementById('addLocationForm').classList.remove('hidden');
}

function hideAddLocationForm() {
    document.getElementById('addLocationForm').classList.add('hidden');
    document.getElementById('locationForm').reset();
}

function loadLocations() {
    const locations = db.getLocationsByTenant(currentUser.tenantId);
    const tbody = document.getElementById('locationsTableBody');
    
    if (locations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-12 text-center text-gray-500">No locations yet. Add your first location.</td></tr>';
        return;
    }
    
    tbody.innerHTML = locations.map(location => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${location.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${location.address || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${location.phone || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <button onclick="deleteLocation('${location.id}')" class="text-red-600 hover:text-red-900">Delete</button>
            </td>
        </tr>
    `).join('');
}

document.getElementById('locationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const location = {
        tenantId: currentUser.tenantId,
        name: document.getElementById('locationName').value,
        address: document.getElementById('locationAddress').value,
        phone: document.getElementById('locationPhone').value
    };
    
    db.createLocation(location);
    hideAddLocationForm();
    loadLocations();
});

function deleteLocation(locationId) {
    if (confirm('Are you sure you want to delete this location?')) {
        const locations = db.getCollection('locations');
        const filtered = locations.filter(l => l.id !== locationId);
        db.setCollection('locations', filtered);
        loadLocations();
    }
}

// Suppliers
function showAddSupplierForm() {
    document.getElementById('addSupplierForm').classList.remove('hidden');
}

function hideAddSupplierForm() {
    document.getElementById('addSupplierForm').classList.add('hidden');
    document.getElementById('supplierForm').reset();
}

function loadSuppliers() {
    const suppliers = db.getSuppliersByTenant(currentUser.tenantId);
    const tbody = document.getElementById('suppliersTableBody');
    
    if (suppliers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-12 text-center text-gray-500">No suppliers yet. Add your first supplier.</td></tr>';
        return;
    }
    
    tbody.innerHTML = suppliers.map(supplier => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${supplier.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${supplier.email || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${supplier.phone || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <button onclick="deleteSupplier('${supplier.id}')" class="text-red-600 hover:text-red-900">Delete</button>
            </td>
        </tr>
    `).join('');
}

document.getElementById('supplierForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const supplier = {
        tenantId: currentUser.tenantId,
        name: document.getElementById('supplierName').value,
        email: document.getElementById('supplierEmail').value,
        phone: document.getElementById('supplierPhone').value
    };
    
    db.createSupplier(supplier);
    hideAddSupplierForm();
    loadSuppliers();
});

function deleteSupplier(supplierId) {
    if (confirm('Are you sure you want to delete this supplier?')) {
        const suppliers = db.getCollection('suppliers');
        const filtered = suppliers.filter(s => s.id !== supplierId);
        db.setCollection('suppliers', filtered);
        loadSuppliers();
    }
}

// Purchase Orders
function showAddPOForm() {
    document.getElementById('addPOForm').classList.remove('hidden');
    // Load suppliers dropdown
    const suppliers = db.getSuppliersByTenant(currentUser.tenantId);
    const select = document.getElementById('poSupplier');
    select.innerHTML = '<option value="">Select Supplier</option>' + 
        suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
}

function hideAddPOForm() {
    document.getElementById('addPOForm').classList.add('hidden');
    document.getElementById('poForm').reset();
}

function loadPurchaseOrders() {
    const pos = db.getPurchaseOrdersByTenant(currentUser.tenantId);
    const tbody = document.getElementById('poTableBody');
    
    if (pos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-12 text-center text-gray-500">No purchase orders yet.</td></tr>';
        return;
    }
    
    tbody.innerHTML = pos.map(po => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${po.id.substring(0, 8)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${po.supplierName || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span class="px-2 py-1 rounded-full text-xs ${po.status === 'completed' ? 'bg-green-100 text-green-700' : po.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}">
                    ${po.status}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(po.createdAt).toLocaleDateString()}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <button onclick="updatePOStatus('${po.id}', 'completed')" class="text-green-600 hover:text-green-900 mr-2">Complete</button>
                <button onclick="deletePO('${po.id}')" class="text-red-600 hover:text-red-900">Delete</button>
            </td>
        </tr>
    `).join('');
}

document.getElementById('poForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const supplierId = document.getElementById('poSupplier').value;
    const supplier = db.getCollection('suppliers').find(s => s.id === supplierId);
    
    const po = {
        tenantId: currentUser.tenantId,
        supplierId: supplierId,
        supplierName: supplier ? supplier.name : 'Unknown',
        products: document.getElementById('poProducts').value,
        notes: document.getElementById('poNotes').value
    };
    
    db.createPurchaseOrder(po);
    hideAddPOForm();
    loadPurchaseOrders();
});

function updatePOStatus(poId, status) {
    db.updatePurchaseOrderStatus(poId, status);
    loadPurchaseOrders();
}

function deletePO(poId) {
    if (confirm('Are you sure you want to delete this purchase order?')) {
        const pos = db.getCollection('purchaseOrders');
        const filtered = pos.filter(po => po.id !== poId);
        db.setCollection('purchaseOrders', filtered);
        loadPurchaseOrders();
    }
}

// Coupons
function showAddCouponForm() {
    document.getElementById('addCouponForm').classList.remove('hidden');
}

function hideAddCouponForm() {
    document.getElementById('addCouponForm').classList.add('hidden');
    document.getElementById('couponForm').reset();
}

function loadCoupons() {
    const coupons = db.getCouponsByTenant(currentUser.tenantId);
    const tbody = document.getElementById('couponsTableBody');
    
    if (coupons.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-12 text-center text-gray-500">No coupons yet. Create your first coupon.</td></tr>';
        return;
    }
    
    tbody.innerHTML = coupons.map(coupon => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${coupon.code}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">${coupon.type}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${coupon.type === 'percentage' ? coupon.value + '%' : '$' + coupon.value}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${coupon.usedCount}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span class="px-2 py-1 rounded-full text-xs ${coupon.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                    ${coupon.active ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <button onclick="toggleCoupon('${coupon.id}')" class="text-blue-600 hover:text-blue-900 mr-2">${coupon.active ? 'Deactivate' : 'Activate'}</button>
                <button onclick="deleteCoupon('${coupon.id}')" class="text-red-600 hover:text-red-900">Delete</button>
            </td>
        </tr>
    `).join('');
}

document.getElementById('couponForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const coupon = {
        tenantId: currentUser.tenantId,
        code: document.getElementById('couponCode').value.toUpperCase(),
        type: document.getElementById('couponType').value,
        value: parseFloat(document.getElementById('couponValue').value),
        description: document.getElementById('couponDescription').value,
        active: true
    };
    
    db.createCoupon(coupon);
    hideAddCouponForm();
    loadCoupons();
});

function toggleCoupon(couponId) {
    const coupons = db.getCollection('coupons');
    const index = coupons.findIndex(c => c.id === couponId);
    if (index !== -1) {
        coupons[index].active = !coupons[index].active;
        db.setCollection('coupons', coupons);
        loadCoupons();
    }
}

function deleteCoupon(couponId) {
    if (confirm('Are you sure you want to delete this coupon?')) {
        const coupons = db.getCollection('coupons');
        const filtered = coupons.filter(c => c.id !== couponId);
        db.setCollection('coupons', filtered);
        loadCoupons();
    }
}

// Tax Rates
function showAddTaxForm() {
    document.getElementById('addTaxForm').classList.remove('hidden');
}

function hideAddTaxForm() {
    document.getElementById('addTaxForm').classList.add('hidden');
    document.getElementById('taxForm').reset();
}

function loadTaxRates() {
    const taxRates = db.getTaxRatesByTenant(currentUser.tenantId);
    const tbody = document.getElementById('taxRatesTableBody');
    
    if (taxRates.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-12 text-center text-gray-500">No tax rates yet. Add your first tax rate.</td></tr>';
        return;
    }
    
    tbody.innerHTML = taxRates.map(tax => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${tax.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${tax.rate}%</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${tax.description || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <button onclick="deleteTaxRate('${tax.id}')" class="text-red-600 hover:text-red-900">Delete</button>
            </td>
        </tr>
    `).join('');
}

document.getElementById('taxForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const taxRate = {
        tenantId: currentUser.tenantId,
        name: document.getElementById('taxName').value,
        rate: parseFloat(document.getElementById('taxRate').value),
        description: document.getElementById('taxDescription').value
    };
    
    db.createTaxRate(taxRate);
    hideAddTaxForm();
    loadTaxRates();
});

function deleteTaxRate(taxId) {
    if (confirm('Are you sure you want to delete this tax rate?')) {
        const taxRates = db.getCollection('taxRates');
        const filtered = taxRates.filter(t => t.id !== taxId);
        db.setCollection('taxRates', filtered);
        loadTaxRates();
    }
}

// Shifts
function startNewShift() {
    const shift = {
        tenantId: currentUser.tenantId,
        userId: currentUser.id,
        userName: currentUser.name
    };
    
    db.createShift(shift);
    loadShifts();
    alert('Shift started successfully!');
}

function loadShifts() {
    const shifts = db.getShiftsByTenant(currentUser.tenantId);
    const tbody = document.getElementById('shiftsTableBody');
    
    if (shifts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-12 text-center text-gray-500">No shifts yet. Start your first shift.</td></tr>';
        return;
    }
    
    tbody.innerHTML = shifts.map(shift => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${shift.id.substring(0, 8)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${shift.userName}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(shift.createdAt).toLocaleString()}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${shift.closedAt ? new Date(shift.closedAt).toLocaleString() : '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span class="px-2 py-1 rounded-full text-xs ${shift.status === 'closed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}">
                    ${shift.status}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${shift.status === 'active' ? `<button onclick="closeShift('${shift.id}')" class="text-red-600 hover:text-red-900">Close Shift</button>` : '-'}
            </td>
        </tr>
    `).join('');
}

function closeShift(shiftId) {
    if (confirm('Are you sure you want to close this shift?')) {
        const sales = db.getSalesByTenant(currentUser.tenantId);
        const shiftSales = sales.filter(s => s.workerId === currentUser.id);
        const total = shiftSales.reduce((sum, s) => sum + s.total, 0);
        
        db.closeShift(shiftId, {
            totalSales: shiftSales.length,
            totalRevenue: total
        });
        loadShifts();
        alert(`Shift closed. Total sales: ${shiftSales.length}, Revenue: $${total.toFixed(2)}`);
    }
}

// Kitchen Display
function loadKitchenOrders() {
    const kitchenOrders = db.getKitchenOrdersByTenant(currentUser.tenantId);
    
    const pending = kitchenOrders.filter(ko => ko.status === 'pending');
    const inProgress = kitchenOrders.filter(ko => ko.status === 'in-progress');
    const completed = kitchenOrders.filter(ko => ko.status === 'completed');
    
    document.getElementById('pendingKitchenOrders').innerHTML = pending.length === 0 
        ? '<p class="text-gray-500">No pending orders</p>'
        : pending.map(ko => renderKitchenOrder(ko)).join('');
    
    document.getElementById('inProgressKitchenOrders').innerHTML = inProgress.length === 0
        ? '<p class="text-gray-500">No orders in progress</p>'
        : inProgress.map(ko => renderKitchenOrder(ko)).join('');
    
    document.getElementById('completedKitchenOrders').innerHTML = completed.length === 0
        ? '<p class="text-gray-500">No completed orders</p>'
        : completed.map(ko => renderKitchenOrder(ko)).join('');
}

function renderKitchenOrder(ko) {
    return `
        <div class="p-4 bg-gray-50 rounded-lg">
            <div class="flex justify-between items-center mb-2">
                <span class="font-medium">Order #${ko.id.substring(0, 8)}</span>
                <span class="text-sm text-gray-500">${new Date(ko.createdAt).toLocaleTimeString()}</span>
            </div>
            <p class="text-sm text-gray-600">${ko.items}</p>
            ${ko.status === 'pending' ? `<button onclick="updateKitchenOrderStatus('${ko.id}', 'in-progress')" class="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm">Start</button>` : ''}
            ${ko.status === 'in-progress' ? `<button onclick="updateKitchenOrderStatus('${ko.id}', 'completed')" class="mt-2 px-3 py-1 bg-green-600 text-white rounded text-sm">Complete</button>` : ''}
        </div>
    `;
}

function updateKitchenOrderStatus(orderId, status) {
    db.updateKitchenOrderStatus(orderId, status);
    loadKitchenOrders();
}

// Loyalty Tiers
function showAddLoyaltyTierForm() {
    document.getElementById('addLoyaltyTierForm').classList.remove('hidden');
}

function hideAddLoyaltyTierForm() {
    document.getElementById('addLoyaltyTierForm').classList.add('hidden');
    document.getElementById('loyaltyTierForm').reset();
}

function loadLoyaltyTiers() {
    const tiers = db.getLoyaltyTiersByTenant(currentUser.tenantId);
    const tbody = document.getElementById('loyaltyTiersTableBody');
    
    if (tiers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-12 text-center text-gray-500">No loyalty tiers yet. Add your first tier.</td></tr>';
        return;
    }
    
    tbody.innerHTML = tiers.map(tier => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${tier.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${tier.points} points</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${tier.discount}% discount</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <button onclick="deleteLoyaltyTier('${tier.id}')" class="text-red-600 hover:text-red-900">Delete</button>
            </td>
        </tr>
    `).join('');
}

document.getElementById('loyaltyTierForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const tier = {
        tenantId: currentUser.tenantId,
        name: document.getElementById('tierName').value,
        points: parseInt(document.getElementById('tierPoints').value),
        discount: parseFloat(document.getElementById('tierDiscount').value)
    };
    
    db.createLoyaltyTier(tier);
    hideAddLoyaltyTierForm();
    loadLoyaltyTiers();
});

function deleteLoyaltyTier(tierId) {
    if (confirm('Are you sure you want to delete this loyalty tier?')) {
        const tiers = db.getCollection('loyaltyTiers');
        const filtered = tiers.filter(t => t.id !== tierId);
        db.setCollection('loyaltyTiers', filtered);
        loadLoyaltyTiers();
    }
}

// Settings
function loadSettings() {
    const settings = db.getSettings(currentUser.tenantId);
    
    if (settings.darkMode) {
        document.getElementById('darkModeToggle').textContent = 'Disable';
        document.getElementById('darkModeToggle').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('darkModeToggle').classList.add('bg-indigo-600', 'text-white');
    }
    if (settings.notifications && settings.notifications.lowStock) {
        const lowStockToggle = document.getElementById('lowStockToggle');
        lowStockToggle.textContent = 'Disable';
        lowStockToggle.classList.remove('bg-gray-200', 'text-gray-700');
        lowStockToggle.classList.add('bg-indigo-600', 'text-white');
    }
}

function toggleDarkMode() {
    const settings = db.getSettings(currentUser.tenantId);
    settings.darkMode = !settings.darkMode;
    db.saveSettings(currentUser.tenantId, settings);
    
    if (settings.darkMode) {
        document.body.classList.add('dark');
        document.getElementById('darkModeToggle').textContent = 'Disable';
        document.getElementById('darkModeToggle').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('darkModeToggle').classList.add('bg-indigo-600', 'text-white');
    } else {
        document.body.classList.remove('dark');
        document.getElementById('darkModeToggle').textContent = 'Enable';
        document.getElementById('darkModeToggle').classList.remove('bg-indigo-600', 'text-white');
        document.getElementById('darkModeToggle').classList.add('bg-gray-200', 'text-gray-700');
    }
}

function toggleNotification(type) {
    const settings = db.getSettings(currentUser.tenantId);
    settings.notifications = settings.notifications || {};
    settings.notifications[type] = !settings.notifications[type];
    db.saveSettings(currentUser.tenantId, settings);
    
    const toggle = document.getElementById(type + 'Toggle');
    if (settings.notifications[type]) {
        toggle.textContent = 'Disable';
        toggle.classList.remove('bg-gray-200', 'text-gray-700');
        toggle.classList.add('bg-indigo-600', 'text-white');
        showNotification('Low stock alerts enabled.', 'success');
    } else {
        toggle.textContent = 'Enable';
        toggle.classList.remove('bg-indigo-600', 'text-white');
        toggle.classList.add('bg-gray-200', 'text-gray-700');
        showNotification('Low stock alerts disabled.', 'info');
    }
}

function exportAllData() {
    const data = {
        products: db.getProductsByTenant(currentUser.tenantId),
        sales: db.getSalesByTenant(currentUser.tenantId),
        customers: db.getCustomersByTenant(currentUser.tenantId),
        employees: db.getEmployeesByTenant(currentUser.tenantId),
        suppliers: db.getSuppliersByTenant(currentUser.tenantId),
        locations: db.getLocationsByTenant(currentUser.tenantId),
        coupons: db.getCouponsByTenant(currentUser.tenantId),
        taxRates: db.getTaxRatesByTenant(currentUser.tenantId),
        purchaseOrders: db.getPurchaseOrdersByTenant(currentUser.tenantId),
        shifts: db.getShiftsByTenant(currentUser.tenantId),
        loyaltyTiers: db.getLoyaltyTiersByTenant(currentUser.tenantId)
    };
    
    const json = JSON.stringify(data, null, 2);
    downloadCSV(json, 'askia-export.json', 'application/json');
}

function exportProductsCSV() {
    const products = db.getProductsByTenant(currentUser.tenantId);
    if (products.length === 0) {
        showNotification('No products to export.', 'info');
        return;
    }
    const csv = ['Name,SKU,Price,Stock,Low Stock Alert,Expiry Date'].concat(
        products.map(p => `${JSON.stringify(p.name)},${JSON.stringify(p.sku || '')},${p.price},${p.stock},${p.lowStockAlert || ''},${p.expiryDate || ''}`)
    ).join('\n');
    downloadCSV(csv, 'products-export.csv', 'text/csv');
}

function exportSalesCSV() {
    const sales = db.getSalesByTenant(currentUser.tenantId);
    if (sales.length === 0) {
        showNotification('No sales to export.', 'info');
        return;
    }
    const csv = ['Sale ID,Date,Items Count,Total,Payment Method'].concat(
        sales.map(s => `${JSON.stringify(s.id)},${new Date(s.createdAt).toISOString()},${s.items.length},${s.total},${s.paymentMethod}`)
    ).join('\n');
    downloadCSV(csv, 'sales-export.csv', 'text/csv');
}

function exportCustomersCSV() {
    const customers = db.getCustomersByTenant(currentUser.tenantId);
    if (customers.length === 0) {
        showNotification('No customers to export.', 'info');
        return;
    }
    const csv = ['Name,Email,Phone,Loyalty Points'].concat(
        customers.map(c => `${JSON.stringify(c.name)},${JSON.stringify(c.email || '')},${JSON.stringify(c.phone || '')},${c.loyaltyPoints || 0}`)
    ).join('\n');
    downloadCSV(csv, 'customers-export.csv', 'text/csv');
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                // Import each collection
                Object.keys(data).forEach(key => {
                    if (Array.isArray(data[key])) {
                        const collection = db.getCollection(key);
                        const filtered = collection.filter(item => item.tenantId !== currentUser.tenantId);
                        const newItems = data[key].map(item => ({ ...item, tenantId: currentUser.tenantId }));
                        db.setCollection(key, [...filtered, ...newItems]);
                    }
                });
                
                alert('Data imported successfully!');
                location.reload();
            } catch (error) {
                alert('Error importing data. Please check the file format.');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

function clearAllData() {
    if (confirm('Are you sure you want to clear ALL data? This cannot be undone!')) {
        localStorage.clear();
        window.location.href = 'index.html';
    }
}

function downloadCSV(content, filename, mimeType = 'text/csv') {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Initialize
checkAuth();
