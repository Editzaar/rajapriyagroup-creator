/* =========================================================
   RAJA PRIYA GROUP — DASHBOARD.JS
   Client dashboard logic: bookings, payments, training, chat, profile
   ========================================================= */
(function () {
  'use strict';

  let currentUser = null;
  let chatPollInterval = null;

  /* ---- Guard ---- */
  function init() {
    currentUser = RPG.Session.getClient();
    if (!currentUser) {
      window.location.href = 'index.html';
      return;
    }
    // Re-read fresh user from store
    const fresh = RPG.Users.findById(currentUser.id);
    if (fresh) {
      currentUser = fresh;
      RPG.Session.setClient(fresh);
    }
    setupNavHeader();
    setupSidebar();
    loadOverview();
    setupChat();
    setupProfile();
    setupBookService();
    updateBadges();
    setInterval(updateBadges, 3000);
  }

  /* ---- Sidebar User Header ---- */
  function setupNavHeader() {
    const nameEl = document.getElementById('dashUserName');
    const roleEl = document.getElementById('dashUserRole');
    const avatarEl = document.getElementById('dashAvatar');
    const overviewName = document.getElementById('overviewName');
    if (nameEl) nameEl.textContent = currentUser.name || 'Client';
    if (roleEl) roleEl.textContent = currentUser.interest || 'Member';
    if (avatarEl) avatarEl.textContent = (currentUser.name || 'C').charAt(0).toUpperCase();
    if (overviewName) overviewName.textContent = currentUser.name ? currentUser.name.split(' ')[0] : 'Client';

    document.getElementById('dashLogoutBtn').addEventListener('click', () => {
      RPG.Session.logoutClient();
      window.location.href = 'index.html';
    });
  }

  /* ---- Sidebar Nav ---- */
  function setupSidebar() {
    document.querySelectorAll('.dash-nav-item').forEach(item => {
      item.addEventListener('click', () => {
        document.querySelectorAll('.dash-nav-item').forEach(i => i.classList.remove('active'));
        document.querySelectorAll('.dash-panel').forEach(p => p.classList.remove('active'));
        item.classList.add('active');
        const panelId = 'panel-' + item.dataset.panel;
        const panel = document.getElementById(panelId);
        if (panel) {
          panel.classList.add('active');
          // Lazy-load section
          if (item.dataset.panel === 'bookings') loadBookings();
          if (item.dataset.panel === 'payments') loadPayments();
          if (item.dataset.panel === 'training') loadTraining();
          if (item.dataset.panel === 'announcements') loadAnnouncements();
          if (item.dataset.panel === 'notifications') loadNotifications();
          if (item.dataset.panel === 'chat') { startChatPoll(); renderChat(); }
          if (item.dataset.panel === 'profile') fillProfile();
        }
      });
    });
  }

  /* ---- Overview ---- */
  function loadOverview() {
    const bookings = RPG.Bookings.forClient(currentUser.id);
    const training = RPG.Training.forClient(currentUser.id);
    const paid = bookings.reduce((sum, b) => sum + (b.paidAmount || 0), 0);
    const total = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const balance = total - paid;
    const completed = bookings.filter(b => b.status === 'Completed').length;

    setText('stat-bookings', bookings.length);
    setText('stat-completed', completed);
    setText('stat-paid', '₹' + paid.toLocaleString('en-IN'));
    setText('stat-balance', '₹' + balance.toLocaleString('en-IN'));
    setText('stat-training', training.length);

    const annEl = document.getElementById('overviewAnnouncements');
    if (annEl) {
      const anns = RPG.Announcements.all().slice(0, 3);
      if (!anns.length) { annEl.innerHTML = '<p style="color:var(--color-gray);font-size:.9rem">No announcements yet.</p>'; return; }
      annEl.innerHTML = anns.map(a => `
        <div class="announcement-card">
          <h4>${esc(a.title)}</h4>
          <p>${esc(a.body)}</p>
          <div class="announcement-time">${esc(a.createdAt)}</div>
        </div>`).join('');
    }
  }

  window.switchClientTab = function(panelName) {
    const item = document.querySelector(`.dash-nav-item[data-panel="${panelName}"]`);
    if (item) item.click();
  };

  /* ---- Bookings ---- */
  function loadBookings() {
    const bookings = RPG.Bookings.forClient(currentUser.id);
    const tbody = document.getElementById('bookingsTableBody');
    if (!tbody) return;
    if (!bookings.length) {
      tbody.innerHTML = '<tr><td colspan="8"><div class="empty-state"><div class="empty-icon">📦</div><p>No bookings yet. Click "Book a Service" to create your first booking.</p></div></td></tr>';
      return;
    }
    tbody.innerHTML = bookings.map(b => {
      const balance = (b.totalAmount || 0) - (b.paidAmount || 0);
      return `<tr>
        <td><strong>${esc(b.id)}</strong></td>
        <td>${esc(b.projectName)}</td>
        <td>${esc(b.type || '-')}</td>
        <td>₹${(b.totalAmount || 0).toLocaleString('en-IN')}</td>
        <td style="color:#51cf66">₹${(b.paidAmount || 0).toLocaleString('en-IN')}</td>
        <td style="color:#ffc107">₹${balance.toLocaleString('en-IN')}</td>
        <td>${statusBadge(b.status)}</td>
        <td>${esc(b.createdAt)}</td>
      </tr>`;
    }).join('');
  }

  /* ---- Payments ---- */
  function loadPayments() {
    const bookings = RPG.Bookings.forClient(currentUser.id);
    const el = document.getElementById('paymentsContent');
    if (!el) return;
    if (!bookings.length) {
      el.innerHTML = '<div class="empty-state"><div class="empty-icon">💰</div><p>No payment records found. Submit a service booking to make your first payment.</p></div>';
      return;
    }
    const totalAmount = bookings.reduce((s, b) => s + (b.totalAmount || 0), 0);
    const totalPaid   = bookings.reduce((s, b) => s + (b.paidAmount  || 0), 0);
    const totalBalance = totalAmount - totalPaid;
    el.innerHTML = `
      <div class="stats-grid" style="margin-bottom:24px">
        <div class="stat-card"><div class="stat-icon">💵</div><div class="stat-value">₹${totalAmount.toLocaleString('en-IN')}</div><div class="stat-label">Total Booking Value</div></div>
        <div class="stat-card"><div class="stat-icon">✅</div><div class="stat-value" style="color:#51cf66">₹${totalPaid.toLocaleString('en-IN')}</div><div class="stat-label">Amount Paid</div></div>
        <div class="stat-card"><div class="stat-icon">⏳</div><div class="stat-value" style="color:#ffc107">₹${totalBalance.toLocaleString('en-IN')}</div><div class="stat-label">Balance Due</div></div>
      </div>
      <div class="section-card">
        <h3>Payment History & Receipts</h3>
        <table class="data-table">
          <thead><tr><th>Booking ID</th><th>Project / Service</th><th>Total</th><th>Paid</th><th>Balance</th><th>Payment Method</th><th>Txn / Ref ID</th><th>Status</th></tr></thead>
          <tbody>${bookings.map(b => `<tr>
            <td>${esc(b.id)}</td><td>${esc(b.projectName)}</td>
            <td>₹${(b.totalAmount||0).toLocaleString('en-IN')}</td>
            <td style="color:#51cf66; font-weight:700;">₹${(b.paidAmount||0).toLocaleString('en-IN')}</td>
            <td style="color:#ffc107">₹${((b.totalAmount||0)-(b.paidAmount||0)).toLocaleString('en-IN')}</td>
            <td><span style="font-size:0.8rem; color:var(--color-gold);">${esc(b.payMethod || 'UPI / Online')}</span></td>
            <td><span style="font-family:monospace; font-size:0.8rem;">${esc(b.txnId || 'N/A')}</span></td>
            <td>${statusBadge(b.status)}</td>
          </tr>`).join('')}</tbody>
        </table>
      </div>`;
  }

  /* ---- Training ---- */
  function loadTraining() {
    const sessions = RPG.Training.forClient(currentUser.id);
    const el = document.getElementById('trainingContent');
    if (!el) return;
    if (!sessions.length) {
      el.innerHTML = '<div class="empty-state"><div class="empty-icon">📚</div><p>No training sessions enrolled yet.</p></div>';
      return;
    }
    el.innerHTML = sessions.map(t => `
      <div class="section-card">
        <h3>${esc(t.title)} <span style="float:right;font-size:0.85rem;color:var(--color-gray)">${statusBadge(t.status)}</span></h3>
        <p style="color:var(--color-gray);font-size:.9rem;margin-bottom:10px">${esc(t.description || '')}</p>
        <div style="display:flex;justify-content:space-between;font-size:.82rem;color:var(--color-gray);margin-bottom:6px">
          <span>Progress</span><span>${t.progress || 0}%</span>
        </div>
        <div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${t.progress || 0}%"></div></div>
        <div style="margin-top:10px;font-size:.8rem;color:var(--color-gray)">Enrolled: ${esc(t.createdAt)}</div>
      </div>`).join('');
  }

  /* ---- Announcements ---- */
  function loadAnnouncements() {
    const el = document.getElementById('allAnnouncements');
    if (!el) return;
    const anns = RPG.Announcements.all();
    if (!anns.length) { el.innerHTML = '<p style="color:var(--color-gray)">No announcements yet.</p>'; return; }
    el.innerHTML = `<h3>All Announcements</h3>` + anns.map(a => `
      <div class="announcement-card">
        <h4>${esc(a.title)}</h4>
        <p>${esc(a.body)}</p>
        <div class="announcement-time">📅 ${esc(a.createdAt)} — Posted by ${esc(a.postedBy || 'Team')}</div>
      </div>`).join('');
  }

  /* ---- Notifications ---- */
  function loadNotifications() {
    const el = document.getElementById('notificationsContent');
    if (!el) return;
    RPG.Notifications.markRead(currentUser.id);
    const notifs = RPG.Notifications.forClient(currentUser.id);
    if (!notifs.length) { el.innerHTML = '<h3>Notifications</h3><p style="color:var(--color-gray)">You have no notifications yet.</p>'; return; }
    el.innerHTML = '<h3>Notifications</h3>' + notifs.map(n => `
      <div class="notif-item">
        <div class="notif-dot ${n.read ? 'read' : ''}"></div>
        <div><div class="notif-text">${esc(n.message)}</div><div class="notif-time">${esc(n.time)}</div></div>
      </div>`).join('');
  }

  /* ---- Chat ---- */
  function setupChat() {
    const sendBtn = document.getElementById('chatSendBtn');
    const input = document.getElementById('chatInput');
    if (!sendBtn || !input) return;
    sendBtn.addEventListener('click', sendMsg);
    input.addEventListener('keypress', e => { if (e.key === 'Enter') sendMsg(); });
  }

  function sendMsg() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;
    RPG.Chat.sendMessage(currentUser.id, currentUser.id, currentUser.name, 'client', text);
    input.value = '';
    renderChat();
  }

  function renderChat() {
    if (!currentUser) return;
    const thread = RPG.Chat.getThread(currentUser.id);
    RPG.Chat.markRead(currentUser.id, 'client');
    const el = document.getElementById('chatMessages');
    if (!el) return;
    if (!thread.length) {
      el.innerHTML = '<div class="empty-state"><div class="empty-icon">💬</div><p>Start a conversation with our team!</p></div>';
      return;
    }
    el.innerHTML = thread.map(m => {
      const isSent = m.senderRole === 'client';
      return `<div>
        <div class="chat-sender">${isSent ? 'You' : esc(m.senderName)}</div>
        <div class="chat-bubble ${isSent ? 'sent' : 'received'}">${esc(m.text)}</div>
        <div class="chat-time" style="text-align:${isSent ? 'right' : 'left'}">${esc(m.time)}</div>
      </div>`;
    }).join('');
    el.scrollTop = el.scrollHeight;
  }

  function startChatPoll() {
    if (chatPollInterval) clearInterval(chatPollInterval);
    chatPollInterval = setInterval(renderChat, 2500);
  }

  /* ---- Profile ---- */
  function fillProfile() {
    setValue('pName', currentUser.name);
    setValue('pEmail', currentUser.email);
    setValue('pPhone', currentUser.phone);
    setValue('pProfession', currentUser.profession);
    setValue('pCity', currentUser.city);
    setValue('pInterest', currentUser.interest);
  }

  function setupProfile() {
    const form = document.getElementById('profileForm');
    if (!form) return;
    form.addEventListener('submit', e => {
      e.preventDefault();
      const updated = {
        ...currentUser,
        name: document.getElementById('pName').value.trim(),
        phone: document.getElementById('pPhone').value.trim(),
        profession: document.getElementById('pProfession').value.trim(),
        city: document.getElementById('pCity').value.trim()
      };
      const pw = document.getElementById('pPassword').value;
      if (pw) updated.password = pw;
      RPG.Users.save(updated);
      RPG.Session.setClient(updated);
      currentUser = updated;
      const msg = document.getElementById('profileMsg');
      if (msg) { msg.style.display = 'block'; setTimeout(() => msg.style.display = 'none', 3000); }
      setupNavHeader();
    });
  }

  /* ---- Book Service Form ---- */
  function setupBookService() {
    const form = document.getElementById('clientBookForm');
    if (!form) return;
    form.addEventListener('submit', e => {
      e.preventDefault();
      const type = document.getElementById('bookServiceType').value;
      const projectName = document.getElementById('bookProjectName').value.trim();
      const totalAmount = parseFloat(document.getElementById('bookAmount').value) || 0;
      const paidAmount = parseFloat(document.getElementById('bookAdvance').value) || 0;
      const notes = document.getElementById('bookNotes').value.trim();

      if (!projectName || !totalAmount) return;

      const payMethod = document.getElementById('bookPayMethod')?.value || 'UPI';
      const txnId = document.getElementById('bookTxnId')?.value.trim() || 'N/A';

      const booking = RPG.Bookings.create({
        clientId: currentUser.id,
        projectName,
        type,
        totalAmount,
        paidAmount,
        payMethod,
        txnId,
        notes,
        status: 'Pending'
      });

      // Add notification for client
      RPG.Notifications.add(currentUser.id, `Your booking request for "${projectName}" (ID: ${booking.id}) has been submitted.`);
      
      // Auto-send chat message to team to notify staff
      RPG.Chat.sendMessage(currentUser.id, currentUser.id, currentUser.name, 'client', `[NEW BOOKING REQUEST] I submitted a request for "${projectName}" (${type}) - Total: ₹${totalAmount.toLocaleString('en-IN')}, Paid: ₹${paidAmount.toLocaleString('en-IN')} via ${payMethod} (Txn: ${txnId}). Notes: ${notes}`);

      const msg = document.getElementById('bookSuccessMsg');
      if (msg) {
        msg.style.display = 'block';
        setTimeout(() => msg.style.display = 'none', 4000);
      }
      form.reset();
      loadOverview();
      updateBadges();
    });
  }

  /* ---- Badges ---- */
  function updateBadges() {
    const unread = RPG.Chat.unreadCount(currentUser.id, 'client');
    const notifs = RPG.Notifications.forClient(currentUser.id).filter(n => !n.read).length;
    const bookings = RPG.Bookings.forClient(currentUser.id).length;
    toggleBadge('chatBadge', unread);
    toggleBadge('notifBadge', notifs);
    toggleBadge('bookingCountBadge', bookings);
  }

  /* ---- Helpers ---- */
  function esc(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
  function setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }
  function setValue(id, val) { const el = document.getElementById(id); if (el) el.value = val || ''; }
  function toggleBadge(id, count) {
    const el = document.getElementById(id);
    if (!el) return;
    if (count > 0) { el.style.display = ''; el.textContent = count; }
    else el.style.display = 'none';
  }
  function statusBadge(status) {
    const map = { Pending: 'pending', Confirmed: 'confirmed', 'In Progress': 'inprogress', Completed: 'completed', Enrolled: 'enrolled' };
    return `<span class="status-badge ${map[status] || 'pending'}">${status || 'Pending'}</span>`;
  }

  document.addEventListener('DOMContentLoaded', init);
})();
