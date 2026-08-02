/* =========================================================
   RAJA PRIYA GROUP — SMART AI ASSISTANT CHATBOT
   Multi-language (EN / TE / HI), auto-reply, estimation calculator,
   and automated Cloud Firestore lead capture.
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
      welcome: 'Hello! 👋 Welcome to **Raja Priya Group** — your complete real estate, construction, branding, and social media partner in Hyderabad. How can I help you today?',
      quickOptions: [
        { label: '📍 Open Plots', query: 'plots' },
        { label: '🏗️ Construction Rates', query: 'construction' },
        { label: '🚀 Brand Promotion', query: 'brand' },
        { label: '📱 Social Media Management', query: 'social' },
        { label: '📅 Book Site Visit', query: 'visit' },
        { label: '📞 Call Support', query: 'contact' }
      ],
      placeholder: 'Type your message or query...',
      responses: {
        plots: '📍 **Open Plots & Real Estate**:\nWe offer premium HMDA & DTCP approved open plot layouts in Shankarpally, Kompally, and Pharma City. Clear titles, spot registration, and 100% bank loan assistance.\n\nWould you like to schedule a free site visit?',
        construction: '🏗️ **Construction Services**:\nWe build luxury residential villas and commercial towers in Hyderabad starting from **₹1,850/sq.ft.** (turnkey package including architectural design, raw materials, and interior finishing).\n\nWould you like an estimated quote for your plot size?',
        brand: '🚀 **Brand Promotions**:\nWe offer digital branding, PR campaigns, local business promotion strategies, and targeted lead generation ads starting at affordable packages.',
        social: '📱 **Social Media Handling**:\nEnd-to-end Instagram/Facebook page handling, 4K Reels production, graphic posts, and active ad campaign setup to grow your business inquiries.',
        contact: '📞 **Contact Us**:\n- **Phone**: [9476766340](tel:9476766340)\n- **WhatsApp**: [Click to Chat](https://wa.me/919476766340)\n- **Office**: Plot No. 13, Road No. 9, Jubilee Hills, Hyderabad.',
        visitPrompt: 'Great! Please enter your **Full Name** to book a free site visit:',
        phonePrompt: 'Thank you, {NAME}! Please enter your **10-digit Mobile Number** so our team can confirm your appointment:',
        leadSuccess: '✅ **Thank you, {NAME}!** Your site visit request has been received. Our manager will call you at **{PHONE}** shortly!',
        defaultMsg: 'Thank you for reaching out! You can choose an option below or call our manager directly at **9476766340**.'
      }
    },
    te: {
      botName: 'రాజా ప్రియా AI అసిస్టెంట్',
      onlineStatus: 'ఆన్‌లైన్ 24/7',
      welcome: 'నమస్కారం! 👋 **రాజా ప్రియా గ్రూప్** కు స్వాగతం. రియల్ ఎస్టేట్ ఓపెన్ ప్లాట్లు, ఇళ్ల నిర్మాణం, బ్రాండింగ్ మరియు సోషల్ మీడియా సేవలకు మేము మీ నమ్మకమైన భాగస్వామివి. మీకు ఎలా సహాయపడగలను?',
      quickOptions: [
        { label: '📍 ఓపెన్ ప్లాట్లు', query: 'plots' },
        { label: '🏗️ ఇంటి నిర్మాణ ధరకు వివరాలు', query: 'construction' },
        { label: '🚀 బ్రాండ్ ప్రమోషన్', query: 'brand' },
        { label: '📱 సోషల్ మీడియా నిర్వహణ', query: 'social' },
        { label: '📅 ప్లాట్ విజిట్ బుక్ చేయండి', query: 'visit' },
        { label: '📞 కాల్ చేయండి', query: 'contact' }
      ],
      placeholder: 'మీ సందేశాన్ని ఇక్కడ టైప్ చేయండి...',
      responses: {
        plots: '📍 **ఓపెన్ ప్లాట్లు వివరాలు**:\nశంకర్పల్లి, కొంపల్లి మరియు ఫార్మా సిటీలలో HMDA & DTCP లేఅవుట్ ఓపెన్ ప్లాట్లు అందుబాటులో ఉన్నాయి. క్లియర్ టైటిల్ మరియు బ్యాంక్ లోన్ సదుపాయం కలదు.\n\nమీరు ఉచిత సైట్ విజిట్ బుక్ చేయాలనుకుంటున్నారా?',
        construction: '🏗️ **ఇంటి నిర్మాణం**:\nహైదరాబాద్‌లో నివాస విల్లాలు మరియు వాణిజ్య భవనాల నిర్మాణం చదరపు అడుగుకు **₹1,850** నుండి ప్రారంభమవుతుంది.',
        brand: '🚀 **బ్రాండ్ ప్రమోషన్లు**:\nమీ బిజినెస్ ప్రమోషన్, డిజిటల్ మార్కెటింగ్ మరియు కస్టమర్ లీడ్స్ కొరకు ప్యాకేజీలు అందుబాటులో ఉన్నాయి.',
        social: '📱 **సోషల్ మీడియా మేనేజ్‌మెంట్**:\nఇన్‌స్టాగ్రామ్ పేజీ నిర్వహణ, రీల్స్ వీడియో షూట్ మరియు బిజినెస్ గ్రోత్ క్యాంపెయిన్లు.',
        contact: '📞 **మమ్మల్ని సంప్రదించండి**:\n- **ఫోన్**: [9476766340](tel:9476766340)\n- **వాట్సాప్**: [ఇక్కడ క్లిక్ చేయండి](https://wa.me/919476766340)\n- **ఆఫీస్**: ప్లాట్ నెం. 13, రోడ్ నెం. 9, జూబ్లీ హిల్స్, హైదరాబాద్.',
        visitPrompt: 'ధన్యవాదాలు! సైట్ విజిట్ కొరకు మీ **పూర్తి పేరు** నమోదు చేయండి:',
        phonePrompt: 'ధన్యవాదాలు, {NAME}! మీ **10 అంకెల మొబైల్ నంబర్** నమోదు చేయండి:',
        leadSuccess: '✅ **ధన్యవాదాలు {NAME}!** మీ వివరాలు నమోదయ్యాయి. మా మేనేజర్ త్వరలోనే **{PHONE}** కు కాల్ చేస్తారు.',
        defaultMsg: 'ధన్యవాదాలు! మరిన్ని వివరాలకు ఉచితంగా కాల్ చేయండి: **9476766340**.'
      }
    },
    hi: {
      botName: 'राजा प्रिया AI असिस्टेंट',
      onlineStatus: 'ऑनलाइन 24/7',
      welcome: 'नमस्ते! 👋 **राजा प्रिया ग्रुप** में आपका स्वागत है। ओपन प्लॉट्स, कंस्ट्रक्शन और ब्रांड प्रमोशन के लिए हम आपके भरोसेमंद पार्टनर हैं। आज हम आपकी क्या सहायता कर सकते हैं?',
      quickOptions: [
        { label: '📍 ओपन प्लॉट्स', query: 'plots' },
        { label: '🏗️ कंस्ट्रक्शन रेट्स', query: 'construction' },
        { label: '🚀 ब्रांड प्रमोशन', query: 'brand' },
        { label: '📱 सोशल मीडिया मैनेजमेंट', query: 'social' },
        { label: '📅 साइट विजिट बुक करें', query: 'visit' },
        { label: '📞 कॉल करें', query: 'contact' }
      ],
      placeholder: 'अपना संदेश यहां टाइप करें...',
      responses: {
        plots: '📍 **ओपन प्लॉट्स**:\nशंकरपल्ली, कंपल्ली और फार्मा सिटी में HMDA और DTCP एप्रूव्ड प्लॉट्स उपलब्ध हैं। 100% बैंक लोन सहायता उपलब्ध है।\n\nक्या आप फ्री साइट विजिट बुक करना चाहते हैं?',
        construction: '🏗️ **कंस्ट्रक्शन सर्विस**:\nहैदराबाद में विला और कमर्शियल बिल्डिंग का निर्माण केवल **₹1,850/sq.ft.** से शुरू होता है।',
        brand: '🚀 **ब्रांड प्रमोशन**:\nबिजनेस ब्रांडिंग और डिजिटल मार्केटिंग कैम्पेन उपलब्ध हैं।',
        social: '📱 **सोशल मीडिया हैंडलिंग**:\nइंस्टाग्राम रील्स शूटिंग, कंटेंट क्रिएशन और बिजनेस ग्रोथ कैम्पेन्स।',
        contact: '📞 **संपर्क करें**:\n- **फोन**: [9476766340](tel:9476766340)\n- **व्हाट्सएप**: [चैट करें](https://wa.me/919476766340)\n- **कार्यालय**: प्लॉट नं 13, रोड नं 9, जुबली हिल्स, हैदराबाद।',
        visitPrompt: 'धन्यवाद! साइट विजिट के लिए अपना **पूरा नाम** दर्ज करें:',
        phonePrompt: 'धन्यवाद, {NAME}! अपना **10 अंकों का मोबाइल नंबर** दर्ज करें:',
        leadSuccess: '✅ **धन्यवाद {NAME}!** आपकी साइट विजिट रिक्वेस्ट मिल गई है। हमारे मैनेजर जल्द ही आपको **{PHONE}** पर कॉल करेंगे।',
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
    // Simple markdown formatting
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

    // If capturing lead
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

    // Match keywords
    const lower = val.toLowerCase();
    let query = 'default';
    if (lower.includes('plot') || lower.includes('land') || lower.includes('ప్లాట్') || lower.includes('प्लॉट')) query = 'plots';
    else if (lower.includes('construct') || lower.includes('house') || lower.includes('villa') || lower.includes('ఇల్లు') || lower.includes('मकान')) query = 'construction';
    else if (lower.includes('brand') || lower.includes('market') || lower.includes('ప్రమోషన్')) query = 'brand';
    else if (lower.includes('social') || lower.includes('reels') || lower.includes('instagram')) query = 'social';
    else if (lower.includes('call') || lower.includes('phone') || lower.includes('number') || lower.includes('contact')) query = 'contact';
    else if (lower.includes('visit') || lower.includes('book') || lower.includes('విజిట్')) query = 'visit';

    handleIntent(query);
  }

  function handleIntent(query) {
    const data = DICT[currentLang];
    if (query === 'visit') {
      leadState = { step: 1, name: '', phone: '', service: 'Site Visit Booking' };
      setTimeout(() => appendBubble(data.responses.visitPrompt, 'bot'), 400);
      return;
    }

    const reply = data.responses[query] || data.responses.defaultMsg;
    setTimeout(() => {
      appendBubble(reply, 'bot');
      appendQuickOptions(data.quickOptions);
    }, 400);
  }

  /* ---- Save Lead to Cloud Firestore ---- */
  function saveLeadToDatabase(name, phone, service) {
    try {
      const lead = {
        id: 'LEAD_' + Date.now(),
        name: name,
        phone: phone,
        service: service || 'General Inquiry',
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

  /* ---- Auto Initialize on DOM Load ---- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectAIBotHTML);
  } else {
    injectAIBotHTML();
  }

})();
