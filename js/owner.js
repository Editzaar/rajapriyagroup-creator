/* =========================================================
   RAJA PRIYA GROUP — OWNER.JS
   Full master panel logic — no restrictions
   ========================================================= */
(function () {
  'use strict';

  const PERMS = ['view_clients','view_client_details','manage_bookings','manage_projects','chat_with_clients','post_announcements','view_payments','view_reports'];
  let activeChatId = null;
  let chatPoll = null;

  /* ---- Password Gate & Persistent Session ---- */
  function init() {
    document.getElementById('ownerPwBtn').addEventListener('click', verify);
    document.getElementById('ownerPwInput').addEventListener('keypress', e => { if (e.key === 'Enter') verify(); });

    // Check existing 7-day owner session
    if (RPG.Session.getOwner()) {
      document.getElementById('ownerGate').style.display = 'none';
      document.getElementById('ownerLayout').style.display = 'flex';
      setup();
    }
  }

  function verify() {
    const pw = document.getElementById('ownerPwInput').value;
    if (RPG.Owner.verify(pw)) {
      RPG.Session.setOwner(true); // Save 7-day persistent session
      document.getElementById('ownerGate').style.display = 'none';
      document.getElementById('ownerLayout').style.display = 'flex';
      setup();
    } else {
      document.getElementById('ownerPwError').textContent = 'Incorrect password. Please try again.';
    }
  }

  /* ---- Setup ---- */
  function setup() {
    document.querySelectorAll('.admin-nav-item').forEach(item => {
      item.addEventListener('click', () => switchTab(item.dataset.tab));
    });
    document.getElementById('ownerLogoutBtn').addEventListener('click', () => {
      RPG.Session.logoutOwner();
      location.reload();
    });

    // Populate client dropdowns
    populateClientDropdown('ownerMbClient');
    populateClientDropdown('ownerTrClient');

    // Buttons
    on('ownerAddEmpBtn', () => openModal('ownerAddEmpModal'));
    on('ownerSaveEmpBtn', saveEmployee);
    on('ownerUpdateEmpPermBtn', saveEmpPermissions);
    on('ownerNewBookingBtn', () => openModal('ownerBookingModal'));
    on('ownerSaveBookingBtn', saveBooking);
    on('ownerNewAnnBtn', () => openModal('ownerAnnModal'));
    on('ownerSaveAnnBtn', saveAnnouncement);
    on('ownerNewProjectBtn', () => { document.getElementById('ownerPrjId').value = ''; openModal('ownerProjectModal'); });
    on('ownerSaveProjectBtn', saveProject);
    on('ownerNewTrainingBtn', () => openModal('ownerTrainingModal'));
    on('ownerSaveTrainingBtn', saveTraining);
    on('ownerChatSendBtn', sendOwnerChat);
    on('changeOwnerPwBtn', changePassword);
    on('auditSearch', () => renderAuditLog(document.getElementById('auditSearch').value), 'input');
    on('ownerClientSearch', () => renderClients(document.getElementById('ownerClientSearch').value), 'input');
    on('ownerChatMsg', e => { if(e.key==='Enter') sendOwnerChat(); }, 'keypress');

    loadOverview();
    setInterval(() => updateChatBadge(), 2000);
    // Auto-refresh whichever tab is currently active so new entries appear live without manual tab switching
    setInterval(() => {
      const activePanel = document.querySelector('.admin-panel.active');
      if (!activePanel) return;
      const tabId = activePanel.id.replace('owner-tab-', '');
      if (tabId === 'overview') loadOverview();
      else if (tabId === 'clients') renderClients(document.getElementById('ownerClientSearch')?.value);
      else if (tabId === 'employees') renderEmployees();
      else if (tabId === 'bookings') renderBookings();
      else if (tabId === 'payments') renderPayments();
      else if (tabId === 'projects') renderProjects();
      else if (tabId === 'training') renderTraining();
      else if (tabId === 'announcements') renderAnnouncements();
      else if (tabId === 'auditlog') renderAuditLog(document.getElementById('auditSearch')?.value);

      populateClientDropdown('ownerMbClient');
      populateClientDropdown('ownerTrClient');
    }, 2000);

    // Instant real-time update when data changes in any tab/window
    window.addEventListener('rpg_data_changed', function () {
      const activePanel = document.querySelector('.admin-panel.active');
      if (!activePanel) return;
      const tabId = activePanel.id.replace('owner-tab-', '');
      if (tabId === 'overview') loadOverview();
      else if (tabId === 'clients') renderClients(document.getElementById('ownerClientSearch')?.value);
      else if (tabId === 'employees') renderEmployees();
      else if (tabId === 'bookings') renderBookings();
      else if (tabId === 'payments') renderPayments();
      else if (tabId === 'projects') renderProjects();
      else if (tabId === 'training') renderTraining();
      else if (tabId === 'announcements') renderAnnouncements();
      else if (tabId === 'auditlog') renderAuditLog(document.getElementById('auditSearch')?.value);

      populateClientDropdown('ownerMbClient');
      populateClientDropdown('ownerTrClient');
    });
  }

  function switchTab(tab) {
    document.querySelectorAll('.admin-nav-item').forEach(i => i.classList.remove('active'));
    document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
    const navEl = document.querySelector(`.admin-nav-item[data-tab="${tab}"]`);
    if (navEl) navEl.classList.add('active');
    const panel = document.getElementById('owner-tab-' + tab);
    if (panel) panel.classList.add('active');
    if (tab === 'overview') loadOverview();
    if (tab === 'clients') renderClients();
    if (tab === 'employees') renderEmployees();
    if (tab === 'bookings') renderBookings();
    if (tab === 'payments') renderPayments();
    if (tab === 'projects') renderProjects();
    if (tab === 'training') renderTraining();
    if (tab === 'announcements') renderAnnouncements();
    if (tab === 'allchats') { renderOwnerChatList(); startChatPoll(); }
    if (tab === 'auditlog') renderAuditLog();
  }

  /* ---- Overview ---- */
  function loadOverview() {
    const bookings = RPG.Bookings.all();
    const totalPaid = bookings.reduce((s,b)=>s+(b.paidAmount||0),0);
    const totalVal  = bookings.reduce((s,b)=>s+(b.totalAmount||0),0);
    setText('ow-clients', RPG.Users.all().length);
    setText('ow-employees', RPG.Employees.all().filter(e=>e.status==='active').length);
    setText('ow-bookings', bookings.length);
    setText('ow-completed', bookings.filter(b=>b.status==='Completed').length);
    setText('ow-revenue', '₹'+totalPaid.toLocaleString('en-IN'));
    setText('ow-balance', '₹'+(totalVal-totalPaid).toLocaleString('en-IN'));
    setText('ow-chats', Object.keys(RPG.Chat.allThreads()).length);
    setText('ow-projects', RPG.ProjectsCMS.all().length);

    // Mini audit
    const auditEl = document.getElementById('overviewAudit');
    if (auditEl) {
      const logs = RPG.AuditLog.all().slice(0,5);
      auditEl.innerHTML = logs.length ? logs.map(l=>`
        <div style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,.04)">
          <div style="font-size:.85rem;color:var(--color-cream)">${esc(l.action)}: ${esc(l.detail)}</div>
          <div style="font-size:.75rem;color:var(--color-gray)">${esc(l.employeeName)} · ${esc(l.time)}</div>
        </div>`).join('') : '<p style="color:var(--color-gray);font-size:.85rem">No activity yet.</p>';
    }

    // Mini bookings
    const bEl = document.getElementById('overviewBookings');
    if (bEl) {
      const recent = RPG.Bookings.all().slice(0,5);
      bEl.innerHTML = recent.length ? recent.map(b=>{
        const u = RPG.Users.findById(b.clientId);
        return `<div style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,.04)">
          <div style="font-size:.85rem;color:var(--color-cream)">${esc(b.projectName)} — ${esc(u?u.name:'-')}</div>
          <div style="font-size:.75rem;color:var(--color-gray)">${esc(b.id)} · ${esc(b.status)}</div>
        </div>`;
      }).join('') : '<p style="color:var(--color-gray);font-size:.85rem">No bookings yet.</p>';
    }
  }

  /* ---- Clients ---- */
  function renderClients(filter) {
    const tbody = document.getElementById('ownerClientsBody');
    if (!tbody) return;
    let users = RPG.Users.all();
    if (filter) { const f=filter.toLowerCase(); users=users.filter(u=>(u.name||'').toLowerCase().includes(f)||(u.email||'').toLowerCase().includes(f)); }
    setText('clientCount', users.length);
    if (!users.length) { tbody.innerHTML='<tr><td colspan="9" style="text-align:center;padding:24px;color:var(--color-gray)">No clients found.</td></tr>'; return; }
    tbody.innerHTML = users.map(u=>`<tr>
      <td><strong>${esc(u.name)}</strong></td>
      <td>${esc(u.email)}</td>
      <td>${esc(u.phone||'-')}</td>
      <td>${esc(u.profession||'-')}</td>
      <td>${esc(u.city||'-')}</td>
      <td>${esc(u.interest||'-')}</td>
      <td style="font-size:.8rem">${esc(u.registeredAt||'-')}</td>
      <td><span class="status-badge ${u.status==='blocked'?'pending':'completed'}">${u.status||'active'}</span></td>
      <td>
        <button class="admin-action-btn primary" onclick="ownerOpenChat('${u.id}')">💬 Chat</button>
        ${u.status==='blocked'
          ? `<button class="admin-action-btn success" onclick="ownerUnblock('${u.id}')">Unblock</button>`
          : `<button class="admin-action-btn danger" onclick="ownerBlock('${u.id}')">Block</button>`}
      </td>
    </tr>`).join('');
  }

  window.ownerBlock = function(id) {
    RPG.Users.block(id);
    renderClients();
    toast('Client blocked.');
  };
  window.ownerUnblock = function(id) {
    RPG.Users.unblock(id);
    renderClients();
    toast('Client unblocked.', 'success');
  };

  /* ---- Employees ---- */
  function renderEmployees() {
    const tbody = document.getElementById('ownerEmployeesBody');
    if (!tbody) return;
    const emps = RPG.Employees.all();
    if (!emps.length) { tbody.innerHTML='<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--color-gray)">No employees added yet.</td></tr>'; return; }
    tbody.innerHTML = emps.map(e=>`<tr>
      <td><strong>${esc(e.name)}</strong></td>
      <td>${esc(e.email||'-')}</td>
      <td>${esc(e.department||'-')}</td>
      <td style="font-family:monospace;letter-spacing:2px">${esc(e.pin)}</td>
      <td style="font-size:.8rem">${esc(e.lastLogin||'Never')}</td>
      <td><span class="status-badge ${e.status==='active'?'completed':'pending'}">${e.status||'active'}</span></td>
      <td>
        <button class="admin-action-btn primary" onclick="ownerEditEmp('${e.id}')">Edit Permissions</button>
        ${e.status==='active'
          ? `<button class="admin-action-btn danger" onclick="ownerDeactivateEmp('${e.id}')">Deactivate</button>`
          : `<button class="admin-action-btn success" onclick="ownerActivateEmp('${e.id}')">Activate</button>`}
      </td>
    </tr>`).join('');
  }

  function saveEmployee() {
    const name = document.getElementById('empName').value.trim();
    const pin  = document.getElementById('empPinNew').value.trim();
    if (!name || !pin) return toast('Name and PIN are required.', 'error');
    const perms = {};
    PERMS.forEach(p => { perms[p] = document.getElementById('perm_'+p)?.checked || false; });
    RPG.Employees.create({
      name,
      email: document.getElementById('empEmail').value.trim(),
      department: document.getElementById('empDept').value.trim(),
      pin,
      permissions: perms
    });
    toast('Employee added!', 'success');
    closeOwnerModal('ownerAddEmpModal');
    // Reset
    ['empName','empEmail','empDept','empPinNew'].forEach(id => { const el=document.getElementById(id); if(el) el.value=''; });
    PERMS.forEach(p => { const el=document.getElementById('perm_'+p); if(el) el.checked=false; });
    renderEmployees();
  }

  window.ownerEditEmp = function(id) {
    const emp = RPG.Employees.find(id);
    if (!emp) return;
    document.getElementById('editEmpId').value = id;
    document.getElementById('editEmpName').textContent = emp.name;
    PERMS.forEach(p => { const el=document.getElementById('eperm_'+p); if(el) el.checked = !!(emp.permissions||{})[p]; });
    openModal('ownerEditEmpModal');
  };

  function saveEmpPermissions() {
    const id = document.getElementById('editEmpId').value;
    const emp = RPG.Employees.find(id);
    if (!emp) return;
    const perms = {};
    PERMS.forEach(p => { perms[p] = document.getElementById('eperm_'+p)?.checked||false; });
    RPG.Employees.save({ ...emp, permissions: perms });
    toast('Permissions updated!', 'success');
    closeOwnerModal('ownerEditEmpModal');
    renderEmployees();
  }

  window.ownerDeactivateEmp = function(id) { if(confirm('Deactivate this employee?')) { RPG.Employees.deactivate(id); renderEmployees(); toast('Employee deactivated.'); } };
  window.ownerActivateEmp   = function(id) { RPG.Employees.activate(id); renderEmployees(); toast('Employee activated.', 'success'); };

  /* ---- Bookings ---- */
  function renderBookings() {
    const tbody = document.getElementById('ownerBookingsBody');
    if (!tbody) return;
    const bookings = RPG.Bookings.all();
    if (!bookings.length) { tbody.innerHTML='<tr><td colspan="9" style="text-align:center;padding:24px;color:var(--color-gray)">No bookings yet.</td></tr>'; return; }
    tbody.innerHTML = bookings.map(b=>{
      const u=RPG.Users.findById(b.clientId);
      const bal=(b.totalAmount||0)-(b.paidAmount||0);
      return `<tr>
        <td><strong>${esc(b.id)}</strong></td>
        <td>${esc(u?u.name:'-')}</td>
        <td>${esc(b.projectName)}</td>
        <td>₹${(b.totalAmount||0).toLocaleString('en-IN')}</td>
        <td style="color:#51cf66">₹${(b.paidAmount||0).toLocaleString('en-IN')}</td>
        <td style="color:#ffc107">₹${bal.toLocaleString('en-IN')}</td>
        <td>
          <select class="admin-search" style="width:auto;padding:4px" onchange="ownerUpdateStatus('${b.id}',this.value)">
            ${['Pending','Confirmed','In Progress','Completed'].map(s=>`<option ${b.status===s?'selected':''}>${s}</option>`).join('')}
          </select>
        </td>
        <td style="font-size:.8rem">${esc(b.createdAt)}</td>
        <td><button class="admin-action-btn danger" onclick="ownerDeleteBooking('${b.id}')">Del</button></td>
      </tr>`;
    }).join('');
  }

  function saveBooking() {
    const clientId = document.getElementById('ownerMbClient').value;
    const project  = document.getElementById('ownerMbProject').value.trim();
    if (!clientId||!project) return toast('Fill all required fields.','error');
    RPG.Bookings.create({ clientId, projectName: project, type: document.getElementById('ownerMbType').value, totalAmount: parseFloat(document.getElementById('ownerMbTotal').value)||0, paidAmount: parseFloat(document.getElementById('ownerMbPaid').value)||0, notes: document.getElementById('ownerMbNotes').value });
    toast('Booking created!','success');
    closeOwnerModal('ownerBookingModal');
    renderBookings();
  }

  window.ownerUpdateStatus = function(id, status) {
    RPG.Bookings.update(id,{status});
    const b=RPG.Bookings.find(id);
    if(b) RPG.Notifications.add(b.clientId, `Your booking ${id} updated to "${status}".`);
    toast('Status updated!');
  };

  window.ownerDeleteBooking = function(id) {
    if(!confirm('Delete booking '+id+'?')) return;
    RPG.Bookings.delete(id);
    renderBookings();
    toast('Deleted.','error');
  };

  /* ---- Payments ---- */
  function renderPayments() {
    const tbody = document.getElementById('ownerPaymentsBody');
    if (!tbody) return;
    const bookings = RPG.Bookings.all();
    if (!bookings.length) { tbody.innerHTML='<tr><td colspan="9" style="text-align:center;padding:24px;color:var(--color-gray)">No payments found.</td></tr>'; return; }
    tbody.innerHTML = bookings.map(b=>{
      const u=RPG.Users.findById(b.clientId);
      const bal=(b.totalAmount||0)-(b.paidAmount||0);
      return `<tr>
        <td>${esc(b.id)}</td><td>${esc(u?u.name:'-')}</td><td>${esc(b.projectName)}</td>
        <td>₹${(b.totalAmount||0).toLocaleString('en-IN')}</td>
        <td style="color:#51cf66">₹${(b.paidAmount||0).toLocaleString('en-IN')}</td>
        <td style="color:#ffc107">₹${bal.toLocaleString('en-IN')}</td>
        <td style="font-size:.8rem;color:var(--color-gold);">${esc(b.payMethod||'UPI / Online')} <br><span style="font-family:monospace;color:var(--color-cream);">${esc(b.txnId||'-')}</span></td>
        <td><input type="number" class="admin-search" style="width:110px" value="${b.paidAmount||0}" onchange="ownerUpdatePaid('${b.id}',this.value)"></td>
        <td><span class="status-badge ${statusClass(b.status)}">${esc(b.status)}</span></td>
      </tr>`;
    }).join('');
  }

  window.ownerUpdatePaid = function(id, val) {
    RPG.Bookings.update(id, { paidAmount: parseFloat(val)||0 });
    const b=RPG.Bookings.find(id);
    if(b) RPG.Notifications.add(b.clientId, `Payment updated on booking ${id}.`);
    toast('Payment updated!','success');
  };

  /* ---- Projects ---- */
  function renderProjects() {
    const el = document.getElementById('ownerProjectList');
    if (!el) return;
    const projects = RPG.ProjectsCMS.all();
    if (!projects.length) { el.innerHTML='<div class="empty-state"><div class="empty-icon">🏗️</div><p>No projects yet.</p></div>'; return; }
    el.innerHTML = projects.map(p=>`
      <div class="admin-table-wrap" style="padding:16px 20px;margin-bottom:16px;display:flex;align-items:center;gap:16px">
        <div style="flex:1">
          <strong style="color:var(--color-cream)">${esc(p.title)}</strong>
          <span class="status-badge ${p.status==='Available'?'completed':p.status==='Sold Out'?'pending':'confirmed'}" style="margin-left:8px">${esc(p.status)}</span>
          <div style="font-size:.82rem;color:var(--color-gray);margin-top:4px">📍${esc(p.location||'-')} · 🏷️${esc(p.category)} · 💰${esc(p.price||'-')}</div>
        </div>
        <div>
          <button class="admin-action-btn primary" onclick="ownerEditProject('${p.id}')">Edit</button>
          <button class="admin-action-btn danger" onclick="ownerDeleteProject('${p.id}')">Delete</button>
        </div>
      </div>`).join('');
  }

  function saveProject() {
    const id = document.getElementById('ownerPrjId').value;
    const data = { title:document.getElementById('ownerPrjTitle').value.trim(), category:document.getElementById('ownerPrjCat').value, location:document.getElementById('ownerPrjLoc').value.trim(), price:document.getElementById('ownerPrjPrice').value.trim(), status:document.getElementById('ownerPrjStatus').value, description:document.getElementById('ownerPrjDesc').value.trim() };
    if (!data.title) return toast('Enter project title.','error');
    id ? RPG.ProjectsCMS.update(id,data) : RPG.ProjectsCMS.create(data);
    toast(id?'Updated!':'Added!','success');
    closeOwnerModal('ownerProjectModal');
    renderProjects();
  }

  window.ownerEditProject = function(id) {
    const p=RPG.ProjectsCMS.find(id);
    if(!p) return;
    document.getElementById('ownerPrjId').value=id;
    ['ownerPrjTitle','ownerPrjLoc','ownerPrjPrice','ownerPrjDesc'].forEach((fid,i)=>{
      const val=[p.title,p.location,p.price,p.description][i];
      const el=document.getElementById(fid); if(el) el.value=val||'';
    });
    setOpt('ownerPrjCat',p.category); setOpt('ownerPrjStatus',p.status);
    openModal('ownerProjectModal');
  };

  window.ownerDeleteProject = function(id) {
    if(!confirm('Delete?')) return;
    RPG.ProjectsCMS.delete(id);
    renderProjects();
    toast('Deleted.','error');
  };

  /* ---- Training ---- */
  function renderTraining() {
    const tbody = document.getElementById('ownerTrainingBody');
    if (!tbody) return;
    const all = RPG.Training.all();
    if (!all.length) { tbody.innerHTML='<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--color-gray)">No training sessions.</td></tr>'; return; }
    tbody.innerHTML = all.map(t=>{
      const u=RPG.Users.findById(t.clientId);
      return `<tr>
        <td>${esc(u?u.name:'-')}</td>
        <td>${esc(t.title)}</td>
        <td><div class="progress-bar-wrap" style="min-width:100px"><div class="progress-bar-fill" style="width:${t.progress||0}%"></div></div><span style="font-size:.8rem">${t.progress||0}%</span></td>
        <td><span class="status-badge enrolled">${esc(t.status||'Enrolled')}</span></td>
        <td><input type="range" min="0" max="100" value="${t.progress||0}" style="width:100px" oninput="ownerUpdateProgress('${t.id}',this.value)"></td>
        <td style="font-size:.8rem">${esc(t.createdAt)}</td>
      </tr>`;
    }).join('');
  }

  window.ownerUpdateProgress = function(id, val) {
    const progress = parseInt(val);
    const status = progress===100?'Completed':'In Progress';
    RPG.Training.update(id,{progress,status});
    const t=RPG.Training.all().find(x=>x.id===id);
    if(t) RPG.Notifications.add(t.clientId, `Training "${t.title}" progress updated to ${progress}%.`);
  };

  function saveTraining() {
    const clientId = document.getElementById('ownerTrClient').value;
    const title = document.getElementById('ownerTrTitle').value.trim();
    if (!clientId||!title) return toast('Fill all fields.','error');
    RPG.Training.create({ clientId, title, description: document.getElementById('ownerTrDesc').value.trim() });
    toast('Training assigned!','success');
    closeOwnerModal('ownerTrainingModal');
    renderTraining();
  }

  /* ---- Announcements ---- */
  function renderAnnouncements() {
    const el = document.getElementById('ownerAnnList');
    if (!el) return;
    const anns = RPG.Announcements.all();
    if (!anns.length) { el.innerHTML='<div class="empty-state"><div class="empty-icon">📢</div><p>No announcements.</p></div>'; return; }
    el.innerHTML = anns.map(a=>`
      <div class="admin-table-wrap" style="padding:16px 20px;margin-bottom:12px;display:flex;gap:16px;align-items:flex-start">
        <div style="flex:1">
          <strong style="color:var(--color-cream)">${esc(a.title)}</strong>
          <p style="color:var(--color-gray);font-size:.85rem;margin-top:4px">${esc(a.body)}</p>
          <div style="font-size:.75rem;color:var(--color-gold-deep);margin-top:6px">📅 ${esc(a.createdAt)} · Posted by ${esc(a.postedBy||'Owner')}</div>
        </div>
        <button class="admin-action-btn danger" onclick="ownerDeleteAnn('${a.id}')">Delete</button>
      </div>`).join('');
  }

  function saveAnnouncement() {
    const title=document.getElementById('ownerAnnTitle').value.trim();
    const body=document.getElementById('ownerAnnBody').value.trim();
    if(!title||!body) return toast('Fill all fields.','error');
    RPG.Announcements.create({title,body,postedBy:'Owner'});
    toast('Posted!','success');
    closeOwnerModal('ownerAnnModal');
    document.getElementById('ownerAnnTitle').value='';
    document.getElementById('ownerAnnBody').value='';
    renderAnnouncements();
  }

  window.ownerDeleteAnn = function(id) { RPG.Announcements.delete(id); renderAnnouncements(); toast('Deleted.','error'); };

  /* ---- All Chats Monitor ---- */
  function renderOwnerChatList() {
    const el = document.getElementById('ownerChatList');
    if (!el) return;
    const users = RPG.Users.all();
    if (!users.length) { el.innerHTML='<p style="padding:16px;color:var(--color-gray);font-size:.85rem">No clients yet.</p>'; return; }
    
    // Auto-select first client if none selected
    if (!activeChatId && users.length > 0) {
      activeChatId = users[0].id;
    }

    el.innerHTML = users.map(u=>{
      const thread = RPG.Chat.getThread(u.id);
      const last = thread[thread.length-1];
      const unread = RPG.Chat.unreadCount(u.id,'owner');
      return `<div class="chat-client-item ${activeChatId===u.id?'active':''}" onclick="ownerSelectChat('${u.id}')">
        <div class="chat-client-avatar">${(u.name||'U').charAt(0).toUpperCase()}</div>
        <div style="flex:1;min-width:0">
          <div class="chat-client-name">${esc(u.name)}</div>
          <div class="chat-client-last">${last?esc(last.text.substring(0,28))+(last.text.length>28?'…':''):'No messages'}</div>
        </div>
        ${unread>0?'<div class="chat-unread-dot"></div>':''}
      </div>`;
    }).join('');

    if (activeChatId) {
      renderOwnerChatMessages();
    }
  }

  window.ownerSelectChat = function(clientId) {
    activeChatId = clientId;
    const user = RPG.Users.findById(clientId);
    document.getElementById('ownerChatHeader').textContent = '💬 ' + (user?user.name:'Client') + ' — Full Chat History';
    const inputArea = document.getElementById('ownerChatInput');
    if (inputArea) inputArea.style.display = 'flex';
    RPG.Chat.markRead(clientId,'owner');
    renderOwnerChatMessages();
    renderOwnerChatList();
  };

  window.ownerOpenChat = function(clientId) {
    switchTab('allchats');
    setTimeout(()=>ownerSelectChat(clientId),100);
  };

  function renderOwnerChatMessages() {
    if (!activeChatId) return;
    const inputArea = document.getElementById('ownerChatInput');
    if (inputArea) inputArea.style.display = 'flex';
    const thread = RPG.Chat.getThread(activeChatId);
    const el = document.getElementById('ownerChatMessages');
    if (!el) return;
    if (!thread.length) { el.innerHTML='<div class="empty-state"><div class="empty-icon">💬</div><p>No messages in this conversation yet. Send a message below!</p></div>'; return; }
    el.innerHTML = thread.map(m=>{
      const isOwner = m.senderRole==='owner';
      return `<div>
        <div class="chat-sender" style="text-align:${isOwner?'right':'left'}">${isOwner?'👑 You (Owner)':esc(m.senderName)+' ('+esc(m.senderRole)+')'}</div>
        <div class="chat-bubble ${isOwner?'sent':'received'}">${esc(m.text)}</div>
        <div class="chat-time" style="text-align:${isOwner?'right':'left'}">${esc(m.time)}</div>
      </div>`;
    }).join('');
    el.scrollTop = el.scrollHeight;
  }

  function sendOwnerChat() {
    if (!activeChatId) return;
    const input = document.getElementById('ownerChatMsg');
    const text = input.value.trim();
    if (!text) return;
    RPG.Chat.sendMessage(activeChatId, 'owner', 'Raja Priya Group (Owner)', 'owner', text);
    input.value='';
    renderOwnerChatMessages();
    renderOwnerChatList();
  }

  function startChatPoll() {
    if (chatPoll) clearInterval(chatPoll);
    chatPoll = setInterval(()=>{ renderOwnerChatMessages(); renderOwnerChatList(); updateChatBadge(); }, 2500);
  }

  function updateChatBadge() {
    const badge = document.getElementById('ownerChatBadge');
    if (!badge) return;
    let total=0;
    RPG.Users.all().forEach(u=>{ total+=RPG.Chat.unreadCount(u.id,'owner'); });
    badge.style.display = total>0?'':'none';
    if(total>0) badge.textContent=total;
  }

  /* ---- Audit Log ---- */
  function renderAuditLog(filter) {
    const el = document.getElementById('auditLogList');
    if (!el) return;
    let logs = RPG.AuditLog.all();
    if (filter) { const f=filter.toLowerCase(); logs=logs.filter(l=>(l.employeeName||'').toLowerCase().includes(f)||(l.action||'').toLowerCase().includes(f)||(l.detail||'').toLowerCase().includes(f)); }
    if (!logs.length) { el.innerHTML='<div class="empty-state"><div class="empty-icon">🔍</div><p>No activity log found.</p></div>'; return; }
    el.innerHTML = logs.map(l=>`
      <div class="audit-item">
        <div class="audit-icon">📝</div>
        <div>
          <div class="audit-text"><span class="audit-who">${esc(l.employeeName)}</span> — ${esc(l.action)}: ${esc(l.detail)}</div>
          <div class="audit-time">${esc(l.time)}</div>
        </div>
      </div>`).join('');
  }

  /* ---- Settings ---- */
  function changePassword() {
    const pw1=document.getElementById('newOwnerPw').value;
    const pw2=document.getElementById('confirmOwnerPw').value;
    const msg=document.getElementById('pwChangeMsg');
    if (!pw1||pw1.length<6) { msg.style.display='block';msg.style.color='#ff6b6b';msg.textContent='Password must be at least 6 characters.'; return; }
    if (pw1!==pw2) { msg.style.display='block';msg.style.color='#ff6b6b';msg.textContent='Passwords do not match.'; return; }
    RPG.Owner.setPassword(pw1);
    msg.style.display='block';msg.style.color='#51cf66';msg.textContent='✅ Password updated successfully!';
    document.getElementById('newOwnerPw').value='';
    document.getElementById('confirmOwnerPw').value='';
  }

  /* ---- Helpers ---- */
  function populateClientDropdown(selId) {
    const sel=document.getElementById(selId);
    if (!sel) return;
    sel.innerHTML='';
    RPG.Users.all().forEach(u=>{ const o=document.createElement('option'); o.value=u.id; o.textContent=u.name+' ('+u.email+')'; sel.appendChild(o); });
  }

  function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function setText(id,v) { const e=document.getElementById(id); if(e) e.textContent=v; }
  function setOpt(id,v) { const e=document.getElementById(id); if(!e) return; Array.from(e.options).forEach(o=>o.selected=o.value===v||o.text===v); }
  function on(id,fn,evt) { const e=document.getElementById(id); if(e) e.addEventListener(evt||'click',fn); }
  function openModal(id) { const m=document.getElementById(id); if(m) m.classList.add('open'); }
  window.closeOwnerModal = function(id) { const m=document.getElementById(id); if(m) m.classList.remove('open'); };
  function statusClass(s) { return {Pending:'pending',Confirmed:'confirmed','In Progress':'inprogress',Completed:'completed'}[s]||'pending'; }
  function toast(msg,type) {
    const wrap=document.getElementById('toastWrap');
    if(!wrap) return;
    const t=document.createElement('div');
    t.className='toast '+(type||'');
    t.textContent=msg;
    wrap.appendChild(t);
    setTimeout(()=>t.remove(),3500);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
