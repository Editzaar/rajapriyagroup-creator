/* =========================================================
   RAJA PRIYA GROUP — SMART AI ASSISTANT & LIVE PAGE KNOWLEDGE ENGINE
   Dynamic Web Page RAG Extractor, Multi-Language, Sleek UI & Lead Capture
   ========================================================= */

(function () {
  'use strict';

  let currentLang = 'en'; // 'en', 'te', 'hi'
  let leadState = { step: 0, name: '', phone: '', service: '' };
  let siteKnowledgeIndex = [];

  /* ---- 1. DYNAMIC WEBSITE KNOWLEDGE EXTRACTOR (RAG) ---- */
  function extractSiteKnowledge() {
    siteKnowledgeIndex = [];
    try {
      // Extract headings and paragraphs across the site DOM
      const elements = document.querySelectorAll('h1, h2, h3, h4, .section-sub, .hero-sub, .detail-list li, .chip-tag, article h3, article p, p');
      
      elements.forEach(el => {
        const text = el.innerText ? el.innerText.trim() : '';
        if (text && text.length > 8 && !text.includes('<script')) {
          siteKnowledgeIndex.push({
            text: text,
            tag: el.tagName ? el.tagName.toLowerCase() : 'p'
          });
        }
      });
    } catch (e) {
      console.warn('Knowledge extraction fallback active');
    }
  }

  function searchKnowledgeBase(userQuery) {
    if (!userQuery) return null;
    const query = userQuery.toLowerCase();

    // Match keywords against site knowledge
    const matches = siteKnowledgeIndex.filter(item => {
      const lowerText = item.text.toLowerCase();
      return query.split(' ').some(word => word.length > 3 && lowerText.includes(word));
    });

    if (matches.length > 0) {
      // Return top 2 relevant extracted sentences
      const topSentences = matches.slice(0, 2).map(m => m.text).join('\n\n');
      return `💡 **Information from our website**:\n${topSentences}`;
    }
    return null;
  }

  /* ---- 2. UI DICTIONARIES ---- */
  const DICT = {
    en: {
      botName: 'Raja Priya AI Assistant',
      onlineStatus: 'Online 24/7',
      welcome: 'Hello! 👋 How can I help you with your Video Editing, Web Development, or Brand Marketing project today?',
      quickOptions: [
        { label: '🎬 Video Editing', query: 'video' },
        { label: '💻 Web Dev', query: 'web' },
        { label: '🚀 Branding', query: 'brand' },
        { label: '📱 Social Media', query: 'social' },
        { label: '📅 Consult', query: 'consult' },
        { label: '📞 Contact', query: 'contact' }
      ],
      placeholder: 'Type your query or project details...',
      responses: {
        video: '🎬 **Video Editing Services**:\nWe specialize in Instagram Reels (9:16), Motion Graphics, 4K YouTube Editing, Short-Form Shorts, Color Grading & Sound Design.',
        web: '💻 **Website Development**:\nWe build high-performance Business Websites, Landing Pages, WordPress sites, WooCommerce stores (e.g. dpluscure.com), and offer Speed Optimization.',
        brand: '🚀 **Brand Promotions**:\nPerformance Marketing, Meta & Google PPC ads, Brand Identity, and Targeted Lead Generation.',
        social: '📱 **Social Media Management**:\nPage handling, 4K Reels production, content calendars, and social growth campaigns.',
        contact: '📞 **Contact Us**:\n- **Phone**: [9476766340](tel:9476766340)\n- **WhatsApp**: [Click to Chat](https://wa.me/919476766340)\n- **Office**: Jubilee Hills, Hyderabad.',
        consultPrompt: 'Please enter your **Full Name** to schedule a free consultation:',
        phonePrompt: 'Thank you, {NAME}! Please enter your **Mobile Number** so our team can contact you:',
        leadSuccess: '✅ **Thank you, {NAME}!** Your request has been saved. Our manager will call you at **{PHONE}** shortly!',
        defaultMsg: 'Thank you for reaching out! You can choose an option below or call our manager directly at **9476766340**.'
      }
    },
    te: {
      botName: 'రాజా ప్రియా AI అసిస్టెంట్',
      onlineStatus: 'ఆన్‌లైన్ 24/7',
      welcome: 'నమస్కారం! 👋 వీడియో ఎడిటింగ్, వెబ్‌సైట్ డెవలప్‌మెంట్ లేదా మార్కెటింగ్ కొరకు ఎలా సహాయపడగలను?',
      quickOptions: [
        { label: '🎬 వీడియో ఎడిటింగ్', query: 'video' },
        { label: '💻 వెబ్‌సైట్ డెవలప్‌మెంట్', query: 'web' },
        { label: '🚀 బ్రాండ్ ప్రమోషన్లు', query: 'brand' },
        { label: '📱 సోషల్ మీడియా', query: 'social' },
        { label: '📅 కన్సల్టేషన్', query: 'consult' },
        { label: '📞 సంప్రదించండి', query: 'contact' }
      ],
      placeholder: 'సందేశం టైప్ చేయండి...',
      responses: {
        video: '🎬 **వీడియో ఎడిటింగ్**:\nఇన్‌స్టాగ్రామ్ రీల్స్ (9:16), మోషన్ గ్రాఫిక్స్, యూట్యూబ్ ఎడిటింగ్ మరియు కలర్ గ్రేడింగ్.',
        web: '💻 **వెబ్‌సైట్ డెవలప్‌మెంట్**:\nబిజినెస్ వెబ్‌సైట్లు, వర్డ్‌ప్రెస్ డెవలప్‌మెంట్ మరియు ఈ-కామర్స్ ఆన్‌లైన్ స్టోర్లు.',
        brand: '🚀 **బ్రాండ్ ప్రమోషన్లు**:\nడిజిటల్ మార్కెటింగ్, పెర్ఫార్మెన్స్ మార్కెటింగ్ మరియు లీడ్ జనరేషన్.',
        social: '📱 **సోషల్ మీడియా మేనేజ్‌మెంట్**:\nపేజీ నిర్వహణ, రీల్స్ ప్రొడక్షన్ మరియు బిజినెస్ గ్రోత్.',
        contact: '📞 **సంప్రదించండి**: [9476766340](tel:9476766340) | [WhatsApp](https://wa.me/919476766340)',
        consultPrompt: 'మీ **పూర్తి పేరు** నమోదు చేయండి:',
        phonePrompt: 'ధన్యవాదాలు {NAME}! మీ **మొబైల్ నంబర్** నమోదు చేయండి:',
        leadSuccess: '✅ **ధన్యవాదాలు {NAME}!** మా మేనేజర్ త్వరలోనే **{PHONE}** కు కాల్ చేస్తారు.',
        defaultMsg: 'ధన్యవాదాలు! సంప్రదించండి: **9476766340**.'
      }
    },
    hi: {
      botName: 'राजा प्रिया AI असिस्टेंट',
      onlineStatus: 'ऑनलाइन 24/7',
      welcome: 'नमस्ते! 👋 वीडियो एडिटिंग, वेबसाइट डेवलपमेंट या ब्रांड प्रमोशन के लिए हम आपकी क्या सहायता कर सकते हैं?',
      quickOptions: [
        { label: '🎬 वीडियो एडिटिंग', query: 'video' },
        { label: '💻 वेबसाइट डेवलपमेंट', query: 'web' },
        { label: '🚀 ब्रांड प्रमोशन', query: 'brand' },
        { label: '📱 सोशल मीडिया', query: 'social' },
        { label: '📅 कंसल्टेशन', query: 'consult' },
        { label: '📞 संपर्क करें', query: 'contact' }
      ],
      placeholder: 'संदेश टाइप करें...',
      responses: {
        video: '🎬 **वीडियो एडिटिंग**:\nइंस्टाग्राम रील्स, मोशन ग्राफिक्स, यूट्यूब एडिटिंग और कलर ग्रेडिंग।',
        web: '💻 **वेबसाइट डेवलपमेंट**:\nबिजनेस वेबसाइट्स, वर्डप्रेस और ई-कॉमर्स स्टोर्स।',
        brand: '🚀 **ब्रांड प्रमोशन**:\nडिजिटल मार्केटिंग, विज्ञापन कैम्पेन और लीड जनरेशन।',
        social: '📱 **सोशल मीडिया**:\nपेज हैंडलिंग, रील्स शूटिंग और बिजनेस ग्रोथ।',
        contact: '📞 **संपर्क करें**: [9476766340](tel:9476766340) | [WhatsApp](https://wa.me/919476766340)',
        consultPrompt: 'अपना **पूरा नाम** दर्ज करें:',
        phonePrompt: 'धन्यवाद {NAME}! अपना **मोबाइल नंबर** दर्ज करें:',
        leadSuccess: '✅ **धन्यवाद {NAME}!** हमारे मैनेजर जल्द ही आपको **{PHONE}** पर कॉल करेंगे।',
        defaultMsg: 'धन्यवाद! सीधे कॉल करें: **9476766340**.'
      }
    }
  };

  /* ---- 3. INJECT SLEEK HTML UI ---- */
  function injectAIBotHTML() {
    if (document.getElementById('aiBotWindow')) return;

    extractSiteKnowledge();

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
        <button class="ai-lang-btn active" data-lang="en">🇬🇧 EN</button>
        <button class="ai-lang-btn" data-lang="te">🇮🇳 TE</button>
        <button class="ai-lang-btn" data-lang="hi">🇮🇳 HI</button>
      </div>

      <div class="ai-bot-messages" id="aiBotMessages"></div>

      <div class="ai-quick-options-wrapper">
        <div class="ai-quick-options" id="aiQuickOptions"></div>
      </div>

      <div class="ai-bot-input-area">
        <input type="text" class="ai-bot-input" id="aiBotInput" placeholder="Type your query..." />
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
    renderQuickPills(data.quickOptions);
  }

  function renderQuickPills(options) {
    const container = document.getElementById('aiQuickOptions');
    if (!container) return;
    container.innerHTML = '';
    options.forEach(opt => {
      const pill = document.createElement('button');
      pill.className = 'ai-quick-pill';
      pill.textContent = opt.label;
      pill.addEventListener('click', () => {
        appendBubble(opt.label, 'user');
        handleIntent(opt.query);
      });
      container.appendChild(pill);
    });
  }

  function showTypingIndicator() {
    const msgContainer = document.getElementById('aiBotMessages');
    const indicator = document.createElement('div');
    indicator.className = 'ai-typing-indicator';
    indicator.id = 'aiTypingIndicator';
    indicator.innerHTML = `
      <span class="ai-typing-dot"></span>
      <span class="ai-typing-dot"></span>
      <span class="ai-typing-dot"></span>
    `;
    msgContainer.appendChild(indicator);
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }

  function removeTypingIndicator() {
    const el = document.getElementById('aiTypingIndicator');
    if (el) el.remove();
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

  function handleUserSend() {
    const input = document.getElementById('aiBotInput');
    const val = input.value.trim();
    if (!val) return;

    appendBubble(val, 'user');
    input.value = '';

    // Handle lead collection state
    if (leadState.step === 1) {
      leadState.name = val;
      leadState.step = 2;
      const data = DICT[currentLang];
      const reply = data.responses.phonePrompt.replace('{NAME}', val);
      showTypingIndicator();
      setTimeout(() => {
        removeTypingIndicator();
        appendBubble(reply, 'bot');
      }, 400);
      return;
    } else if (leadState.step === 2) {
      leadState.phone = val;
      leadState.step = 0;
      saveLeadToDatabase(leadState.name, leadState.phone, leadState.service);
      const data = DICT[currentLang];
      const reply = data.responses.leadSuccess.replace('{NAME}', leadState.name).replace('{PHONE}', val);
      showTypingIndicator();
      setTimeout(() => {
        removeTypingIndicator();
        appendBubble(reply, 'bot');
      }, 400);
      return;
    }

    // 1. Try Dynamic Site Knowledge RAG Search first
    showTypingIndicator();
    setTimeout(() => {
      removeTypingIndicator();
      const siteAnswer = searchKnowledgeBase(val);
      if (siteAnswer) {
        appendBubble(siteAnswer, 'bot');
        return;
      }

      // 2. Intent Keyword Fallback
      const lower = val.toLowerCase();
      let query = 'default';
      if (lower.includes('video') || lower.includes('reel') || lower.includes('edit')) query = 'video';
      else if (lower.includes('web') || lower.includes('site') || lower.includes('wordpress') || lower.includes('dpluscure')) query = 'web';
      else if (lower.includes('brand') || lower.includes('market') || lower.includes('ad')) query = 'brand';
      else if (lower.includes('social') || lower.includes('instagram')) query = 'social';
      else if (lower.includes('call') || lower.includes('phone') || lower.includes('contact')) query = 'contact';
      else if (lower.includes('consult') || lower.includes('book')) query = 'consult';

      handleIntent(query);
    }, 450);
  }

  function handleIntent(query) {
    const data = DICT[currentLang];
    if (query === 'consult') {
      leadState = { step: 1, name: '', phone: '', service: 'Creative Consultation' };
      appendBubble(data.responses.consultPrompt, 'bot');
      return;
    }

    const reply = data.responses[query] || data.responses.defaultMsg;
    appendBubble(reply, 'bot');
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
