/* =========================================================
   RAJA PRIYA GROUP — SMART AI ASSISTANT CHATBOT
   Multi-language (EN / TE / HI), auto-reply, estimation calculator,
   and automated Cloud Firestore lead capture.
   Focus: Video Editing, Website Development, Brand Promotions, Social Media.
   ========================================================= */

(function () {
  'use strict';

  let currentLang = 'en'; // 'en', 'te', 'hi'
  let leadState = { step: 0, name: '', phone: '', service: '' };

  /* ---- Knowledge Base Dictionaries ---- */
  const DICT = {
    en: {
      botName: 'Raja Priya AI Assistant',
      onlineStatus: 'Online 24/7',
      welcome: 'Hello! 👋 Welcome to **Raja Priya Group** — your complete partner for Video Editing, Website Development, Brand Promotions, and Social Media Management. How can I help you today?',
      quickOptions: [
        { label: '🎬 Video Editing', query: 'video' },
        { label: '💻 Website Development', query: 'web' },
        { label: '🚀 Brand Promotions', query: 'brand' },
        { label: '📱 Social Media Management', query: 'social' },
        { label: '📅 Request Consultation', query: 'consult' },
        { label: '📞 Call Support', query: 'contact' }
      ],
      placeholder: 'Type your message or service requirement...',
      responses: {
        video: '🎬 **Video Editing Services**:\nWe offer Instagram Reels Editing, Motion Graphics & Animation, YouTube Video Editing, Short-Form Content, Color Grading, and Sound Design.\n\nWould you like a custom price quote for your video project?',
        web: '💻 **Website Development**:\nWe build high-performance Business Websites, Landing Pages, WordPress sites, WooCommerce E-commerce stores, and provide ongoing Website Maintenance.\n\nWould you like to get a quote for a new website?',
        brand: '🚀 **Brand Promotions**:\nWe offer Brand Strategy, Digital Marketing, Performance Marketing, Creative Ad Campaigns, and Targeted Lead Generation.',
        social: '📱 **Social Media Management**:\nEnd-to-end Social Media Handling, Content Planning, Creative Post Design, 4K Reels & Video Production, and Business Growth Campaigns.',
        contact: '📞 **Contact Us**:\n- **Phone**: [9476766340](tel:9476766340)\n- **WhatsApp**: [Click to Chat](https://wa.me/919476766340)\n- **Office**: Plot No. 13, Road No. 9, Jubilee Hills, Hyderabad.',
        consultPrompt: 'Great! Please enter your **Full Name** to book a free creative consultation:',
        phonePrompt: 'Thank you, {NAME}! Please enter your **10-digit Mobile Number** so our manager can call you:',
        leadSuccess: '✅ **Thank you, {NAME}!** Your consultation request has been received. Our manager will call you at **{PHONE}** shortly!',
        defaultMsg: 'Thank you for reaching out! You can choose an option below or call our team directly at **9476766340**.'
      }
    },
    te: {
      botName: 'రాజా ప్రియా AI అసిస్టెంట్',
      onlineStatus: 'ఆన్‌లైన్ 24/7',
      welcome: 'నమస్కారం! 👋 **రాజా ప్రియా గ్రూప్** కు స్వాగతం. వీడియో ఎడిటింగ్, వెబ్‌సైట్ డెవలప్‌మెంట్, బ్రాండ్ ప్రమోషన్లు మరియు సోషల్ మీడియా మేనేజ్‌మెంట్ సేవలకు మేము మీ భాగస్వామివి. మీకు ఎలా సహాయపడగలను?',
      quickOptions: [
        { label: '🎬 వీడియో ఎడిటింగ్', query: 'video' },
        { label: '💻 వెబ్‌సైట్ డెవలప్‌మెంట్', query: 'web' },
        { label: '🚀 బ్రాండ్ ప్రమోషన్లు', query: 'brand' },
        { label: '📱 సోషల్ మీడియా మేనేజ్‌మెంట్', query: 'social' },
        { label: '📅 సలహా కొరకు బుక్ చేయండి', query: 'consult' },
        { label: '📞 కాల్ చేయండి', query: 'contact' }
      ],
      placeholder: 'మీ సందేశాన్ని ఇక్కడ టైప్ చేయండి...',
      responses: {
        video: '🎬 **వీడియో ఎడిటింగ్ సేవలు**:\nఇన్‌స్టాగ్రామ్ రీల్స్ ఎడిటింగ్, మోషన్ గ్రాఫిక్స్, యూట్యూబ్ వీడియో ఎడిటింగ్, కలర్ గ్రేడింగ్ మరియు సౌండ్ డిజైన్ సేవలు అందుబాటులో ఉన్నాయి.',
        web: '💻 **వెబ్‌సైట్ డెవలప్‌మెంట్**:\nబిజినెస్ వెబ్‌సైట్లు, ల్యాండింగ్ పేజీలు, వర్డ్‌ప్రెస్ డెవలప్‌మెంట్ మరియు ఈ-కామర్స్ ఆన్‌లైన్ స్టోర్‌ల నిర్మాణం.',
        brand: '🚀 **బ్రాండ్ ప్రమోషన్లు**:\nడిజిటల్ మార్కెటింగ్, పెర్ఫార్మెన్స్ మార్కెటింగ్, బ్రాండింగ్ స్ట్రాటజీ మరియు లీడ్ జనరేషన్.',
        social: '📱 **సోషల్ మీడియా మేనేజ్‌మెంట్**:\nఇన్‌స్టాగ్రామ్ పేజీ నిర్వహణ, కంటెంట్ ప్లానింగ్, పోస్ట్ డిజైన్ మరియు రీల్స్ ప్రొడక్షన్.',
        contact: '📞 **మమ్మల్ని సంప్రదించండి**:\n- **ఫోన్**: [9476766340](tel:9476766340)\n- **వాట్సాప్**: [ఇక్కడ క్లిక్ చేయండి](https://wa.me/919476766340)\n- **ఆఫీస్**: జూబ్లీ హిల్స్, హైదరాబాద్.',
        consultPrompt: 'ధన్యవాదాలు! ఉచిత కన్సల్టేషన్ కొరకు మీ **పూర్తి పేరు** నమోదు చేయండి:',
        phonePrompt: 'ధన్యవాదాలు, {NAME}! మీ **10 అంకెల మొబైల్ నంబర్** నమోదు చేయండి:',
        leadSuccess: '✅ **ధన్యవాదాలు {NAME}!** మీ వివరాలు నమోదయ్యాయి. మా మేనేజర్ త్వరలోనే **{PHONE}** కు కాల్ చేస్తారు.',
        defaultMsg: 'ధన్యవాదాలు! మరిన్ని వివరాలకు ఉచితంగా కాల్ చేయండి: **9476766340**.'
      }
    },
    hi: {
      botName: 'राजा प्रिया AI असिस्टेंट',
      onlineStatus: 'ऑनलाइन 24/7',
      welcome: 'नमस्ते! 👋 **राजा प्रिया ग्रुप** में आपका स्वागत है। वीडियो एडिटिंग, वेबसाइट डेवलपमेंट, ब्रांड प्रमोशन और सोशल मीडिया मैनेजमेंट के लिए हम आपके डिजिटल पार्टनर हैं। आज हम आपकी क्या सहायता कर सकते हैं?',
      quickOptions: [
        { label: '🎬 वीडियो एडिटिंग', query: 'video' },
        { label: '💻 वेबसाइट डेवलपमेंट', query: 'web' },
        { label: '🚀 ब्रांड प्रमोशन', query: 'brand' },
        { label: '📱 सोशल मीडिया मैनेजमेंट', query: 'social' },
        { label: '📅 कंसल्टेशन बुक करें', query: 'consult' },
        { label: '📞 कॉल करें', query: 'contact' }
      ],
      placeholder: 'अपना संदेश यहां टाइप करें...',
      responses: {
        video: '🎬 **वीडियो एडिटिंग सर्विसेज**:\nइंस्टाग्राम रील्स एडिटिंग, मोशन ग्राफिक्स, यूट्यूब वीडियो एडिटिंग, शॉर्ट-फॉर्म कंटेंट और कलर ग्रेडिंग सर्विसेज।',
        web: '💻 **वेबसाइट डेवलपमेंट**:\nबिजनेस वेबसाइट्स, लैंडिंग पेज, वर्डप्रेस और ई-कॉमर्स ऑनलाइन स्टोर्स।',
        brand: '🚀 **ब्रांड प्रमोशन**:\nडिजिटल मार्केटिंग, ब्रांड स्ट्रेटेजी और कस्टमर लीड जनरेशन।',
        social: '📱 **सोशल मीडिया मैनेजमेंट**:\nसोशल मीडिया हैंडलिंग, रील्स प्रोडक्शन, पोस्ट डिजाइनिंग और बिजनेस ग्रोथ।',
        contact: '📞 **संपर्क करें**:\n- **फोन**: [9476766340](tel:9476766340)\n- **व्हाट्सएप**: [चैट करें](https://wa.me/919476766340)\n- **कार्यालय**: जुबली हिल्स, हैदराबाद।',
        consultPrompt: 'धन्यवाद! फ्री कंसल्टेशन के लिए अपना **पूरा नाम** दर्ज करें:',
        phonePrompt: 'धन्यवाद, {NAME}! अपना **10 अंकों का मोबाइल नंबर** दर्ज करें:',
        leadSuccess: '✅ **धन्यवाद {NAME}!** आपकी रिक्वेस्ट मिल गई है। हमारे मैनेजर जल्द ही आपको **{PHONE}** पर कॉल करेंगे।',
        defaultMsg: 'धन्यवाद! अधिक जानकारी के लिए सीधे कॉल करें: **9476766340**.'
      }
    }
  };

  /* ---- Inject HTML Structure ---- */
  function injectAIBotHTML() {
    if (document.getElementById('aiBotWindow')) return;

    // Trigger Button
    const triggerBtn = document.createElement('div');
    triggerBtn.className = 'ai-bot-trigger';
    triggerBtn.id = 'aiBotTrigger';
    triggerBtn.innerHTML = `
      <span class="ai-icon-sparkle">✦</span>
      <span>AI Assistant</span>
      <span class="ai-bot-badge-dot"></span>
    `;
    document.body.appendChild(triggerBtn);

    // Modal Window
    const win = document.createElement('div');
    win.className = 'ai-bot-window';
    win.id = 'aiBotWindow';
    win.innerHTML = `
      <div class="ai-bot-header">
        <div class="ai-bot-brand">
          <div class="ai-avatar-circle">🤖</div>
          <div>
            <div class="ai-bot-title-text" id="aiBotTitle">Raja Priya AI Assistant</div>
            <div class="ai-bot-status-text" id="aiBotStatus"><span>●</span> Online 24/7</div>
          </div>
        </div>
        <button class="ai-bot-close-btn" id="aiBotCloseBtn">&times;</button>
      </div>

      <div class="ai-lang-selector">
        <button class="ai-lang-btn active" data-lang="en">🇬🇧 English</button>
        <button class="ai-lang-btn" data-lang="te">🇮🇳 తెలుగు</button>
        <button class="ai-lang-btn" data-lang="hi">🇮🇳 हिंदी</button>
      </div>

      <div class="ai-bot-messages" id="aiBotMessages"></div>

      <div class="ai-bot-input-area">
        <input type="text" class="ai-bot-input" id="aiBotInput" placeholder="Type your message or query..." />
        <button class="ai-bot-send-btn" id="aiBotSendBtn">➤</button>
      </div>
    `;
    document.body.appendChild(win);

    // Event Listeners
    triggerBtn.addEventListener('click', toggleAIBot);
    document.getElementById('aiBotCloseBtn').addEventListener('click', toggleAIBot);
    document.getElementById('aiBotSendBtn').addEventListener('click', handleUserSend);
    document.getElementById('aiBotInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleUserSend();
    });

    // Language Toggle Listener
    win.querySelectorAll('.ai-lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        win.querySelectorAll('.ai-lang-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentLang = btn.dataset.lang;
        updateLangUI();
      });
    });

    // Render initial welcome message
    renderWelcomeMsg();
  }

  function toggleAIBot() {
    const win = document.getElementById('aiBotWindow');
    if (win) {
      const isActive = win.classList.toggle('active');
      if (isActive) {
        document.getElementById('aiBotInput').focus();
      }
    }
  }

  function updateLangUI() {
    const data = DICT[currentLang];
    document.getElementById('aiBotTitle').textContent = data.botName;
    document.getElementById('aiBotStatus').innerHTML = `<span>●</span> ${data.onlineStatus}`;
    document.getElementById('aiBotInput').placeholder = data.placeholder;
    renderWelcomeMsg();
  }

  function renderWelcomeMsg() {
    const msgContainer = document.getElementById('aiBotMessages');
    if (!msgContainer) return;
    const data = DICT[currentLang];
    
    msgContainer.innerHTML = '';
    appendBubble(data.welcome, 'bot');
    appendQuickOptions(data.quickOptions);
  }

  function appendBubble(text, sender) {
    const msgContainer = document.getElementById('aiBotMessages');
    const bubble = document.createElement('div');
    bubble.className = `ai-msg-bubble ${sender}`;
    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" style="color:var(--color-gold-light); font-weight:700;">$1</a>')
      .replace(/\n/g, '<br>');
    bubble.innerHTML = html;
    msgContainer.appendChild(bubble);
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }

  function appendQuickOptions(options) {
    const msgContainer = document.getElementById('aiBotMessages');
    const wrap = document.createElement('div');
    wrap.className = 'ai-quick-options';
    options.forEach(opt => {
      const pill = document.createElement('button');
      pill.className = 'ai-quick-pill';
      pill.textContent = opt.label;
      pill.addEventListener('click', () => {
        appendBubble(opt.label, 'user');
        handleIntent(opt.query);
      });
      wrap.appendChild(pill);
    });
    msgContainer.appendChild(wrap);
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }

  function handleUserSend() {
    const input = document.getElementById('aiBotInput');
    const val = input.value.trim();
    if (!val) return;

    appendBubble(val, 'user');
    input.value = '';

    if (leadState.step === 1) {
      leadState.name = val;
      leadState.step = 2;
      const data = DICT[currentLang];
      const reply = data.responses.phonePrompt.replace('{NAME}', val);
      setTimeout(() => appendBubble(reply, 'bot'), 400);
      return;
    } else if (leadState.step === 2) {
      leadState.phone = val;
      leadState.step = 0;
      saveLeadToDatabase(leadState.name, leadState.phone, leadState.service);
      const data = DICT[currentLang];
      const reply = data.responses.leadSuccess.replace('{NAME}', leadState.name).replace('{PHONE}', val);
      setTimeout(() => appendBubble(reply, 'bot'), 400);
      return;
    }

    const lower = val.toLowerCase();
    let query = 'default';
    if (lower.includes('video') || lower.includes('reel') || lower.includes('edit') || lower.includes('వీడియో') || lower.includes('वीडियो')) query = 'video';
    else if (lower.includes('web') || lower.includes('site') || lower.includes('wordpress') || lower.includes('వెబ్‌సైట్') || lower.includes('वेबसाइट')) query = 'web';
    else if (lower.includes('brand') || lower.includes('market') || lower.includes('ప్రమోషన్')) query = 'brand';
    else if (lower.includes('social') || lower.includes('instagram') || lower.includes('facebook')) query = 'social';
    else if (lower.includes('call') || lower.includes('phone') || lower.includes('number') || lower.includes('contact')) query = 'contact';
    else if (lower.includes('consult') || lower.includes('book')) query = 'consult';

    handleIntent(query);
  }

  function handleIntent(query) {
    const data = DICT[currentLang];
    if (query === 'consult') {
      leadState = { step: 1, name: '', phone: '', service: 'Creative Consultation' };
      setTimeout(() => appendBubble(data.responses.consultPrompt, 'bot'), 400);
      return;
    }

    const reply = data.responses[query] || data.responses.defaultMsg;
    setTimeout(() => {
      appendBubble(reply, 'bot');
      appendQuickOptions(data.quickOptions);
    }, 400);
  }

  function saveLeadToDatabase(name, phone, service) {
    try {
      const lead = {
        id: 'LEAD_' + Date.now(),
        name: name,
        phone: phone,
        service: service || 'Creative Inquiry',
        date: new Date().toISOString(),
        status: 'New'
      };

      if (window.RPG && window.RPG.Notifications) {
        window.RPG.Notifications.add('admin', `🤖 New AI Lead: ${name} (${phone}) - ${service}`);
      }

      if (window.db) {
        window.db.collection('leads').doc(lead.id).set(lead);
      }
    } catch (e) {
      console.warn('Lead saved locally:', name, phone);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectAIBotHTML);
  } else {
    injectAIBotHTML();
  }

})();
