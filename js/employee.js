/* =========================================================
   RAJA PRIYA GROUP — EMPLOYEE.JS
   Permission-filtered workspace logic with audit logging
   ========================================================= */
(function () {
  'use strict';

  let currentEmp = null;
  let activeChatClientId = null;
  let chatPollInterval = null;

  /* ---- PIN Gate & Persistent Session ---- */
  function init() {
    document.getElementById('empPinBtn').addEventListener('click', verifyPin);
    document.getElementById('empPinInput').addEventListener('keypress', e => { if (e.key === 'Enter') verifyPin(); });

    // Check existing 7-day session
    const saved = RPG.Session.getEmployee();
    if (saved) {
      const fresh = RPG.Employees.find(saved.id);
      if (fresh && fresh.status === 'active') {
        currentEmp = fresh;
        document.getElementById('empPinGate').style.display = 'none';
        document.getElementById('empLayout').style.display = 'flex';
        setupWorkspace();
      } else {
        RPG.Session.logoutEmployee();
      }
    }
  }

  function verifyPin() {
    const pin = document.getElementById('empPinInput').value.trim();
    const emp = RPG.Employees.findByPin(pin);
    if (!emp) {
      document.getElementById('empPinError').textContent = 'Invalid PIN or account deactivated.';
      return;
    }
    currentEmp = emp;
    RPG.Session.setEmployee(emp); // Save 7-day persistent session
    // Update last login
    RPG.Employees.save({ ...emp, lastLogin: RPG.ts() });
    RPG.AuditLog.add(emp.id, emp.name, 'Login', 'Employee logged into workspace.');
    document.getElementById('empPinGate').style.display = 'none';
    document.getElementById('empLayout').style.display = 'flex';
    setupWorkspace();
  }

  /* ---- Setup Workspace ---- */
  function setupWorkspace() {
    // Set name
    setText('empWelcomeName', currentEmp.name);
    setText('empDept', currentEmp.department || 'General');
    document.getElementById('empInfo').textContent = currentEmp.name + ' · ' + (currentEmp.department || 'Staff');

    // Hide nav items without permission
    const perms = currentEmp.permissions || {};
    document.querySelectorAll('.admin-nav-item[data-perm]').forEach(item => {
      const p = item.dataset.perm;
      if (p !== 'all' && !perms[p]) item.style.display = 'none';
    });

    // Load stats
    loadStats();

    // Sidebar navigation
    document.querySelectorAll('.admin-nav-item').forEach(item => {
      item.addEventListener('click', () => {
        if (item.style.display === 'none') return;
        switchTab(item.dataset.tab);
      });
    });

    // Logout
    document.getElementById('empLogoutBtn').addEventListener('click', () => {
      RPG.AuditLog.add(currentEmp.id, currentEmp.name, 'Logout', 'Employee logged out.');
      RPG.Session.logoutEmployee();
      currentEmp = null;
      location.reload();
    });

    // Module-specific setup
    setupClients();
    setupBookings();
    setupChat();
    setupAnnouncements();
    setupProjects();
    setupPayments();

    // Poll unread badges & active tab content every 2 seconds
    setInterval(() => {
      updateChatBadge();
      const activePanel = document.querySelector('.admin-panel.active');
      if (!activePanel) return;
      const tabId = activePanel.id.replace('emp-tab-', '');
      if (tabId === 'dashboard') loadStats();
      else if (tabId === 'clients') renderClients(document.getElementById('empClientSearch')?.value);
      else if (tabId === 'bookings') renderBookings();
      else if (tabId === 'payments') renderPayments();
      else if (tabId === 'projects') renderProjects();
      else if (tabId === 'announcements') renderAnnouncements();
    }, 2000);
  }

  function switchTab(tab) {
    document.querySelectorAll('.admin-nav-item').forEach(i => i.classList.remove('active'));
    document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
    const navEl = document.getElementById('empNav-' + tab);
    if (navEl) navEl.classList.add('active');
    const panel = document.getElementById('emp-tab-' + tab);
    if (panel) panel.classList.add('active');
    if (tab === 'clients') renderClients();
    if (tab === 'bookings') renderBookings();
    if (tab === 'chat') { renderChatList(); startChatPoll(); }
    if (tab === 'announcements') renderAnnouncements();
    if (tab === 'projects') renderProjects();
    if (tab === 'payments') renderPayments();
  }

  /* ---- Stats ---- */
  function loadStats() {
    setText('emp-stat-clients', RPG.Users.all().length);
    setText('emp-stat-bookings', RPG.Bookings.all().length);
    const chats = Object.keys(RPG.Chat.allThreads()).length;
    setText('emp-stat-chats', chats);
  }

  /* ---- Clients ---- */
  function setupClients() {
    const search = document.getElementById('empClientSearch');
    if (search) search.addEventListener('input', () => renderClients(search.value));
  }

  function renderClients(filter) {
    const tbody = document.getElementById('empClientsBody');
    if (!tbody) return;
    let users = RPG.Users.all();
    if (filter) {
      const f = filter.toLowerCase();
      users = users.filter(u => (u.name||'').toLowerCase().includes(f) || (u.email||'').toLowerCase().includes(f) || (u.city||'').toLowerCase().includes(f));
    }
    if (!users.length) { tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--color-gray);padding:24px">No clients found.</td></tr>'; return; }
    const canDetail = currentEmp.permissions.view_client_details;
    tbody.innerHTML = users.map(u => `<tr>
      <td><strong>${esc(u.name)}</strong></td>
      <td>${canDetail ? esc(u.email) : '••••@••••'}</td>
      <td>${canDetail ? esc(u.phone || '-') : '••••••'}</td>
      <td>${esc(u.city || '-')}</td>
      <td>${esc(u.interest || '-')}</td>
      <td><span class="status-badge ${u.status === 'blocked' ? 'pending' : 'completed'}">${u.status || 'active'}</span></td>
      <td>
        ${currentEmp.permissions.chat_with_clients ? `<button class="admin-action-btn primary" onclick="empOpenChat('${u.id}')">💬 Chat</button>` : ''}
        ${currentEmp.permissions.manage_bookings ? `<button class="admin-action-btn success" onclick="empOpenNewBooking('${u.id}')">+ Booking</button>` : ''}
      </td>
    </tr>`).join('');
  }

  /* ---- Bookings ---- */
  function setupBookings() {
    const btn = document.getElementById('empNewBookingBtn');
    if (btn) btn.addEventListener('click', () => openModal('empBookingModal'));
    const closeBtn = document.getElementById('empBookingModalClose');
    if (closeBtn) closeBtn.addEventListener('click', () => closeModal('empBookingModal'));
    const saveBtn = document.getElementById('empBookingSaveBtn');
    if (saveBtn) saveBtn.addEventListener('click', saveBooking);

    // Populate client dropdown
    const sel = document.getElementById('mbClientId');
    if (sel) {
      RPG.Users.all().forEach(u => {
        const opt = document.createElement('option');
        opt.value = u.id;
        opt.textContent = u.name + ' (' + u.email + ')';
        sel.appendChild(opt);
      });
    }
  }

  window.empOpenNewBooking = function (clientId) {
    openModal('empBookingModal');
    const sel = document.getElementById('mbClientId');
    if (sel && clientId) sel.value = clientId;
  };

  function saveBooking() {
    const clientId = document.getElementById('mbClientId').value;
    const projectName = document.getElementById('mbProjectName').value.trim();
    if (!clientId || !projectName) return toast('Please fill all required fields.', 'error');
    const b = RPG.Bookings.create({
      clientId,
      projectName,
      type: document.getElementById('mbType').value,
      totalAmount: parseFloat(document.getElementById('mbTotal').value) || 0,
      paidAmount: parseFloat(document.getElementById('mbPaid').value) || 0,
      notes: document.getElementById('mbNotes').value.trim()
    });
    RPG.AuditLog.add(currentEmp.id, currentEmp.name, 'Booking Created', `Booking ${b.id} for project "${projectName}" created.`);
    toast('Booking created successfully!', 'success');
    closeModal('empBookingModal');
    document.getElementById('mbProjectName').value = '';
    document.getElementById('mbTotal').value = '';
    document.getElementById('mbPaid').value = '';
    document.getElementById('mbNotes').value = '';
    renderBookings();
  }

  function renderBookings() {
    const tbody = document.getElementById('empBookingsBody');
    if (!tbody) return;
    const bookings = RPG.Bookings.all();
    if (!bookings.length) { tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--color-gray);padding:24px">No bookings yet.</td></tr>'; return; }
    tbody.innerHTML = bookings.map(b => {
      const user = RPG.Users.findById(b.clientId);
      return `<tr>
        <td><strong>${esc(b.id)}</strong></td>
        <td>${esc(user ? user.name : 'Unknown')}</td>
        <td>${esc(b.projectName)}</td>
        <td>₹${(b.totalAmount||0).toLocaleString('en-IN')}</td>
        <td style="color:#51cf66">₹${(b.paidAmount||0).toLocaleString('en-IN')}</td>
        <td>
          <select class="admin-search" style="width:auto;padding:4px 8px" onchange="empUpdateBookingStatus('${b.id}',this.value)">
            ${['Pending','Confirmed','In Progress','Completed'].map(s => `<option ${b.status===s?'selected':''}>${s}</option>`).join('')}
          </select>
        </td>
        <td>${esc(b.createdAt)}</td>
        <td><button class="admin-action-btn danger" onclick="empDeleteBooking('${b.id}')">Delete</button></td>
      </tr>`;
    }).join('');
  }

  window.empUpdateBookingStatus = function (id, status) {
    RPG.Bookings.update(id, { status });
    RPG.AuditLog.add(currentEmp.id, currentEmp.name, 'Booking Updated', `Booking ${id} status changed to "${status}".`);
    const b = RPG.Bookings.find(id);
    if (b) RPG.Notifications.add(b.clientId, `Your booking ${id} status updated to "${status}".`);
    toast('Status updated!');
  };

  window.empDeleteBooking = function (id) {
    if (!confirm('Delete this booking?')) return;
    RPG.Bookings.delete(id);
    RPG.AuditLog.add(currentEmp.id, currentEmp.name, 'Booking Deleted', `Booking ${id} deleted.`);
    renderBookings();
    toast('Booking deleted.', 'error');
  };

  /* ---- Chat ---- */
  function setupChat() {
    document.getElementById('empChatSendBtn').addEventListener('click', sendChatMsg);
    document.getElementById('empChatInput').addEventListener('keypress', e => { if (e.key === 'Enter') sendChatMsg(); });
  }

  function renderChatList() {
    const el = document.getElementById('empChatClientList');
    if (!el) return;
    const users = RPG.Users.all();
    if (!users.length) { el.innerHTML = '<p style="padding:16px;color:var(--color-gray);font-size:.85rem">No clients yet.</p>'; return; }
    el.innerHTML = users.map(u => {
      const thread = RPG.Chat.getThread(u.id);
      const lastMsg = thread[thread.length - 1];
      const unread = RPG.Chat.unreadCount(u.id, 'employee');
      return `<div class="chat-client-item ${activeChatClientId === u.id ? 'active' : ''}" onclick="empSelectClient('${u.id}')">
        <div class="chat-client-avatar">${(u.name||'U').charAt(0).toUpperCase()}</div>
        <div style="flex:1;min-width:0">
          <div class="chat-client-name">${esc(u.name)}</div>
          <div class="chat-client-last">${lastMsg ? esc(lastMsg.text.substring(0,30)) + (lastMsg.text.length>30?'…':'') : 'No messages yet'}</div>
        </div>
        ${unread > 0 ? `<div class="chat-unread-dot"></div>` : ''}
      </div>`;
    }).join('');
  }

  window.empSelectClient = function (clientId) {
    activeChatClientId = clientId;
    const user = RPG.Users.findById(clientId);
    document.getElementById('empChatHeader').textContent = '💬 ' + (user ? user.name : 'Client');
    document.getElementById('empChatInputArea').style.display = 'flex';
    RPG.Chat.markRead(clientId, 'employee');
    renderChatMessages();
    renderChatList();
  };

  window.empOpenChat = function (clientId) {
    switchTab('chat');
    setTimeout(() => empSelectClient(clientId), 100);
  };

  function sendChatMsg() {
    if (!activeChatClientId) return;
    const input = document.getElementById('empChatInput');
    const text = input.value.trim();
    if (!text) return;
    RPG.Chat.sendMessage(activeChatClientId, currentEmp.id, currentEmp.name, 'employee', text);
    RPG.AuditLog.add(currentEmp.id, currentEmp.name, 'Chat Message Sent', `Sent message to client ${activeChatClientId}.`);
    input.value = '';
    renderChatMessages();
    renderChatList();
  }

  function renderChatMessages() {
    if (!activeChatClientId) return;
    const thread = RPG.Chat.getThread(activeChatClientId);
    RPG.Chat.markRead(activeChatClientId, 'employee');
    const el = document.getElementById('empChatMessages');
    if (!el) return;
    if (!thread.length) { el.innerHTML = '<div class="empty-state"><div class="empty-icon">💬</div><p>No messages yet.</p></div>'; return; }
    el.innerHTML = thread.map(m => {
      const isMine = m.senderRole === 'employee';
      return `<div>
        <div class="chat-sender" style="text-align:${isMine?'right':'left'}">${isMine ? 'You' : esc(m.senderName)}</div>
        <div class="chat-bubble ${isMine ? 'sent' : 'received'}">${esc(m.text)}</div>
        <div class="chat-time" style="text-align:${isMine?'right':'left'}">${esc(m.time)}</div>
      </div>`;
    }).join('');
    el.scrollTop = el.scrollHeight;
  }

  function startChatPoll() {
    if (chatPollInterval) clearInterval(chatPollInterval);
    chatPollInterval = setInterval(() => { renderChatMessages(); renderChatList(); updateChatBadge(); }, 2500);
  }

  function updateChatBadge() {
    const users = RPG.Users.all();
    let total = 0;
    users.forEach(u => { total += RPG.Chat.unreadCount(u.id, 'employee'); });
    const badge = document.getElementById('empChatBadge');
    if (!badge) return;
    if (total > 0) { badge.style.display = ''; badge.textContent = total; } else badge.style.display = 'none';
  }

  /* ---- Announcements ---- */
  function setupAnnouncements() {
    const btn = document.getElementById('empNewAnnBtn');
    if (btn) btn.addEventListener('click', () => openModal('empAnnModal'));
    const close = document.getElementById('empAnnModalClose');
    if (close) close.addEventListener('click', () => closeModal('empAnnModal'));
    const save = document.getElementById('empAnnSaveBtn');
    if (save) save.addEventListener('click', saveAnnouncement);
  }

  function saveAnnouncement() {
    const title = document.getElementById('annTitle').value.trim();
    const body = document.getElementById('annBody').value.trim();
    if (!title || !body) return toast('Please fill all fields.', 'error');
    RPG.Announcements.create({ title, body, postedBy: currentEmp.name });
    RPG.AuditLog.add(currentEmp.id, currentEmp.name, 'Announcement Posted', `Posted: "${title}"`);
    toast('Announcement posted!', 'success');
    closeModal('empAnnModal');
    document.getElementById('annTitle').value = '';
    document.getElementById('annBody').value = '';
    renderAnnouncements();
  }

  function renderAnnouncements() {
    const el = document.getElementById('empAnnList');
    if (!el) return;
    const anns = RPG.Announcements.all();
    if (!anns.length) { el.innerHTML = '<div class="empty-state"><div class="empty-icon">📢</div><p>No announcements yet.</p></div>'; return; }
    el.innerHTML = anns.map(a => `
      <div class="announcement-card" style="margin-bottom:12px;display:flex;align-items:flex-start;gap:12px">
        <div style="flex:1">
          <h4>${esc(a.title)}</h4>
          <p>${esc(a.body)}</p>
          <div class="announcement-time">📅 ${esc(a.createdAt)} — Posted by ${esc(a.postedBy||'Team')}</div>
        </div>
        <button class="admin-action-btn danger" onclick="empDeleteAnn('${a.id}')">Delete</button>
      </div>`).join('');
  }

  window.empDeleteAnn = function (id) {
    RPG.Announcements.delete(id);
    RPG.AuditLog.add(currentEmp.id, currentEmp.name, 'Announcement Deleted', `Deleted announcement ${id}.`);
    renderAnnouncements();
    toast('Announcement deleted.');
  };

  /* ---- Projects ---- */
  function setupProjects() {
    const btn = document.getElementById('empNewProjectBtn');
    if (btn) btn.addEventListener('click', () => { document.getElementById('prjId').value=''; clearProjectForm(); openModal('empProjectModal'); });
    const close = document.getElementById('empProjectModalClose');
    if (close) close.addEventListener('click', () => closeModal('empProjectModal'));
    const save = document.getElementById('empProjectSaveBtn');
    if (save) save.addEventListener('click', saveProject);
  }

  function clearProjectForm() {
    ['prjTitle','prjLocation','prjPrice','prjDesc'].forEach(id => { const el = document.getElementById(id); if(el) el.value=''; });
  }

  function saveProject() {
    const id = document.getElementById('prjId').value;
    const data = {
      title: document.getElementById('prjTitle').value.trim(),
      category: document.getElementById('prjCategory').value,
      location: document.getElementById('prjLocation').value.trim(),
      price: document.getElementById('prjPrice').value.trim(),
      status: document.getElementById('prjStatus').value,
      description: document.getElementById('prjDesc').value.trim()
    };
    if (!data.title) return toast('Please enter a project title.', 'error');
    if (id) {
      RPG.ProjectsCMS.update(id, data);
      RPG.AuditLog.add(currentEmp.id, currentEmp.name, 'Project Updated', `Updated project "${data.title}".`);
      toast('Project updated!', 'success');
    } else {
      RPG.ProjectsCMS.create(data);
      RPG.AuditLog.add(currentEmp.id, currentEmp.name, 'Project Created', `Created project "${data.title}".`);
      toast('Project added!', 'success');
    }
    closeModal('empProjectModal');
    renderProjects();
  }

  function renderProjects() {
    const el = document.getElementById('empProjectList');
    if (!el) return;
    const projects = RPG.ProjectsCMS.all();
    if (!projects.length) { el.innerHTML = '<div class="empty-state"><div class="empty-icon">🏗️</div><p>No projects added yet.</p></div>'; return; }
    el.innerHTML = projects.map(p => `
      <div class="section-card" style="display:flex;align-items:flex-start;gap:16px;margin-bottom:16px">
        <div style="flex:1">
          <h3 style="font-size:1rem;margin-bottom:4px">${esc(p.title)} <span class="status-badge ${p.status==='Available'?'completed':p.status==='Sold Out'?'pending':'confirmed'}">${esc(p.status)}</span></h3>
          <p style="color:var(--color-gray);font-size:.85rem">📍 ${esc(p.location||'-')} &nbsp;|&nbsp; 🏷️ ${esc(p.category)} &nbsp;|&nbsp; 💰 ${esc(p.price||'-')}</p>
          <p style="font-size:.85rem;margin-top:6px;color:var(--color-cream)">${esc(p.description||'')}</p>
        </div>
        <div style="display:flex;gap:6px;flex-shrink:0">
          <button class="admin-action-btn primary" onclick="empEditProject('${p.id}')">Edit</button>
          <button class="admin-action-btn danger" onclick="empDeleteProject('${p.id}')">Delete</button>
        </div>
      </div>`).join('');
  }

  window.empEditProject = function (id) {
    const p = RPG.ProjectsCMS.find(id);
    if (!p) return;
    document.getElementById('prjId').value = id;
    setValue('prjTitle', p.title); setValue('prjLocation', p.location);
    setValue('prjPrice', p.price); setValue('prjDesc', p.description);
    setSelectVal('prjCategory', p.category); setSelectVal('prjStatus', p.status);
    openModal('empProjectModal');
  };

  window.empDeleteProject = function (id) {
    if (!confirm('Delete this project?')) return;
    const p = RPG.ProjectsCMS.find(id);
    RPG.ProjectsCMS.delete(id);
    RPG.AuditLog.add(currentEmp.id, currentEmp.name, 'Project Deleted', `Deleted project "${p?.title||id}".`);
    renderProjects();
    toast('Project deleted.', 'error');
  };

  /* ---- Payments ---- */
  function setupPayments() {}
  function renderPayments() {
    const tbody = document.getElementById('empPaymentsBody');
    if (!tbody) return;
    const bookings = RPG.Bookings.all();
    if (!bookings.length) { tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--color-gray);padding:24px">No payments found.</td></tr>'; return; }
    tbody.innerHTML = bookings.map(b => {
      const user = RPG.Users.findById(b.clientId);
      const bal = (b.totalAmount||0) - (b.paidAmount||0);
      return `<tr>
        <td>${esc(b.id)}</td><td>${esc(user?user.name:'-')}</td><td>${esc(b.projectName)}</td>
        <td>₹${(b.totalAmount||0).toLocaleString('en-IN')}</td>
        <td style="color:#51cf66">₹${(b.paidAmount||0).toLocaleString('en-IN')}</td>
        <td style="color:#ffc107">₹${bal.toLocaleString('en-IN')}</td>
        <td style="font-size:.8rem;color:var(--color-gold);">${esc(b.payMethod||'UPI / Online')} <br><span style="font-family:monospace;color:var(--color-cream);">${esc(b.txnId||'-')}</span></td>
        <td><span class="status-badge ${statusClass(b.status)}">${esc(b.status)}</span></td>
      </tr>`;
    }).join('');
  }

  /* ---- Helpers ---- */
  function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function setText(id, v) { const e=document.getElementById(id); if(e) e.textContent=v; }
  function setValue(id, v) { const e=document.getElementById(id); if(e) e.value=v||''; }
  function setSelectVal(id, v) { const e=document.getElementById(id); if(e) { Array.from(e.options).forEach(o => o.selected = o.value===v||o.text===v); } }
  function openModal(id) { const m=document.getElementById(id); if(m) m.classList.add('open'); }
  function closeModal(id) { const m=document.getElementById(id); if(m) m.classList.remove('open'); }
  function statusClass(s) { const m={Pending:'pending',Confirmed:'confirmed','In Progress':'inprogress',Completed:'completed'}; return m[s]||'pending'; }
  function toast(msg, type) {
    const wrap = document.getElementById('toastWrap');
    if (!wrap) return;
    const t = document.createElement('div');
    t.className = 'toast ' + (type||'');
    t.textContent = msg;
    wrap.appendChild(t);
    setTimeout(() => t.remove(), 3500);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
