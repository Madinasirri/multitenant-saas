// Invitation Acceptance Logic
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');
let invitation = null;

// Validate invitation
function validateInvitation() {
    if (!token) {
        showError('No invitation token provided');
        return;
    }
    
    invitation = db.getInvitationByToken(token);
    
    if (!invitation) {
        showError('Invalid invitation token');
        return;
    }
    
    // Check if invitation is expired
    if (new Date(invitation.expiresAt) < new Date()) {
        showError('Invitation has expired');
        return;
    }
    
    // Check if invitation is already used
    if (invitation.used) {
        showError('Invitation has already been used');
        return;
    }
    
    // Get tenant name
    const tenant = db.getTenantById(invitation.tenantId);
    
    // Show registration form
    document.getElementById('loadingState').classList.add('hidden');
    document.getElementById('registerState').classList.remove('hidden');
    document.getElementById('tenantName').textContent = 'Complete your registration to join ' + (tenant ? tenant.name : 'the marketplace');
    document.getElementById('email').value = invitation.email;
    document.getElementById('email').readOnly = true;
}

function showError(message) {
    document.getElementById('loadingState').classList.add('hidden');
    document.getElementById('registerState').classList.add('hidden');
    document.getElementById('registerError').classList.add('hidden');
    document.getElementById('errorState').classList.remove('hidden');
    document.getElementById('errorMessage').textContent = message;
}

// Handle registration
document.getElementById('workerRegisterForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Verify email matches invitation
    if (invitation.email !== email) {
        document.getElementById('registerError').textContent = 'Email does not match invitation';
        document.getElementById('registerError').classList.remove('hidden');
        return;
    }
    
    // Check if user already exists
    if (db.getUserByEmail(email)) {
        document.getElementById('registerError').textContent = 'User with this email already exists';
        document.getElementById('registerError').classList.remove('hidden');
        return;
    }
    
    // Create user (worker)
    const user = db.createUser({
        name: name,
        email: email,
        role: 'worker',
        tenantId: invitation.tenantId
    }, password);
    
    if (!user) {
        document.getElementById('registerError').textContent = 'Registration failed';
        document.getElementById('registerError').classList.remove('hidden');
        return;
    }
    
    // Mark invitation as used
    db.markInvitationAsUsed(invitation.id);
    
    // Create employee record
    db.createEmployee({
        tenantId: invitation.tenantId,
        userId: user.id,
        name: user.name,
        email: user.email,
        role: 'worker'
    });
    
    // Store user session
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    // Redirect to worker dashboard
    window.location.href = 'worker-dashboard.html';
});

// Initialize
validateInvitation();
