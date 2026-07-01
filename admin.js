// Admin password (in production, this should be server-side)
const ADMIN_PASSWORD = 'admin123';

// Check admin session
function checkAdminSession() {
    const adminSession = localStorage.getItem('adminSession');
    if (adminSession === 'authenticated') {
        showAdminDashboard();
    } else {
        showAdminLogin();
    }
}

// Show admin login
function showAdminLogin() {
    document.getElementById('adminLogin').classList.remove('hidden');
    document.getElementById('adminDashboard').classList.add('hidden');
}

// Show admin dashboard
function showAdminDashboard() {
    document.getElementById('adminLogin').classList.add('hidden');
    document.getElementById('adminDashboard').classList.remove('hidden');
    loadTenants();
}

// Admin login handler
document.getElementById('adminLoginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const password = document.getElementById('adminPassword').value;
    
    if (password === ADMIN_PASSWORD) {
        localStorage.setItem('adminSession', 'authenticated');
        showAdminDashboard();
    } else {
        const errorDiv = document.getElementById('loginError');
        errorDiv.textContent = 'Invalid admin password';
        errorDiv.classList.remove('hidden');
    }
});

// Admin logout
function adminLogout() {
    localStorage.removeItem('adminSession');
    showAdminLogin();
}

// Load all tenants (free version - no payment verification)
function loadTenants() {
    const tenants = db.getCollection('tenants') || [];
    const users = db.getCollection('users') || [];
    
    // Calculate stats
    const totalTenants = tenants.length;
    const totalUsers = users.length;
    
    document.getElementById('totalPayments').textContent = totalTenants;
    document.getElementById('pendingPayments').textContent = totalUsers;
    document.getElementById('approvedPayments').textContent = 'Free';
    document.getElementById('totalRevenue').textContent = '0 XAF';
    
    // Render tenants table
    const tbody = document.getElementById('paymentsTableBody');
    tbody.innerHTML = '';
    
    if (tenants.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="px-6 py-4 text-center text-gray-500">No marketplaces found</td></tr>';
        return;
    }
    
    // Sort by date (newest first)
    tenants.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    tenants.forEach(tenant => {
        const tenantUsers = users.filter(u => u.tenantId === tenant.id);
        const manager = tenantUsers.find(u => u.role === 'manager');
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${new Date(tenant.createdAt).toLocaleDateString()}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${tenant.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${manager ? manager.name : 'Unknown'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${tenant.email}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Free</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Active</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <span class="text-gray-400">No actions</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick="deleteMarketplace('${tenant.id}')" class="text-red-600 hover:text-red-900">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Delete marketplace
function deleteMarketplace(tenantId) {
    const tenants = JSON.parse(localStorage.getItem('tenants') || '[]');
    const tenant = tenants.find(t => t.id === tenantId);
    
    if (!confirm(`Are you sure you want to delete ${tenant ? tenant.name : 'this marketplace'}? This will delete ALL data including products, sales, employees, and cannot be undone.`)) return;
    
    if (db.deleteTenant(tenantId)) {
        alert('Marketplace deleted successfully.');
        loadTenants();
    } else {
        alert('Failed to delete marketplace.');
    }
}

// Initialize
checkAdminSession();
