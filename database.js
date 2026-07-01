// LocalStorage Database Management
class Database {
    constructor() {
        this.initialize();
    }

    initialize() {
        // Initialize collections if they don't exist
        if (!localStorage.getItem('users')) {
            localStorage.setItem('users', JSON.stringify([]));
        }
        if (!localStorage.getItem('tenants')) {
            localStorage.setItem('tenants', JSON.stringify([]));
        }
        if (!localStorage.getItem('invitations')) {
            localStorage.setItem('invitations', JSON.stringify([]));
        }
        if (!localStorage.getItem('products')) {
            localStorage.setItem('products', JSON.stringify([]));
        }
        if (!localStorage.getItem('sales')) {
            localStorage.setItem('sales', JSON.stringify([]));
        }
        if (!localStorage.getItem('employees')) {
            localStorage.setItem('employees', JSON.stringify([]));
        }
        if (!localStorage.getItem('customers')) {
            localStorage.setItem('customers', JSON.stringify([]));
        }
        // New collections for upgraded features
        if (!localStorage.getItem('locations')) {
            localStorage.setItem('locations', JSON.stringify([]));
        }
        if (!localStorage.getItem('suppliers')) {
            localStorage.setItem('suppliers', JSON.stringify([]));
        }
        if (!localStorage.getItem('purchaseOrders')) {
            localStorage.setItem('purchaseOrders', JSON.stringify([]));
        }
        if (!localStorage.getItem('coupons')) {
            localStorage.setItem('coupons', JSON.stringify([]));
        }
        if (!localStorage.getItem('taxRates')) {
            localStorage.setItem('taxRates', JSON.stringify([]));
        }
        if (!localStorage.getItem('shifts')) {
            localStorage.setItem('shifts', JSON.stringify([]));
        }
        if (!localStorage.getItem('notifications')) {
            localStorage.setItem('notifications', JSON.stringify([]));
        }
        if (!localStorage.getItem('kitchenOrders')) {
            localStorage.setItem('kitchenOrders', JSON.stringify([]));
        }
        if (!localStorage.getItem('loyaltyTiers')) {
            localStorage.setItem('loyaltyTiers', JSON.stringify([]));
        }
        if (!localStorage.getItem('settings')) {
            localStorage.setItem('settings', JSON.stringify({}));
        }
        // Billing & Payment collections
        if (!localStorage.getItem('subscriptions')) {
            localStorage.setItem('subscriptions', JSON.stringify([]));
        }
        if (!localStorage.getItem('payments')) {
            localStorage.setItem('payments', JSON.stringify([]));
        }
        if (!localStorage.getItem('invoices')) {
            localStorage.setItem('invoices', JSON.stringify([]));
        }
    }

    // Helper methods
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    getCollection(collection) {
        return JSON.parse(localStorage.getItem(collection) || '[]');
    }

    setCollection(collection, data) {
        localStorage.setItem(collection, JSON.stringify(data));
    }

    // User operations
    createUser(user, password) {
        const users = this.getCollection('users');
        if (users.find(u => u.email === user.email)) {
            return null;
        }
        user.id = this.generateId();
        user.createdAt = new Date().toISOString();
        users.push(user);
        this.setCollection('users', users);
        
        // Store password separately (in production, hash this)
        const passwords = JSON.parse(localStorage.getItem('passwords') || '{}');
        passwords[user.id] = password;
        localStorage.setItem('passwords', JSON.stringify(passwords));
        
        return user;
    }

    getUserByEmail(email) {
        const users = this.getCollection('users');
        return users.find(u => u.email === email);
    }

    verifyUser(email, password) {
        const user = this.getUserByEmail(email);
        if (!user) return null;
        
        const passwords = JSON.parse(localStorage.getItem('passwords') || '{}');
        if (passwords[user.id] === password) {
            return user;
        }
        return null;
    }

    getUserById(id) {
        const users = this.getCollection('users');
        return users.find(u => u.id === id);
    }

    // Tenant operations
    createTenant(tenant) {
        const tenants = this.getCollection('tenants');
        tenant.id = this.generateId();
        tenant.createdAt = new Date().toISOString();
        tenants.push(tenant);
        this.setCollection('tenants', tenants);
        return tenant;
    }

    getTenantById(id) {
        const tenants = this.getCollection('tenants');
        return tenants.find(t => t.id === id);
    }

    getTenant(id) {
        return this.getTenantById(id);
    }

    // Invitation operations
    createInvitation(invitation) {
        const invitations = this.getCollection('invitations');
        invitation.id = this.generateId();
        invitation.token = this.generateId();
        invitation.createdAt = new Date().toISOString();
        invitation.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        invitation.used = false;
        invitations.push(invitation);
        this.setCollection('invitations', invitations);
        return invitation;
    }

    getInvitationByToken(token) {
        const invitations = this.getCollection('invitations');
        return invitations.find(i => i.token === token && !i.used);
    }

    markInvitationAsUsed(invitationId) {
        const invitations = this.getCollection('invitations');
        const index = invitations.findIndex(i => i.id === invitationId);
        if (index !== -1) {
            invitations[index].used = true;
            this.setCollection('invitations', invitations);
        }
    }

    getInvitationsByTenant(tenantId) {
        const invitations = this.getCollection('invitations');
        return invitations.filter(i => i.tenantId === tenantId);
    }

    deleteTenant(tenantId) {
        // Delete all tenant data
        this.deleteCollectionByTenant('products', tenantId);
        this.deleteCollectionByTenant('sales', tenantId);
        this.deleteCollectionByTenant('employees', tenantId);
        this.deleteCollectionByTenant('customers', tenantId);
        this.deleteCollectionByTenant('invitations', tenantId);
        this.deleteCollectionByTenant('locations', tenantId);
        this.deleteCollectionByTenant('suppliers', tenantId);
        this.deleteCollectionByTenant('purchaseOrders', tenantId);
        this.deleteCollectionByTenant('coupons', tenantId);
        this.deleteCollectionByTenant('taxRates', tenantId);
        this.deleteCollectionByTenant('shifts', tenantId);
        this.deleteCollectionByTenant('kitchenOrders', tenantId);
        this.deleteCollectionByTenant('loyaltyTiers', tenantId);
        this.deleteCollectionByTenant('payments', tenantId);
        this.deleteCollectionByTenant('subscriptions', tenantId);
        this.deleteCollectionByTenant('invoices', tenantId);
        
        // Delete tenant record
        const tenants = this.getCollection('tenants');
        const filtered = tenants.filter(t => t.id !== tenantId);
        this.setCollection('tenants', filtered);
        
        // Delete tenant settings
        const settings = JSON.parse(localStorage.getItem('settings') || '{}');
        delete settings[tenantId];
        localStorage.setItem('settings', JSON.stringify(settings));
        
        return true;
    }

    deleteCollectionByTenant(collectionName, tenantId) {
        const collection = this.getCollection(collectionName);
        const filtered = collection.filter(item => item.tenantId !== tenantId);
        this.setCollection(collectionName, filtered);
    }

    // Product operations
    createProduct(product) {
        const products = this.getCollection('products');
        product.id = this.generateId();
        product.createdAt = new Date().toISOString();
        product.updatedAt = new Date().toISOString();
        products.push(product);
        this.setCollection('products', products);
        return product;
    }

    getProductsByTenant(tenantId) {
        const products = this.getCollection('products');
        return products.filter(p => p.tenantId === tenantId);
    }

    getProductById(productId) {
        const products = this.getCollection('products');
        return products.find(p => p.id === productId);
    }

    updateProduct(id, updates) {
        const products = this.getCollection('products');
        const index = products.findIndex(p => p.id === id);
        if (index !== -1) {
            products[index] = { ...products[index], ...updates, updatedAt: new Date().toISOString() };
            this.setCollection('products', products);
            return products[index];
        }
        return null;
    }

    deleteProduct(id) {
        const products = this.getCollection('products');
        const filtered = products.filter(p => p.id !== id);
        this.setCollection('products', filtered);
    }

    // Sale operations
    createSale(sale) {
        const sales = this.getCollection('sales');
        sale.id = this.generateId();
        sale.createdAt = new Date().toISOString();
        sales.push(sale);
        this.setCollection('sales', sales);
        return sale;
    }

    getSalesByTenant(tenantId) {
        const sales = this.getCollection('sales');
        return sales.filter(s => s.tenantId === tenantId);
    }

    getSalesByWorker(workerId) {
        const sales = this.getCollection('sales');
        return sales.filter(s => s.workerId === workerId);
    }

    // Employee operations
    createEmployee(employee) {
        const employees = this.getCollection('employees');
        employee.id = this.generateId();
        employee.createdAt = new Date().toISOString();
        employees.push(employee);
        this.setCollection('employees', employees);
        return employee;
    }

    getEmployeesByTenant(tenantId) {
        const employees = this.getCollection('employees');
        return employees.filter(e => e.tenantId === tenantId);
    }

    // Customer operations
    createCustomer(customer) {
        const customers = this.getCollection('customers');
        customer.id = this.generateId();
        customer.createdAt = new Date().toISOString();
        customers.push(customer);
        this.setCollection('customers', customers);
        return customer;
    }

    getCustomersByTenant(tenantId) {
        const customers = this.getCollection('customers');
        return customers.filter(c => c.tenantId === tenantId);
    }

    // Location operations (Multi-location support)
    createLocation(location) {
        const locations = this.getCollection('locations');
        location.id = this.generateId();
        location.createdAt = new Date().toISOString();
        locations.push(location);
        this.setCollection('locations', locations);
        return location;
    }

    getLocationsByTenant(tenantId) {
        const locations = this.getCollection('locations');
        return locations.filter(l => l.tenantId === tenantId);
    }

    getLocationById(id) {
        const locations = this.getCollection('locations');
        return locations.find(l => l.id === id);
    }

    // Supplier operations
    createSupplier(supplier) {
        const suppliers = this.getCollection('suppliers');
        supplier.id = this.generateId();
        supplier.createdAt = new Date().toISOString();
        suppliers.push(supplier);
        this.setCollection('suppliers', suppliers);
        return supplier;
    }

    getSuppliersByTenant(tenantId) {
        const suppliers = this.getCollection('suppliers');
        return suppliers.filter(s => s.tenantId === tenantId);
    }

    // Purchase Order operations
    createPurchaseOrder(po) {
        const purchaseOrders = this.getCollection('purchaseOrders');
        po.id = this.generateId();
        po.createdAt = new Date().toISOString();
        po.status = 'pending';
        purchaseOrders.push(po);
        this.setCollection('purchaseOrders', purchaseOrders);
        return po;
    }

    getPurchaseOrdersByTenant(tenantId) {
        const purchaseOrders = this.getCollection('purchaseOrders');
        return purchaseOrders.filter(po => po.tenantId === tenantId);
    }

    updatePurchaseOrderStatus(id, status) {
        const purchaseOrders = this.getCollection('purchaseOrders');
        const index = purchaseOrders.findIndex(po => po.id === id);
        if (index !== -1) {
            purchaseOrders[index].status = status;
            purchaseOrders[index].updatedAt = new Date().toISOString();
            this.setCollection('purchaseOrders', purchaseOrders);
        }
    }

    // Coupon operations
    createCoupon(coupon) {
        const coupons = this.getCollection('coupons');
        coupon.id = this.generateId();
        coupon.createdAt = new Date().toISOString();
        coupon.usedCount = 0;
        coupons.push(coupon);
        this.setCollection('coupons', coupons);
        return coupon;
    }

    getCouponsByTenant(tenantId) {
        const coupons = this.getCollection('coupons');
        return coupons.filter(c => c.tenantId === tenantId);
    }

    getCouponByCode(code) {
        const coupons = this.getCollection('coupons');
        return coupons.find(c => c.code === code && c.active);
    }

    useCoupon(couponId) {
        const coupons = this.getCollection('coupons');
        const index = coupons.findIndex(c => c.id === couponId);
        if (index !== -1) {
            coupons[index].usedCount++;
            this.setCollection('coupons', coupons);
        }
    }

    // Tax Rate operations
    createTaxRate(taxRate) {
        const taxRates = this.getCollection('taxRates');
        taxRate.id = this.generateId();
        taxRate.createdAt = new Date().toISOString();
        taxRates.push(taxRate);
        this.setCollection('taxRates', taxRates);
        return taxRate;
    }

    getTaxRatesByTenant(tenantId) {
        const taxRates = this.getCollection('taxRates');
        return taxRates.filter(t => t.tenantId === tenantId);
    }

    // Shift operations
    createShift(shift) {
        const shifts = this.getCollection('shifts');
        shift.id = this.generateId();
        shift.createdAt = new Date().toISOString();
        shift.status = 'active';
        shifts.push(shift);
        this.setCollection('shifts', shifts);
        return shift;
    }

    getShiftsByTenant(tenantId) {
        const shifts = this.getCollection('shifts');
        return shifts.filter(s => s.tenantId === tenantId);
    }

    closeShift(shiftId, closingData) {
        const shifts = this.getCollection('shifts');
        const index = shifts.findIndex(s => s.id === shiftId);
        if (index !== -1) {
            shifts[index].status = 'closed';
            shifts[index].closedAt = new Date().toISOString();
            shifts[index].closingData = closingData;
            this.setCollection('shifts', shifts);
        }
    }

    // Notification operations
    createNotification(notification) {
        const notifications = this.getCollection('notifications');
        notification.id = this.generateId();
        notification.createdAt = new Date().toISOString();
        notification.read = false;
        notifications.push(notification);
        this.setCollection('notifications', notifications);
        return notification;
    }

    getNotificationsByUser(userId) {
        const notifications = this.getCollection('notifications');
        return notifications.filter(n => n.userId === userId).sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        );
    }

    markNotificationAsRead(notificationId) {
        const notifications = this.getCollection('notifications');
        const index = notifications.findIndex(n => n.id === notificationId);
        if (index !== -1) {
            notifications[index].read = true;
            this.setCollection('notifications', notifications);
        }
    }

    // Kitchen Order operations
    createKitchenOrder(kitchenOrder) {
        const kitchenOrders = this.getCollection('kitchenOrders');
        kitchenOrder.id = this.generateId();
        kitchenOrder.createdAt = new Date().toISOString();
        kitchenOrder.status = 'pending';
        kitchenOrders.push(kitchenOrder);
        this.setCollection('kitchenOrders', kitchenOrders);
        return kitchenOrder;
    }

    getKitchenOrdersByTenant(tenantId) {
        const kitchenOrders = this.getCollection('kitchenOrders');
        return kitchenOrders.filter(ko => ko.tenantId === tenantId);
    }

    updateKitchenOrderStatus(orderId, status) {
        const kitchenOrders = this.getCollection('kitchenOrders');
        const index = kitchenOrders.findIndex(ko => ko.id === orderId);
        if (index !== -1) {
            kitchenOrders[index].status = status;
            kitchenOrders[index].updatedAt = new Date().toISOString();
            this.setCollection('kitchenOrders', kitchenOrders);
        }
    }

    // Loyalty Tier operations
    createLoyaltyTier(tier) {
        const loyaltyTiers = this.getCollection('loyaltyTiers');
        tier.id = this.generateId();
        tier.createdAt = new Date().toISOString();
        loyaltyTiers.push(tier);
        this.setCollection('loyaltyTiers', tier);
        return tier;
    }

    getLoyaltyTiersByTenant(tenantId) {
        const loyaltyTiers = this.getCollection('loyaltyTiers');
        return loyaltyTiers.filter(lt => lt.tenantId === tenantId);
    }

    // Settings operations
    saveSettings(tenantId, settings) {
        const allSettings = JSON.parse(localStorage.getItem('settings') || '{}');
        allSettings[tenantId] = { ...allSettings[tenantId], ...settings };
        localStorage.setItem('settings', JSON.stringify(allSettings));
    }

    getSettings(tenantId) {
        const allSettings = JSON.parse(localStorage.getItem('settings') || '{}');
        return allSettings[tenantId] || {};
    }

    // Analytics operations
    getSalesAnalytics(tenantId, startDate, endDate) {
        const sales = this.getSalesByTenant(tenantId);
        const filteredSales = sales.filter(s => {
            const saleDate = new Date(s.createdAt);
            return saleDate >= new Date(startDate) && saleDate <= new Date(endDate);
        });

        return {
            totalSales: filteredSales.length,
            totalRevenue: filteredSales.reduce((sum, s) => sum + s.total, 0),
            averageOrderValue: filteredSales.length > 0 ? filteredSales.reduce((sum, s) => sum + s.total, 0) / filteredSales.length : 0,
            paymentMethods: this.groupBy(filteredSales, 'paymentMethod'),
            salesByDay: this.groupSalesByDay(filteredSales)
        };
    }

    getTopProducts(tenantId, limit = 10) {
        const sales = this.getSalesByTenant(tenantId);
        const productSales = {};

        sales.forEach(sale => {
            sale.items.forEach(item => {
                if (!productSales[item.productId]) {
                    productSales[item.productId] = { name: item.productName, quantity: 0, revenue: 0 };
                }
                productSales[item.productId].quantity += item.quantity;
                productSales[item.productId].revenue += item.total;
            });
        });

        return Object.values(productSales)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, limit);
    }

    getLowStockProducts(tenantId, threshold = 10) {
        const products = this.getProductsByTenant(tenantId);
        return products.filter(p => p.stock <= threshold);
    }

    groupBy(array, key) {
        return array.reduce((result, item) => {
            (result[item[key]] = result[item[key]] || []).push(item);
            return result;
        }, {});
    }

    groupSalesByDay(sales) {
        const grouped = {};
        sales.forEach(sale => {
            const day = new Date(sale.createdAt).toLocaleDateString();
            if (!grouped[day]) {
                grouped[day] = { count: 0, revenue: 0 };
            }
            grouped[day].count++;
            grouped[day].revenue += sale.total;
        });
        return grouped;
    }

    // ==================== SUBSCRIPTION MANAGEMENT ====================

    createSubscription(tenantId, plan, paymentDetails = {}) {
        if (!localStorage.getItem('subscriptions')) {
            localStorage.setItem('subscriptions', JSON.stringify([]));
        }

        const plans = {
            'starter': { name: 'Starter', amount: 0, currency: 'XAF' },
            'professional': { name: 'Professional', amount: 42000, currency: 'XAF' },
            'enterprise': { name: 'Enterprise', amount: 0, currency: 'XAF' }
        };

        const planData = plans[plan] || plans['starter'];
        
        const subscription = {
            id: this.generateId(),
            tenantId: tenantId,
            plan: plan,
            planName: planData.name,
            amount: planData.amount,
            currency: planData.currency,
            paymentMethod: paymentDetails.method || 'mobile_money',
            mobileNumber: paymentDetails.mobileNumber || '+237 683 134 568',
            status: 'active',
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            autoRenew: true,
            paymentHistory: [],
            createdAt: new Date().toISOString()
        };

        const subscriptions = JSON.parse(localStorage.getItem('subscriptions'));
        subscriptions.push(subscription);
        localStorage.setItem('subscriptions', JSON.stringify(subscriptions));

        return subscription;
    }

    getSubscription(tenantId) {
        if (!localStorage.getItem('subscriptions')) {
            return null;
        }
        const subscriptions = JSON.parse(localStorage.getItem('subscriptions'));
        return subscriptions.find(s => s.tenantId === tenantId && s.status === 'active');
    }

    getAllSubscriptions() {
        if (!localStorage.getItem('subscriptions')) {
            return [];
        }
        return JSON.parse(localStorage.getItem('subscriptions'));
    }

    updateSubscriptionStatus(tenantId, status) {
        if (!localStorage.getItem('subscriptions')) {
            return null;
        }

        const subscriptions = JSON.parse(localStorage.getItem('subscriptions'));
        const subscription = subscriptions.find(s => s.tenantId === tenantId && s.status === 'active');
        
        if (subscription) {
            subscription.status = status;
            subscription.updatedAt = new Date().toISOString();
        }

        localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
        return subscription;
    }

    upgradePlan(tenantId, newPlan) {
        const subscription = this.getSubscription(tenantId);
        if (!subscription) return null;

        const plans = {
            'starter': 15000,
            'professional': 42000,
            'enterprise': 0
        };

        subscription.plan = newPlan;
        subscription.amount = plans[newPlan] || 0;
        subscription.updatedAt = new Date().toISOString();

        const subscriptions = JSON.parse(localStorage.getItem('subscriptions'));
        const index = subscriptions.findIndex(s => s.tenantId === tenantId && s.status === 'active');
        if (index >= 0) {
            subscriptions[index] = subscription;
        }

        localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
        return subscription;
    }

    // ==================== PAYMENT MANAGEMENT ====================

    createPayment(tenantId, amount, method = 'mobile_money', mobileNumber = '+237 683 134 568', userDetails = {}) {
        if (!localStorage.getItem('payments')) {
            localStorage.setItem('payments', JSON.stringify([]));
        }

        const payment = {
            id: this.generateId(),
            tenantId: tenantId,
            amount: amount,
            currency: 'XAF',
            method: method,
            mobileNumber: mobileNumber,
            userMobileNumber: userDetails.userMobileNumber || '',
            userEmail: userDetails.userEmail || '',
            userName: userDetails.userName || '',
            status: 'completed',
            reference: 'MP-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            createdAt: new Date().toISOString()
        };

        const payments = JSON.parse(localStorage.getItem('payments'));
        payments.push(payment);
        localStorage.setItem('payments', JSON.stringify(payments));

        return payment;
    }

    getPaymentHistory(tenantId) {
        if (!localStorage.getItem('payments')) {
            return [];
        }
        const payments = JSON.parse(localStorage.getItem('payments'));
        return payments.filter(p => p.tenantId === tenantId);
    }

    verifyPayment(paymentId) {
        if (!localStorage.getItem('payments')) {
            return null;
        }
        const payments = JSON.parse(localStorage.getItem('payments'));
        return payments.find(p => p.id === paymentId);
    }

    // ==================== INVOICE MANAGEMENT ====================

    generateInvoice(tenantId, subscriptionId) {
        const subscription = this.getSubscription(tenantId);
        const tenant = this.getTenant(tenantId);

        if (!subscription || !tenant) return null;

        const invoice = {
            id: this.generateId(),
            invoiceNumber: 'INV-' + Date.now(),
            tenantId: tenantId,
            subscriptionId: subscriptionId,
            amount: subscription.amount,
            currency: subscription.currency,
            plan: subscription.planName,
            billDate: new Date().toISOString(),
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            businessName: tenant.name,
            businessEmail: tenant.email,
            paymentMethod: 'Mobile Money',
            mobileNumber: subscription.mobileNumber,
            status: 'paid',
            description: `${subscription.planName} Plan - Monthly Subscription`
        };

        if (!localStorage.getItem('invoices')) {
            localStorage.setItem('invoices', JSON.stringify([]));
        }

        const invoices = JSON.parse(localStorage.getItem('invoices'));
        invoices.push(invoice);
        localStorage.setItem('invoices', JSON.stringify(invoices));

        return invoice;
    }

    getInvoices(tenantId) {
        if (!localStorage.getItem('invoices')) {
            return [];
        }
        const invoices = JSON.parse(localStorage.getItem('invoices'));
        return invoices.filter(i => i.tenantId === tenantId);
    }

    // ==================== BILLING MANAGEMENT ====================

    getSubscriptionDetails(tenantId) {
        const subscription = this.getSubscription(tenantId);
        const payments = this.getPaymentHistory(tenantId);
        const invoices = this.getInvoices(tenantId);

        return {
            subscription: subscription,
            paymentHistory: payments,
            invoices: invoices,
            totalPaid: payments.reduce((sum, p) => sum + p.amount, 0),
            nextBillingDate: subscription ? new Date(subscription.endDate) : null,
            daysUntilRenewal: subscription ? Math.ceil((new Date(subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24)) : 0
        };
    }

    // ==================== PAYMENT VERIFICATION ====================
    
    verifyAndActivateSubscription(tenantId, paymentReference) {
        // Check if payment exists
        const payment = this.verifyPayment(paymentReference);
        
        if (!payment || payment.tenantId !== tenantId) {
            return { success: false, message: 'Payment not found or invalid' };
        }
        
        if (payment.status !== 'verified') {
            return { success: false, message: 'Payment not verified by admin' };
        }
        
        // Check if subscription already exists
        const existingSubscription = this.getSubscription(tenantId);
        
        if (existingSubscription) {
            return { success: false, message: 'Subscription already active' };
        }
        
        // Determine plan based on payment amount
        let plan = 'professional';
        if (payment.amount >= 42000) {
            plan = 'professional';
        } else if (payment.amount === 0) {
            plan = 'enterprise';
        }
        
        // Create subscription
        const subscription = this.createSubscription(tenantId, plan, {
            method: payment.method,
            mobileNumber: payment.mobileNumber
        });
        
        // Link payment to subscription
        subscription.paymentHistory.push({
            paymentId: payment.id,
            amount: payment.amount,
            date: payment.createdAt,
            reference: payment.reference
        });
        
        // Update subscription
        const subscriptions = JSON.parse(localStorage.getItem('subscriptions'));
        const index = subscriptions.findIndex(s => s.tenantId === tenantId);
        if (index >= 0) {
            subscriptions[index] = subscription;
            localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
        }
        
        // Generate invoice
        this.generateInvoice(tenantId, subscription.id);
        
        return { success: true, subscription: subscription, message: 'Subscription activated successfully' };
    }
    
    checkPaymentStatus(tenantId) {
        const payments = this.getPaymentHistory(tenantId);
        const subscription = this.getSubscription(tenantId);
        
        // Find verified payments without active subscription
        const verifiedPayments = payments.filter(p => p.status === 'verified');
        
        if (verifiedPayments.length > 0 && (!subscription || subscription.status !== 'active')) {
            // Auto-activate subscription with most recent verified payment
            const latestPayment = verifiedPayments[verifiedPayments.length - 1];
            return this.verifyAndActivateSubscription(tenantId, latestPayment.id);
        }
        
        return { success: false, message: 'No verified payments found' };
    }

    renewSubscription(tenantId) {
        const subscription = this.getSubscription(tenantId);
        if (!subscription) return null;

        subscription.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        subscription.renewalDate = new Date().toISOString();

        const subscriptions = JSON.parse(localStorage.getItem('subscriptions'));
        const index = subscriptions.findIndex(s => s.tenantId === tenantId && s.status === 'active');
        if (index >= 0) {
            subscriptions[index] = subscription;
        }

        localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
        
        // Generate invoice for renewal
        this.generateInvoice(tenantId, subscription.id);

        return subscription;
    }

    cancelSubscription(tenantId, reason = '') {
        const subscription = this.getSubscription(tenantId);
        if (!subscription) return null;

        subscription.status = 'cancelled';
        subscription.cancelledAt = new Date().toISOString();
        subscription.cancellationReason = reason;

        const subscriptions = JSON.parse(localStorage.getItem('subscriptions'));
        const index = subscriptions.findIndex(s => s.tenantId === tenantId && s.status === 'active');
        if (index >= 0) {
            subscriptions[index] = subscription;
        }

        localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
        return subscription;
    }
}

// Initialize database
const db = new Database();
