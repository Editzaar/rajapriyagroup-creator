/* =========================================================
   RAJA PRIYA GROUP — SHARED DATA LAYER
   Central localStorage helpers for all portals
   ========================================================= */
(function (global) {
  'use strict';

  const KEYS = {
    USERS: 'rpg_users',
    CURRENT_USER: 'rpg_current_user',
    EMPLOYEES: 'rpg_employees',
    CURRENT_EMPLOYEE: 'rpg_current_employee',
    BOOKINGS: 'rpg_bookings',
    PAYMENTS: 'rpg_payments',
    TRAINING: 'rpg_training',
    ANNOUNCEMENTS: 'rpg_announcements',
    PROJECTS: 'rpg_projects_cms',
    CHATS: 'rpg_chats',
    AUDIT_LOG: 'rpg_audit_log',
    OWNER_PW: 'rpg_owner_pw',
    NOTIFICATIONS: 'rpg_notifications',
    CURRENT_OWNER: 'rpg_current_owner'
  };

  function read(key) {
    try { return JSON.parse(localStorage.getItem(key)) || []; } catch (e) { return []; }
  }
  function readObj(key) {
    try { return JSON.parse(localStorage.getItem(key)) || {}; } catch (e) { return {}; }
  }
  function write(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }
  function ts() {
    return new Date().toLocaleString('en-IN', { hour12: true });
  }

  // 7 Days Session Expiry (7 days * 24 hrs * 60 mins * 60 secs * 1000 ms)
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

  // ---- USERS ----
  const Users = {
    all: () => read(KEYS.USERS),
    find: (email) => Users.all().find(u => u.email.toLowerCase() === email.toLowerCase()),
    findById: (id) => Users.all().find(u => u.id === id),
    save: (user) => {
      const users = Users.all().filter(u => u.id !== user.id);
      users.push(user);
      write(KEYS.USERS, users);
    },
    create: (data) => {
      const user = { id: uid(), registeredAt: ts(), status: 'active', ...data };
      const users = Users.all();
      users.push(user);
      write(KEYS.USERS, users);
      return user;
    },
    block: (id) => {
      const users = Users.all().map(u => u.id === id ? { ...u, status: 'blocked' } : u);
      write(KEYS.USERS, users);
    },
    unblock: (id) => {
      const users = Users.all().map(u => u.id === id ? { ...u, status: 'active' } : u);
      write(KEYS.USERS, users);
    }
  };

  // ---- SESSION (7-DAY PERSISTENT LOGIN) ----
  const Session = {
    getClient: () => {
      try {
        const raw = localStorage.getItem(KEYS.CURRENT_USER);
        if (!raw) return null;
        const data = JSON.parse(raw);
        if (!data) return null;
        const sessionTime = data._sessionTime || 0;
        if (sessionTime && (Date.now() - sessionTime > SEVEN_DAYS_MS)) {
          localStorage.removeItem(KEYS.CURRENT_USER);
          return null;
        }
        let user = data.user || data;
        while (user && user.user) { user = user.user; }
        return (user && user.id) ? user : null;
      } catch (e) { return null; }
    },
    setClient: (u) => {
      if (u) {
        let cleanUser = u.user || u;
        while (cleanUser && cleanUser.user) { cleanUser = cleanUser.user; }
        localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify({ user: cleanUser, _sessionTime: Date.now() }));
      } else {
        localStorage.removeItem(KEYS.CURRENT_USER);
      }
    },
    getEmployee: () => {
      try {
        const raw = localStorage.getItem(KEYS.CURRENT_EMPLOYEE);
        if (!raw) return null;
        const data = JSON.parse(raw);
        if (!data) return null;
        const sessionTime = data._sessionTime || 0;
        if (sessionTime && (Date.now() - sessionTime > SEVEN_DAYS_MS)) {
          localStorage.removeItem(KEYS.CURRENT_EMPLOYEE);
          return null;
        }
        let emp = data.employee || data;
        while (emp && emp.employee) { emp = emp.employee; }
        return (emp && emp.id) ? emp : null;
      } catch (e) { return null; }
    },
    setEmployee: (e) => {
      if (e) {
        let cleanEmp = e.employee || e;
        while (cleanEmp && cleanEmp.employee) { cleanEmp = cleanEmp.employee; }
        localStorage.setItem(KEYS.CURRENT_EMPLOYEE, JSON.stringify({ employee: cleanEmp, _sessionTime: Date.now() }));
      } else {
        localStorage.removeItem(KEYS.CURRENT_EMPLOYEE);
      }
    },
    getOwner: () => {
      try {
        const raw = localStorage.getItem(KEYS.CURRENT_OWNER);
        if (!raw) return null;
        const data = JSON.parse(raw);
        if (!data) return null;
        const sessionTime = data._sessionTime || 0;
        if (sessionTime && (Date.now() - sessionTime > SEVEN_DAYS_MS)) {
          localStorage.removeItem(KEYS.CURRENT_OWNER);
          return null;
        }
        return data.auth === true;
      } catch (e) { return null; }
    },
    setOwner: (val) => {
      if (val) {
        localStorage.setItem(KEYS.CURRENT_OWNER, JSON.stringify({ auth: true, _sessionTime: Date.now() }));
      } else {
        localStorage.removeItem(KEYS.CURRENT_OWNER);
      }
    },
    logoutClient: () => { localStorage.removeItem(KEYS.CURRENT_USER); },
    logoutEmployee: () => { localStorage.removeItem(KEYS.CURRENT_EMPLOYEE); },
    logoutOwner: () => { localStorage.removeItem(KEYS.CURRENT_OWNER); }
  };

  // ---- EMPLOYEES ----
  const Employees = {
    all: () => read(KEYS.EMPLOYEES),
    find: (id) => Employees.all().find(e => e.id === id),
    findByPin: (val) => {
      const v = (val || '').trim().toLowerCase();
      return Employees.all().find(e => 
        e.status === 'active' && (
          (e.pin && e.pin.toLowerCase() === v) ||
          (e.pin && e.pin === val) ||
          (e.password && e.password === val) ||
          (e.email && e.email.toLowerCase() === v)
        )
      );
    },
    create: (data) => {
      const emp = {
        id: uid(), createdAt: ts(), status: 'active',
        permissions: {
          view_clients: true, view_client_details: true,
          manage_bookings: true, manage_projects: true,
          chat_with_clients: true, post_announcements: true,
          view_payments: true, view_reports: true
        },
        ...data
      };
      const list = Employees.all();
      list.push(emp);
      write(KEYS.EMPLOYEES, list);
      return emp;
    },
    save: (emp) => {
      const list = Employees.all().filter(e => e.id !== emp.id);
      list.push(emp);
      write(KEYS.EMPLOYEES, list);
    },
    deactivate: (id) => {
      const list = Employees.all().map(e => e.id === id ? { ...e, status: 'inactive' } : e);
      write(KEYS.EMPLOYEES, list);
    },
    activate: (id) => {
      const list = Employees.all().map(e => e.id === id ? { ...e, status: 'active' } : e);
      write(KEYS.EMPLOYEES, list);
    }
  };

  // Auto Initialize Default Data so dashboard is never blank
  (function initDefaultData() {
    try {
      // 1. Employees
      const employees = read(KEYS.EMPLOYEES);
      const vishalEmail = 'vishal.mayur@dreamsanddegrees.com';
      if (!employees.some(e => (e.email || '').toLowerCase() === vishalEmail)) {
        employees.push({
          id: 'emp_vishal',
          name: 'Vishal Mayur',
          email: vishalEmail,
          department: 'Management & Operations',
          pin: 'Vishal@',
          password: 'Vishal@',
          createdAt: ts(),
          status: 'active',
          permissions: {
            view_clients: true, view_client_details: true,
            manage_bookings: true, manage_projects: true,
            chat_with_clients: true, post_announcements: true,
            view_payments: true, view_reports: true
          }
        });
        write(KEYS.EMPLOYEES, employees);
      }

      // 2. Users / Clients
      const users = read(KEYS.USERS);
      if (users.length === 0) {
        const c1 = { id: 'usr_bickram', name: 'Bickram Nath', email: 'bickram@demo.com', phone: '+91 9876543210', profession: 'Business Brand', city: 'Hyderabad', interest: 'Business Brand', password: 'demo123', registeredAt: ts(), status: 'active' };
        const c2 = { id: 'usr_rahul', name: 'Rahul Sharma', email: 'rahul@demo.com', phone: '+91 9123456780', profession: 'Software Engineer', city: 'Secunderabad', interest: 'Real Estate / Plot Buyer', password: 'demo123', registeredAt: ts(), status: 'active' };
        write(KEYS.USERS, [c1, c2]);
      }

      // 3. Bookings
      const bookings = read(KEYS.BOOKINGS);
      if (bookings.length === 0) {
        write(KEYS.BOOKINGS, [
          { id: 'BK116560', clientId: 'usr_bickram', projectName: 'Brand Promotion & Marketing Campaign', type: 'Real Estate', totalAmount: 5000, paidAmount: 500, status: 'Pending', notes: 'Initial booking request', createdAt: ts() },
          { id: 'BK116561', clientId: 'usr_rahul', projectName: 'Green Valley Plot #42', type: 'Real Estate', totalAmount: 1500000, paidAmount: 750000, status: 'In Progress', notes: 'Plot booking', createdAt: ts() }
        ]);
      }

      // 4. Announcements
      const anns = read(KEYS.ANNOUNCEMENTS);
      if (anns.length === 0) {
        write(KEYS.ANNOUNCEMENTS, [
          { id: 'ann_1', title: '🎉 New Project Launch: Green Valley Phase 3', body: 'We are excited to announce the launch of Green Valley Phase 3 in Bachupally. Plots starting from ₹18 Lakhs.', postedBy: 'Raja Priya Group Team', createdAt: ts() }
        ]);
      }

      // 5. Projects
      const prjs = read(KEYS.PROJECTS);
      if (prjs.length === 0) {
        write(KEYS.PROJECTS, [
          { id: 'prj_1', title: 'Green Valley Plots — Phase 2', category: 'Plots', location: 'Bachupally, Hyderabad', price: '₹18 Lakhs onwards', status: 'Available', description: 'Premium gated community plots with all amenities. HMDA approved.' },
          { id: 'prj_2', title: 'Sunrise Residency', category: 'Villa', location: 'Kondapur, Hyderabad', price: '₹75 Lakhs onwards', status: 'Available', description: 'Luxury 3BHK & 4BHK villas with clubhouse and security.' }
        ]);
      }
    } catch (e) {
      console.error('Auto init error:', e);
    }
  })();

  // ---- BOOKINGS ----
  const Bookings = {
    all: () => read(KEYS.BOOKINGS),
    forClient: (clientId) => Bookings.all().filter(b => b.clientId === clientId),
    find: (id) => Bookings.all().find(b => b.id === id),
    create: (data) => {
      const b = { id: 'BK' + Date.now().toString().slice(-6), createdAt: ts(), status: 'Pending', paidAmount: 0, ...data };
      const list = Bookings.all();
      list.push(b);
      write(KEYS.BOOKINGS, list);
      Notifications.add(data.clientId, `New booking "${data.projectName}" created.`);
      return b;
    },
    update: (id, patch) => {
      const list = Bookings.all().map(b => b.id === id ? { ...b, ...patch, updatedAt: ts() } : b);
      write(KEYS.BOOKINGS, list);
    },
    delete: (id) => { write(KEYS.BOOKINGS, Bookings.all().filter(b => b.id !== id)); }
  };

  // ---- TRAINING ----
  const Training = {
    all: () => read(KEYS.TRAINING),
    forClient: (clientId) => Training.all().filter(t => t.clientId === clientId),
    create: (data) => {
      const t = { id: uid(), createdAt: ts(), progress: 0, status: 'Enrolled', ...data };
      const list = Training.all();
      list.push(t);
      write(KEYS.TRAINING, list);
      return t;
    },
    update: (id, patch) => {
      write(KEYS.TRAINING, Training.all().map(t => t.id === id ? { ...t, ...patch } : t));
    }
  };

  // ---- ANNOUNCEMENTS ----
  const Announcements = {
    all: () => read(KEYS.ANNOUNCEMENTS),
    create: (data) => {
      const a = { id: uid(), createdAt: ts(), ...data };
      const list = Announcements.all();
      list.unshift(a);
      write(KEYS.ANNOUNCEMENTS, list);
      return a;
    },
    delete: (id) => { write(KEYS.ANNOUNCEMENTS, Announcements.all().filter(a => a.id !== id)); }
  };

  // ---- PROJECTS CMS ----
  const ProjectsCMS = {
    all: () => read(KEYS.PROJECTS),
    find: (id) => ProjectsCMS.all().find(p => p.id === id),
    create: (data) => {
      const p = { id: uid(), createdAt: ts(), ...data };
      const list = ProjectsCMS.all();
      list.unshift(p);
      write(KEYS.PROJECTS, list);
      return p;
    },
    update: (id, patch) => {
      write(KEYS.PROJECTS, ProjectsCMS.all().map(p => p.id === id ? { ...p, ...patch } : p));
    },
    delete: (id) => { write(KEYS.PROJECTS, ProjectsCMS.all().filter(p => p.id !== id)); }
  };

  // ---- CHAT ----
  const Chat = {
    getThread: (clientId) => {
      const all = readObj(KEYS.CHATS);
      return all[clientId] || [];
    },
    sendMessage: (clientId, senderId, senderName, senderRole, text) => {
      const all = readObj(KEYS.CHATS);
      if (!all[clientId]) all[clientId] = [];
      const msg = { id: uid(), senderId, senderName, senderRole, text, time: ts(), read: false };
      all[clientId].push(msg);
      write(KEYS.CHATS, all);
      return msg;
    },
    markRead: (clientId, role) => {
      const all = readObj(KEYS.CHATS);
      if (!all[clientId]) return;
      all[clientId] = all[clientId].map(m => m.senderRole !== role ? { ...m, read: true } : m);
      write(KEYS.CHATS, all);
    },
    allThreads: () => readObj(KEYS.CHATS),
    unreadCount: (clientId, role) => {
      const thread = Chat.getThread(clientId);
      return thread.filter(m => !m.read && m.senderRole !== role).length;
    }
  };

  // ---- AUDIT LOG ----
  const AuditLog = {
    all: () => read(KEYS.AUDIT_LOG),
    add: (employeeId, employeeName, action, detail) => {
      const log = AuditLog.all();
      log.unshift({ id: uid(), time: ts(), employeeId, employeeName, action, detail });
      if (log.length > 500) log.length = 500;
      write(KEYS.AUDIT_LOG, log);
    }
  };

  // ---- NOTIFICATIONS ----
  const Notifications = {
    forClient: (clientId) => read(KEYS.NOTIFICATIONS).filter(n => n.clientId === clientId),
    add: (clientId, message) => {
      const list = read(KEYS.NOTIFICATIONS);
      list.unshift({ id: uid(), clientId, message, time: ts(), read: false });
      write(KEYS.NOTIFICATIONS, list);
    },
    markRead: (clientId) => {
      write(KEYS.NOTIFICATIONS, read(KEYS.NOTIFICATIONS).map(n => n.clientId === clientId ? { ...n, read: true } : n));
    }
  };

  // ---- OWNER ----
  const Owner = {
    getPassword: () => localStorage.getItem(KEYS.OWNER_PW) || 'RPGowner@2026',
    setPassword: (pw) => localStorage.setItem(KEYS.OWNER_PW, pw),
    verify: (pw) => pw === Owner.getPassword()
  };

  // Expose globally
  global.RPG = { Users, Session, Employees, Bookings, Training, Announcements, ProjectsCMS, Chat, AuditLog, Notifications, Owner, uid, ts };

})(window);
