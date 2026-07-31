/* =========================================================
   RAJA PRIYA GROUP — AUTH.JS (Updated)
   Handles: Client login/register, page guards, 5s auto-popup
   ========================================================= */
(function () {
  'use strict';

  /* ---- Modal HTML ---- */
  function injectAuthModal() {
    if (document.getElementById('authModalOverlay')) return;
    document.body.insertAdjacentHTML('beforeend', `
      <div class="auth-modal-overlay" id="authModalOverlay">
        <div class="auth-modal">
          <button class="auth-close-btn" id="authCloseBtn" aria-label="Close">&times;</button>
          <div class="auth-header">
            <h3 id="authModalTitle">Welcome to Raja Priya Group</h3>
            <p id="authModalSub">Sign in or create your free account</p>
          </div>
          <div class="auth-tabs">
            <button class="auth-tab-btn active" id="authTabLogin">Sign In</button>
            <button class="auth-tab-btn" id="authTabRegister">Register Free</button>
          </div>
          <div class="auth-alert" id="authAlert"></div>
 
          <!-- LOGIN -->
          <form class="auth-form active" id="loginForm">
            <div class="form-group">
              <label for="loginEmail">Email Address</label>
              <input type="email" id="loginEmail" placeholder="you@example.com" required>
            </div>
            <div class="form-group">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                <label for="loginPassword" style="margin: 0;">Password</label>
                <button type="button" id="authForgotBtn" style="background:none; border:none; color:var(--color-gold); font-size:0.75rem; cursor:pointer; padding:0; font-family:var(--font-body); font-weight:600;">Forgot Password?</button>
              </div>
              <input type="password" id="loginPassword" placeholder="••••••••" required>
            </div>
            <button type="submit" class="auth-submit-btn" style="margin-top: 10px;">Sign In →</button>
          </form>

          <!-- FORGOT PASSWORD -->
          <form class="auth-form" id="forgotForm" style="display:none;">
            <div class="form-group">
              <label for="forgotEmail">Registered Email Address</label>
              <input type="email" id="forgotEmail" placeholder="you@example.com" required>
            </div>
            <div class="form-group">
              <label for="forgotNewPassword">Choose New Password</label>
              <input type="password" id="forgotNewPassword" placeholder="Min 6 characters" minlength="6" required>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
              <button type="button" id="authBackToLoginBtn" style="background:none; border:none; color:var(--color-gray); font-size:0.8rem; cursor:pointer; padding:0;">← Back to Sign In</button>
              <button type="submit" class="auth-submit-btn" style="width:auto; margin:0; padding:10px 20px;">Reset Password →</button>
            </div>
          </form>
 
          <!-- REGISTER -->
          <form class="auth-form" id="registerForm">
            <div class="form-group">
              <label for="regName">Full Name</label>
              <input type="text" id="regName" placeholder="Your full name" required>
            </div>
            <div class="form-group">
              <label for="regEmail">Email Address</label>
              <input type="email" id="regEmail" placeholder="you@example.com" required>
            </div>
            <div class="form-group">
              <label for="regPhone">Phone Number</label>
              <input type="tel" id="regPhone" placeholder="+91 9876543210">
            </div>
            <div class="form-group">
              <label for="regProfession">Profession</label>
              <input type="text" id="regProfession" placeholder="e.g. Business Owner, Software Engineer">
            </div>
            <div class="form-group">
              <label for="regCity">City</label>
              <input type="text" id="regCity" placeholder="e.g. Hyderabad">
            </div>
            <div class="form-group">
              <label for="regRole">I'm Interested In</label>
              <select id="regRole">
                <option value="Property Buyer">Real Estate / Plot Buyer</option>
                <option value="Construction Client">Construction / Architecture</option>
                <option value="Business Brand">Brand Promotion / Social Media</option>
                <option value="Investor / Partner">Investor / Business Partner</option>
              </select>
            </div>
            <div class="form-group">
              <label for="regPassword">Create Password</label>
              <input type="password" id="regPassword" placeholder="Min 6 characters" minlength="6" required>
            </div>
            <button type="submit" class="auth-submit-btn">Create Free Account →</button>
          </form>
 
        </div>
      </div>
    `);
    attachEvents();
  }

  /* ---- Tab & Events ---- */
  function attachEvents() {
    const overlay = document.getElementById('authModalOverlay');
    document.getElementById('authCloseBtn').addEventListener('click', closeAuthModal);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeAuthModal(); });

    document.getElementById('authTabLogin').addEventListener('click', () => switchTab('login'));
    document.getElementById('authTabRegister').addEventListener('click', () => switchTab('register'));
    document.getElementById('authForgotBtn').addEventListener('click', () => switchTab('forgot'));
    document.getElementById('authBackToLoginBtn').addEventListener('click', () => switchTab('login'));

    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('forgotForm').addEventListener('submit', handleForgotPassword);
  }

  function switchTab(tab) {
    const tl = document.getElementById('authTabLogin');
    const tr = document.getElementById('authTabRegister');
    const fl = document.getElementById('loginForm');
    const fr = document.getElementById('registerForm');
    const ff = document.getElementById('forgotForm');
    showAlert('');
    if (tab === 'login') {
      tl.style.display = ''; tr.style.display = '';
      tl.classList.add('active'); tr.classList.remove('active');
      fl.style.display = 'block'; fr.style.display = 'none'; ff.style.display = 'none';
      document.getElementById('authModalTitle').textContent = 'Welcome to Raja Priya Group';
      document.getElementById('authModalSub').textContent = 'Sign in or create your free account';
    } else if (tab === 'register') {
      tl.style.display = ''; tr.style.display = '';
      tr.classList.add('active'); tl.classList.remove('active');
      fr.style.display = 'block'; fl.style.display = 'none'; ff.style.display = 'none';
      document.getElementById('authModalTitle').textContent = 'Welcome to Raja Priya Group';
      document.getElementById('authModalSub').textContent = 'Sign in or create your free account';
    } else if (tab === 'forgot') {
      tl.style.display = 'none'; tr.style.display = 'none';
      ff.style.display = 'block'; fl.style.display = 'none'; fr.style.display = 'none';
      document.getElementById('authModalTitle').textContent = 'Reset Password';
      document.getElementById('authModalSub').textContent = 'Enter your email and choose a new password';
    }
  }

  function showAlert(msg, type) {
    const a = document.getElementById('authAlert');
    if (!a) return;
    if (!msg) { a.style.display = 'none'; a.className = 'auth-alert'; return; }
    a.textContent = msg;
    a.className = 'auth-alert ' + (type || '');
  }

  /* ---- Login ---- */
  function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const pw = document.getElementById('loginPassword').value;
    const user = RPG.Users.find(email);
    if (!user) return showAlert('No account found with this email.', 'error');
    if (user.password !== pw) return showAlert('Incorrect password. Please try again.', 'error');
    if (user.status === 'blocked') return showAlert('Your account has been suspended. Contact support.', 'error');
    showAlert('Login successful! Redirecting...', 'success');
    RPG.Session.setClient(user);
    setTimeout(() => {
      closeAuthModal();
      updateNavbarUI();
      const redirect = sessionStorage.getItem('rpg_auth_redirect');
      if (redirect) { sessionStorage.removeItem('rpg_auth_redirect'); window.location.href = redirect; }
      else if (!window.location.pathname.includes('dashboard')) window.location.href = 'dashboard.html';
    }, 700);
  }

  /* ---- Register ---- */
  function handleRegister(e) {
    e.preventDefault();
    const email = document.getElementById('regEmail').value.trim();
    if (RPG.Users.find(email)) return showAlert('An account with this email already exists.', 'error');
    const user = RPG.Users.create({
      name: document.getElementById('regName').value.trim(),
      email,
      phone: document.getElementById('regPhone').value.trim(),
      profession: document.getElementById('regProfession').value.trim(),
      city: document.getElementById('regCity').value.trim(),
      interest: document.getElementById('regRole').value,
      password: document.getElementById('regPassword').value
    });

    // Auto-create welcome notification & welcome chat message for new registration
    RPG.Notifications.add(user.id, 'Welcome to Raja Priya Group! Explore our services or book your first project from your dashboard.');
    RPG.Chat.sendMessage(user.id, 'team_welcome', 'Raja Priya Group Team', 'owner', `Welcome to Raja Priya Group, ${user.name}! 👋 How can we assist you today? Feel free to ask any questions or request a booking.`);

    showAlert('Account created! Taking you to your dashboard...', 'success');
    RPG.Session.setClient(user);
    setTimeout(() => {
      closeAuthModal();
      updateNavbarUI();
      window.location.href = 'dashboard.html';
    }, 800);
  }

  /* ---- Forgot Password ---- */
  function handleForgotPassword(e) {
    e.preventDefault();
    const email = document.getElementById('forgotEmail').value.trim();
    const newPassword = document.getElementById('forgotNewPassword').value;

    const user = RPG.Users.find(email);
    if (!user) return showAlert('No account found with this email.', 'error');
    if (user.status === 'blocked') return showAlert('Your account has been suspended. Contact support.', 'error');

    showAlert('Resetting password...', 'success');

    user.password = newPassword;
    RPG.Users.save(user);

    RPG.Notifications.add(user.id, 'Your password has been reset successfully.');

    setTimeout(() => {
      showAlert('Password reset successfully! Logging you in...', 'success');
      RPG.Session.setClient(user);
      setTimeout(() => {
        closeAuthModal();
        updateNavbarUI();
        const redirect = sessionStorage.getItem('rpg_auth_redirect');
        if (redirect) {
          sessionStorage.removeItem('rpg_auth_redirect');
          window.location.href = redirect;
        } else if (!window.location.pathname.includes('dashboard')) {
          window.location.href = 'dashboard.html';
        }
      }, 700);
    }, 1000);
  }

  /* ---- Navbar Update ---- */
  function updateNavbarUI() {
    const navCta = document.querySelector('.nav-cta');
    if (!navCta) return;
    
    // Check for landing pages mobile links container
    const navLinks = document.getElementById('navLinks');
    
    let container = document.getElementById('navAuthContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'navAuthContainer';
      container.className = 'nav-user-container';
      navCta.appendChild(container);
    }
    
    let mobileContainer = document.getElementById('mobileNavAuthContainer');
    if (navLinks && !mobileContainer) {
      mobileContainer = document.createElement('div');
      mobileContainer.id = 'mobileNavAuthContainer';
      mobileContainer.className = 'mobile-nav-auth-container';
      navLinks.appendChild(mobileContainer);
    }
    
    // Hide original static call/consultation links
    navCta.querySelectorAll('a.btn').forEach(b => b.style.display = 'none');

    const user = RPG.Session.getClient();
    if (user) {
      const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';
      const loggedInHtml = `
        <div class="nav-user-badge">
          <span class="user-avatar">${initial}</span>
          <span>${user.name.split(' ')[0]}</span>
        </div>
        <div class="user-dropdown">
          <a href="dashboard.html">📊 My Dashboard</a>
          <div class="user-dropdown-divider"></div>
          <button onclick="RPG.Session.logoutClient(); window.location.reload()">🚪 Log Out</button>
        </div>`;
      container.innerHTML = loggedInHtml;
      
      if (mobileContainer) {
        mobileContainer.innerHTML = `
          <div style="padding-top:16px; border-top:1px solid rgba(201,162,75,0.25); margin-top:20px;">
            <p style="font-size:0.68rem; font-weight:800; letter-spacing:0.2em; text-transform:uppercase; color:var(--color-gold); margin-bottom:12px;">CLIENT PORTAL</p>
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:14px; background:rgba(201,162,75,0.08); padding:10px 14px; border-radius:8px; border:1px solid rgba(201,162,75,0.2);">
              <span class="user-avatar" style="width:34px; height:34px; border-radius:50%; background:var(--gradient-gold); color:#000; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:0.9rem;">${initial}</span>
              <div>
                <div style="color:#fff; font-size:0.9rem; font-weight:700;">${user.name}</div>
                <div style="color:var(--color-gold); font-size:0.72rem; letter-spacing:0.05em;">Member Account</div>
              </div>
            </div>
            <a href="dashboard.html" class="btn btn-gold" style="display:block; text-align:center; padding:12px; font-size:0.85rem; margin-bottom:10px; border-radius:6px; text-decoration:none; color:#000; font-weight:700; box-shadow:0 6px 20px rgba(201,162,75,0.35);">📊 Access My Dashboard</a>
            <button onclick="RPG.Session.logoutClient(); window.location.reload()" class="btn btn-outline" style="display:block; width:100%; text-align:center; padding:10px; font-size:0.82rem; border-radius:6px; background:none; border:1px solid #ff6b6b; color:#ff6b6b; font-weight:600; cursor:pointer;">🚪 Log Out</button>
          </div>`;
      }
    } else {
      const loggedOutHtml = `
        <button class="btn btn-outline" onclick="openAuthModal('login')">Sign In</button>
        <button class="btn btn-gold" onclick="openAuthModal('register')">Register Free</button>`;
      container.innerHTML = loggedOutHtml;
      
      if (mobileContainer) {
        mobileContainer.innerHTML = `
          <div style="padding-top:16px; border-top:1px solid rgba(201,162,75,0.25); margin-top:20px; display:flex; flex-direction:column; gap:10px;">
            <p style="font-size:0.68rem; font-weight:800; letter-spacing:0.2em; text-transform:uppercase; color:var(--color-gold); margin-bottom:4px;">MEMBER ACCESS</p>
            <button class="btn btn-gold" onclick="openAuthModal('register')" style="width:100%; padding:13px; font-size:0.88rem; border-radius:6px; background:var(--gradient-gold); color:#000; font-weight:800; cursor:pointer; border:none; box-shadow:0 8px 24px -6px rgba(201,162,75,0.5);">✦ Register Free Account</button>
            <button class="btn btn-outline" onclick="openAuthModal('login')" style="width:100%; padding:12px; font-size:0.85rem; border-radius:6px; background:rgba(201,162,75,0.06); border:1px solid rgba(201,162,75,0.4); color:var(--color-cream); font-weight:600; cursor:pointer;">Sign In to Dashboard</button>
            <div style="display:flex; align-items:center; justify-content:space-between; margin-top:10px; padding-top:12px; border-top:1px dashed rgba(255,255,255,0.08); font-size:0.8rem;">
              <a href="tel:9476766340" style="color:var(--color-gold-light); font-weight:600; text-decoration:none; display:flex; align-items:center; gap:5px;">📞 9476766340</a>
              <a href="https://wa.me/919476766340" target="_blank" style="color:#25D366; font-weight:600; text-decoration:none; display:flex; align-items:center; gap:5px;">💬 WhatsApp</a>
            </div>
          </div>`;
      }
    }
  }

  /* ---- Page Guard ---- */
  window.requireClientAuth = function (redirectUrl) {
    if (!RPG.Session.getClient()) {
      sessionStorage.setItem('rpg_auth_redirect', redirectUrl || window.location.pathname);
      injectAuthModal();
      document.getElementById('authModalOverlay').classList.add('active');
      document.getElementById('authModalTitle').textContent = 'Sign In to Continue';
      document.getElementById('authModalSub').textContent = 'This section is available for registered members only.';
      return false;
    }
    return true;
  };

  /* ---- Public API ---- */
  window.openAuthModal = function (tab) {
    injectAuthModal();
    
    // Close landing page mobile menu if open
    const navLinks = document.querySelector('.nav-links');
    const navToggle = document.querySelector('.nav-toggle');
    const navScrim = document.getElementById('mobileNavScrim');
    if (navLinks) navLinks.classList.remove('mobile-open');
    if (navToggle) navToggle.classList.remove('is-active');
    if (navScrim) navScrim.classList.remove('active');
    document.body.style.overflow = '';

    document.getElementById('authModalOverlay').classList.add('active');
    switchTab(tab || 'login');
  };
  window.closeAuthModal = function () {
    const o = document.getElementById('authModalOverlay');
    if (o) o.classList.remove('active');
  };

  /* ---- Auto Popup (5s for new visitors) ---- */
  function startAutoPopup() {
    if (RPG.Session.getClient()) return;
    if (sessionStorage.getItem('rpg_popup_shown')) return;
    setTimeout(() => {
      if (RPG.Session.getClient()) return;
      sessionStorage.setItem('rpg_popup_shown', '1');
      injectAuthModal();
      const overlay = document.getElementById('authModalOverlay');
      overlay.classList.add('active');
      const title = document.getElementById('authModalTitle');
      const sub = document.getElementById('authModalSub');
      if (title) title.textContent = '🏡 Join Raja Priya Group!';
      if (sub) sub.textContent = 'Get exclusive access to projects, consultation booking, and client portal. It\'s free!';
      switchTab('register');
    }, 5000);
  }

  /* ---- Nav Link Guards (Services, Projects, Blog) ---- */
  function guardNavLinks() {
    const protectedPaths = ['services.html', 'projects.html'];
    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;
      const isProtected = protectedPaths.some(p => href.includes(p));
      const isBlog = href.includes('blogspot') || href.includes('blog');
      if (isProtected || isBlog) {
        link.addEventListener('click', function (e) {
          if (!RPG.Session.getClient()) {
            e.preventDefault();
            sessionStorage.setItem('rpg_auth_redirect', href);
            openAuthModal('login');
          }
        });
      }
    });
  }

  /* ---- Init ---- */
  document.addEventListener('DOMContentLoaded', () => {
    injectAuthModal();
    updateNavbarUI();
    guardNavLinks();
    startAutoPopup();
  });

})();
