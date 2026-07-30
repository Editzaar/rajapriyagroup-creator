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
              <label for="loginPassword">Password</label>
              <input type="password" id="loginPassword" placeholder="••••••••" required>
            </div>
            <button type="submit" class="auth-submit-btn">Sign In →</button>
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

    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
  }

  function switchTab(tab) {
    const tl = document.getElementById('authTabLogin');
    const tr = document.getElementById('authTabRegister');
    const fl = document.getElementById('loginForm');
    const fr = document.getElementById('registerForm');
    showAlert('');
    if (tab === 'login') {
      tl.classList.add('active'); tr.classList.remove('active');
      fl.classList.add('active'); fr.classList.remove('active');
    } else {
      tr.classList.add('active'); tl.classList.remove('active');
      fr.classList.add('active'); fl.classList.remove('active');
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
    showAlert('Account created! Taking you to your dashboard...', 'success');
    RPG.Session.setClient(user);
    setTimeout(() => {
      closeAuthModal();
      updateNavbarUI();
      window.location.href = 'dashboard.html';
    }, 800);
  }

  /* ---- Navbar Update ---- */
  function updateNavbarUI() {
    const navCta = document.querySelector('.nav-cta');
    if (!navCta) return;
    let container = document.getElementById('navAuthContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'navAuthContainer';
      container.className = 'nav-user-container';
      navCta.appendChild(container);
    }
    // Hide original CTA buttons
    navCta.querySelectorAll('a.btn').forEach(b => b.style.display = 'none');

    const user = RPG.Session.getClient();
    if (user) {
      const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';
      container.innerHTML = `
        <div class="nav-user-badge">
          <span class="user-avatar">${initial}</span>
          <span>${user.name.split(' ')[0]}</span>
        </div>
        <div class="user-dropdown">
          <a href="dashboard.html">📊 My Dashboard</a>
          <div class="user-dropdown-divider"></div>
          <button onclick="RPG.Session.logoutClient(); window.location.reload()">🚪 Log Out</button>
        </div>`;
    } else {
      container.innerHTML = `
        <button class="btn btn-outline" onclick="openAuthModal('login')">Sign In</button>
        <button class="btn btn-gold" onclick="openAuthModal('register')">Register Free</button>`;
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
