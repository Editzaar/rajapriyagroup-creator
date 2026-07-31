/* =========================================================
   RAJA PRIYA GROUP — SHARED DATA LAYER WITH FIREBASE SYNC
   Central Firestore & LocalStorage synchronized helpers
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

  // 7 Days Session Expiry (7 days * 24 hrs * 60 mins * 60 secs * 1000 ms)
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

  function read(key) {
    try { return JSON.parse(localStorage.getItem(key)) || []; } catch (e) { return []; }
  }
  function readObj(key) {
    try { return JSON.parse(localStorage.getItem(key)) || {}; } catch (e) { return {}; }
  }
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }
  function ts() {
    return new Date().toLocaleString('en-IN', { hour12: true });
  }

  // ---- FIREBASE SNAPSHOT LISTENERS FOR REAL-TIME CLOUD SYNC ----
  if (global.db) {
    const collectionsToSync = [
      { coll: 'users', key: KEYS.USERS, sort: (a, b) => (b.timestamp || 0) - (a.timestamp || 0) },
      { coll: 'employees', key: KEYS.EMPLOYEES },
      { coll: 'bookings', key: KEYS.BOOKINGS, sort: (a, b) => (b.timestamp || 0) - (a.timestamp || 0) },
      { coll: 'training', key: KEYS.TRAINING },
      { coll: 'announcements', key: KEYS.ANNOUNCEMENTS, sort: (a, b) => (b.timestamp || 0) - (a.timestamp || 0) },
      { coll: 'projects', key: KEYS.PROJECTS },
      { coll: 'chats', key: KEYS.CHATS, isMap: true },
      { coll: 'audit_log', key: KEYS.AUDIT_LOG, sort: (a, b) => (b.timestamp || 0) - (a.timestamp || 0) },
      { coll: 'notifications', key: KEYS.NOTIFICATIONS, sort: (a, b) => (b.timestamp || 0) - (a.timestamp || 0) }
    ];

    collectionsToSync.forEach(c => {
      global.db.collection(c.coll).onSnapshot(snap => {
        let data;
        if (c.isMap) {
          data = {};
          snap.forEach(doc => {
            data[doc.id] = doc.data().messages || [];
          });
        } else {
          data = [];
          snap.forEach(doc => {
            data.push({ id: doc.id, ...doc.data() });
          });
          if (c.sort) {
            data.sort(c.sort);
          }
        }
        localStorage.setItem(c.key, JSON.stringify(data));
        // Trigger event for immediate UI updates
        window.dispatchEvent(new CustomEvent('rpg_data_changed', { detail: { key: c.key } }));
      }, err => console.error(`Sync error on ${c.coll}:`, err));
    });

    // Owner password config sync
    global.db.collection('config').doc('owner_password').onSnapshot(doc => {
      if (doc.exists) {
        localStorage.setItem(KEYS.OWNER_PW, doc.data().password);
        window.dispatchEvent(new CustomEvent('rpg_data_changed', { detail: { key: KEYS.OWNER_PW } }));
      }
    });
  }

  // ---- USERS ----
  const Users = {
    all: () => read(KEYS.USERS),
    find: (email) => Users.all().find(u => u.email.toLowerCase() === email.toLowerCase()),
    findById: (id) => Users.all().find(u => u.id === id),
    save: (user) => {
      if (global.db) {
        global.db.collection('users').doc(user.id).set(user);
      } else {
        const users = Users.all().filter(u => u.id !== user.id);
        users.push(user);
        localStorage.setItem(KEYS.USERS, JSON.stringify(users));
      }
    },
    create: (data) => {
      const user = { id: uid(), registeredAt: ts(), timestamp: Date.now(), status: 'active', ...data };
      if (global.db) {
        global.db.collection('users').doc(user.id).set(user);
      } else {
        const users = Users.all();
        users.push(user);
        localStorage.setItem(KEYS.USERS, JSON.stringify(users));
      }
      AuditLog.add('system', 'Website', 'New Registration', `New client registered: ${user.name} (${user.email})`);
      return user;
    },
    block: (id) => {
      if (global.db) {
        global.db.collection('users').doc(id).update({ status: 'blocked' });
      } else {
        const users = Users.all().map(u => u.id === id ? { ...u, status: 'blocked' } : u);
        localStorage.setItem(KEYS.USERS, JSON.stringify(users));
      }
    },
    unblock: (id) => {
      if (global.db) {
        global.db.collection('users').doc(id).update({ status: 'active' });
      } else {
        const users = Users.all().map(u => u.id === id ? { ...u, status: 'active' } : u);
        localStorage.setItem(KEYS.USERS, JSON.stringify(users));
      }
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
      const v = (val || '').trim();
      return Employees.all().find(e => 
        e.status === 'active' && (
          (e.pin && e.pin === v) ||
          (e.password && e.password === v)
        )
      );
    },
    findByEmailAndPassword: (email, password) => {
      const em = (email || '').trim().toLowerCase();
      return Employees.all().find(e =>
        e.status === 'active' &&
        e.email && e.email.toLowerCase() === em &&
        e.password && e.password === password
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
      if (global.db) {
        global.db.collection('employees').doc(emp.id).set(emp);
      } else {
        const list = Employees.all();
        list.push(emp);
        localStorage.setItem(KEYS.EMPLOYEES, JSON.stringify(list));
      }
      return emp;
    },
    save: (emp) => {
      if (global.db) {
        global.db.collection('employees').doc(emp.id).set(emp);
      } else {
        const list = Employees.all().filter(e => e.id !== emp.id);
        list.push(emp);
        localStorage.setItem(KEYS.EMPLOYEES, JSON.stringify(list));
      }
    },
    deactivate: (id) => {
      if (global.db) {
        global.db.collection('employees').doc(id).update({ status: 'inactive' });
      } else {
        const list = Employees.all().map(e => e.id === id ? { ...e, status: 'inactive' } : e);
        localStorage.setItem(KEYS.EMPLOYEES, JSON.stringify(list));
      }
    },
    activate: (id) => {
      if (global.db) {
        global.db.collection('employees').doc(id).update({ status: 'active' });
      } else {
        const list = Employees.all().map(e => e.id === id ? { ...e, status: 'active' } : e);
        localStorage.setItem(KEYS.EMPLOYEES, JSON.stringify(list));
      }
    }
  };

  // ---- BOOKINGS ----
  const Bookings = {
    all: () => read(KEYS.BOOKINGS),
    forClient: (clientId) => Bookings.all().filter(b => b.clientId === clientId),
    find: (id) => Bookings.all().find(b => b.id === id),
    create: (data) => {
      const b = { id: 'BK' + Date.now().toString().slice(-6), createdAt: ts(), timestamp: Date.now(), status: 'Pending', paidAmount: 0, ...data };
      if (global.db) {
        global.db.collection('bookings').doc(b.id).set(b);
      } else {
        const list = Bookings.all();
        list.push(b);
        localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(list));
      }
      const user = Users.findById(data.clientId);
      AuditLog.add('system', 'Client Self-Service', 'New Booking Created', `New booking ${b.id} ("${b.projectName}") submitted by ${user ? user.name : 'Client'}`);
      Notifications.add(data.clientId, `New booking "${data.projectName}" created (ID: ${b.id}).`);
      return b;
    },
    update: (id, patch) => {
      if (global.db) {
        global.db.collection('bookings').doc(id).update({ ...patch, updatedAt: ts() });
      } else {
        const list = Bookings.all().map(b => b.id === id ? { ...b, ...patch, updatedAt: ts() } : b);
        localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(list));
      }
    },
    delete: (id) => {
      if (global.db) {
        global.db.collection('bookings').doc(id).delete();
      } else {
        localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(Bookings.all().filter(b => b.id !== id)));
      }
    }
  };

  // ---- TRAINING ----
  const Training = {
    all: () => read(KEYS.TRAINING),
    forClient: (clientId) => Training.all().filter(t => t.clientId === clientId),
    create: (data) => {
      const t = { id: uid(), createdAt: ts(), progress: 0, status: 'Enrolled', ...data };
      if (global.db) {
        global.db.collection('training').doc(t.id).set(t);
      } else {
        const list = Training.all();
        list.push(t);
        localStorage.setItem(KEYS.TRAINING, JSON.stringify(list));
      }
      return t;
    },
    update: (id, patch) => {
      if (global.db) {
        global.db.collection('training').doc(id).update(patch);
      } else {
        localStorage.setItem(KEYS.TRAINING, JSON.stringify(Training.all().map(t => t.id === id ? { ...t, ...patch } : t)));
      }
    }
  };

  // ---- ANNOUNCEMENTS ----
  const Announcements = {
    all: () => read(KEYS.ANNOUNCEMENTS),
    create: (data) => {
      const a = { id: uid(), createdAt: ts(), timestamp: Date.now(), ...data };
      if (global.db) {
        global.db.collection('announcements').doc(a.id).set(a);
      } else {
        const list = Announcements.all();
        list.unshift(a);
        localStorage.setItem(KEYS.ANNOUNCEMENTS, JSON.stringify(list));
      }
      return a;
    },
    delete: (id) => {
      if (global.db) {
        global.db.collection('announcements').doc(id).delete();
      } else {
        localStorage.setItem(KEYS.ANNOUNCEMENTS, JSON.stringify(Announcements.all().filter(a => a.id !== id)));
      }
    }
  };

  // ---- PROJECTS CMS ----
  const ProjectsCMS = {
    all: () => read(KEYS.PROJECTS),
    find: (id) => ProjectsCMS.all().find(p => p.id === id),
    create: (data) => {
      const p = { id: uid(), createdAt: ts(), ...data };
      if (global.db) {
        global.db.collection('projects').doc(p.id).set(p);
      } else {
        const list = ProjectsCMS.all();
        list.unshift(p);
        localStorage.setItem(KEYS.PROJECTS, JSON.stringify(list));
      }
      return p;
    },
    update: (id, patch) => {
      if (global.db) {
        global.db.collection('projects').doc(id).update(patch);
      } else {
        localStorage.setItem(KEYS.PROJECTS, JSON.stringify(ProjectsCMS.all().map(p => p.id === id ? { ...p, ...patch } : p)));
      }
    },
    delete: (id) => {
      if (global.db) {
        global.db.collection('projects').doc(id).delete();
      } else {
        localStorage.setItem(KEYS.PROJECTS, JSON.stringify(ProjectsCMS.all().filter(p => p.id !== id)));
      }
    }
  };

  // ---- CHAT ----
  const Chat = {
    getThread: (clientId) => {
      const all = readObj(KEYS.CHATS);
      return all[clientId] || [];
    },
    sendMessage: (clientId, senderId, senderName, senderRole, text) => {
      const thread = Chat.getThread(clientId);
      const msg = { id: uid(), senderId, senderName, senderRole, text, time: ts(), timestamp: Date.now(), read: false };
      thread.push(msg);
      if (global.db) {
        global.db.collection('chats').doc(clientId).set({ messages: thread });
      } else {
        const all = readObj(KEYS.CHATS);
        all[clientId] = thread;
        localStorage.setItem(KEYS.CHATS, JSON.stringify(all));
      }
      return msg;
    },
    markRead: (clientId, role) => {
      const thread = Chat.getThread(clientId);
      if (!thread.length) return;
      let changed = false;
      const updated = thread.map(m => {
        if (m.senderRole !== role && !m.read) {
          changed = true;
          return { ...m, read: true };
        }
        return m;
      });
      if (changed) {
        if (global.db) {
          global.db.collection('chats').doc(clientId).set({ messages: updated });
        } else {
          const all = readObj(KEYS.CHATS);
          all[clientId] = updated;
          localStorage.setItem(KEYS.CHATS, JSON.stringify(all));
        }
      }
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
      const logEntry = { id: uid(), time: ts(), timestamp: Date.now(), employeeId, employeeName, action, detail };
      if (global.db) {
        global.db.collection('audit_log').add(logEntry);
      } else {
        const log = AuditLog.all();
        log.unshift(logEntry);
        if (log.length > 500) log.length = 500;
        localStorage.setItem(KEYS.AUDIT_LOG, JSON.stringify(log));
      }
    }
  };

  // ---- NOTIFICATIONS ----
  const Notifications = {
    forClient: (clientId) => read(KEYS.NOTIFICATIONS).filter(n => n.clientId === clientId),
    add: (clientId, message) => {
      const notif = { id: uid(), clientId, message, time: ts(), timestamp: Date.now(), read: false };
      if (global.db) {
        global.db.collection('notifications').add(notif);
      } else {
        const list = read(KEYS.NOTIFICATIONS);
        list.unshift(notif);
        localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(list));
      }
    },
    markRead: (clientId) => {
      if (global.db) {
        global.db.collection('notifications').where('clientId', '==', clientId).get().then(snap => {
          snap.forEach(doc => {
            if (!doc.data().read) {
              doc.ref.update({ read: true });
            }
          });
        });
      } else {
        localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(read(KEYS.NOTIFICATIONS).map(n => n.clientId === clientId ? { ...n, read: true } : n)));
      }
    }
  };

  // ---- OWNER ----
  const Owner = {
    getPassword: () => localStorage.getItem(KEYS.OWNER_PW) || 'RPGowner@2026',
    setPassword: (pw) => {
      if (global.db) {
        global.db.collection('config').doc('owner_password').set({ password: pw });
      } else {
        localStorage.setItem(KEYS.OWNER_PW, pw);
      }
    },
    verify: (pw) => pw === Owner.getPassword()
  };

  // Auto Initialize Default Data so database is never blank
  (function initDefaultData() {
    if (!global.db) return;
    try {
      // 1. Employees
      global.db.collection('employees').get().then(snap => {
        if (snap.empty) {
          const vishalEmail = 'vishal.mayur@dreamsanddegrees.com';
          global.db.collection('employees').doc('emp_vishal').set({
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
        }
      });

      // 2. Users / Clients
      global.db.collection('users').get().then(snap => {
        if (snap.empty) {
          const c1 = { name: 'Bickram Nath', email: 'bickram@demo.com', phone: '+91 9876543210', profession: 'Business Brand', city: 'Hyderabad', interest: 'Business Brand', password: 'demo123', registeredAt: ts(), status: 'active' };
          const c2 = { name: 'Rahul Sharma', email: 'rahul@demo.com', phone: '+91 9123456780', profession: 'Software Engineer', city: 'Secunderabad', interest: 'Real Estate / Plot Buyer', password: 'demo123', registeredAt: ts(), status: 'active' };
          global.db.collection('users').doc('usr_bickram').set(c1);
          global.db.collection('users').doc('usr_rahul').set(c2);
        }
      });

      // 3. Bookings
      global.db.collection('bookings').get().then(snap => {
        if (snap.empty) {
          global.db.collection('bookings').doc('BK116560').set({
            clientId: 'usr_bickram',
            projectName: 'Brand Promotion & Marketing Campaign',
            type: 'Real Estate',
            totalAmount: 5000,
            paidAmount: 500,
            status: 'Pending',
            notes: 'Initial booking request',
            createdAt: ts(),
            timestamp: Date.now() - 10000
          });
          global.db.collection('bookings').doc('BK116561').set({
            clientId: 'usr_rahul',
            projectName: 'Green Valley Plot #42',
            type: 'Real Estate',
            totalAmount: 1500000,
            paidAmount: 750000,
            status: 'In Progress',
            notes: 'Plot booking',
            createdAt: ts(),
            timestamp: Date.now()
          });
        }
      });

      // 4. Announcements
      global.db.collection('announcements').get().then(snap => {
        if (snap.empty) {
          global.db.collection('announcements').doc('ann_1').set({
            title: '🎉 New Project Launch: Green Valley Phase 3',
            body: 'We are excited to announce the launch of Green Valley Phase 3 in Bachupally. Plots starting from ₹18 Lakhs.',
            postedBy: 'Raja Priya Group Team',
            createdAt: ts(),
            timestamp: Date.now()
          });
        }
      });

      // 5. Projects
      global.db.collection('projects').get().then(snap => {
        if (snap.empty) {
          global.db.collection('projects').doc('prj_1').set({
            title: 'Green Valley Plots — Phase 2',
            category: 'Plots',
            location: 'Bachupally, Hyderabad',
            price: '₹18 Lakhs onwards',
            status: 'Available',
            description: 'Premium gated community plots with all amenities. HMDA approved.',
            createdAt: ts()
          });
          global.db.collection('projects').doc('prj_2').set({
            title: 'Sunrise Residency',
            category: 'Villa',
            location: 'Kondapur, Hyderabad',
            price: '₹75 Lakhs onwards',
            status: 'Available',
            description: 'Luxury 3BHK & 4BHK villas with clubhouse and security.',
            createdAt: ts()
          });
        }
      });
      
      // 6. Owner Password Config
      global.db.collection('config').doc('owner_password').get().then(doc => {
        if (!doc.exists) {
          global.db.collection('config').doc('owner_password').set({ password: 'RPGowner@2026' });
        }
      });

    } catch (e) {
      console.error('Auto init error:', e);
    }
  })();

  const seedClear = () => {
    // Clear localStorage local variables
    ['rpg_users','rpg_employees','rpg_bookings','rpg_training','rpg_announcements','rpg_projects_cms','rpg_chats','rpg_audit_log','rpg_notifications'].forEach(k => localStorage.removeItem(k));
    
    // Clear Firestore collection documents
    if (global.db) {
      const collections = ['users', 'employees', 'bookings', 'training', 'announcements', 'projects', 'chats', 'audit_log', 'notifications'];
      collections.forEach(coll => {
        global.db.collection(coll).get().then(snap => {
          snap.forEach(doc => {
            doc.ref.delete();
          });
        });
      });
    }
  };

  // Expose globally
  global.RPG = { Users, Session, Employees, Bookings, Training, Announcements, ProjectsCMS, Chat, AuditLog, Notifications, Owner, uid, ts, seedClear };

})(window);
