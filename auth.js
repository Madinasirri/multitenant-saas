// Authentication Logic
// Switch between login and register forms
function switchForm(formType) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (formType === 'register') {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
    } else {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
    }
}

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, attaching event listeners');
    console.log('Database object:', typeof db);
    
    // Login form handler
    const loginForm = document.getElementById('loginFormElement');
    console.log('Login form element:', loginForm);
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            const user = db.verifyUser(email, password);
            
            if (user) {
                // Store user session
                localStorage.setItem('currentUser', JSON.stringify(user));
                
                // Redirect based on role
                if (user.role === 'manager') {
                    window.location.href = 'dashboard.html';
                } else {
                    window.location.href = 'worker-dashboard.html';
                }
            } else {
                const errorDiv = document.getElementById('loginError');
                errorDiv.textContent = 'Invalid email or password';
                errorDiv.classList.remove('hidden');
            }
        });
    } else {
        console.error('Login form not found');
    }

    // Register form handler
    const registerForm = document.getElementById('registerFormElement');
    console.log('Register form element:', registerForm);
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const businessName = document.getElementById('businessName').value;
            
            console.log('Registration attempt:', { name, email, businessName });
            
            // Check if user already exists
            if (db.getUserByEmail(email)) {
                const errorDiv = document.getElementById('registerError');
                errorDiv.textContent = 'User with this email already exists';
                errorDiv.classList.remove('hidden');
                return;
            }
            
            // Create tenant
            const tenant = db.createTenant({
                name: businessName,
                email: email
            });
            
            console.log('Tenant created:', tenant);
            
            // Create user (manager)
            const user = db.createUser({
                name: name,
                email: email,
                role: 'manager',
                tenantId: tenant.id
            }, password);
            
            console.log('User created:', user);
            
            if (user) {
                // Create free subscription
                db.createSubscription(tenant.id, 'free', { method: 'free', amount: 0 });
                alert('Welcome to Askia! Your account has been created successfully.');
                
                // Store user session
                localStorage.setItem('currentUser', JSON.stringify(user));
                
                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            } else {
                const errorDiv = document.getElementById('registerError');
                errorDiv.textContent = 'Registration failed';
                errorDiv.classList.remove('hidden');
            }
        });
    } else {
        console.error('Register form not found');
    }
});
