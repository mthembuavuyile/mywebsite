// js/app.js
(function () {
    'use strict';

    // ── DOM Elements ──────────────────────────────────────────
    const chatEl = document.getElementById('chat');
    const formEl = document.getElementById('form');
    const inputEl = document.getElementById('input');
    const micBtn = document.getElementById('mic-btn');
    const scrollBtn = document.getElementById('scroll-btn');
    const welcomeEl = document.getElementById('welcome-screen');
    const backdrop = document.getElementById('backdrop');
    const settingsPanel = document.getElementById('settings-panel');
    const voiceSelect = document.getElementById('voice-select');

    // Space Hub Modal Elements
    const spaceModal = document.getElementById('space-hub-modal');
    const spaceModalBody = document.getElementById('space-modal-body');
    const openSpaceModalBtn = document.getElementById('open-space-modal-btn');
    const closeSpaceModalBtn = document.getElementById('close-space-modal');

    // Sound Toggle Elements
    const soundToggleBtn = document.getElementById('sound-toggle-btn');
    const soundIcon = document.getElementById('sound-icon');
    const soundCheckbox = document.getElementById('sound-enabled');

    // Voice Settings Elements
    const rateSlider = document.getElementById('voice-rate');
    const rateVal = document.getElementById('rate-val');
    const pitchSlider = document.getElementById('voice-pitch');
    const pitchVal = document.getElementById('pitch-val');

    // ── Shared Application State ──────────────────────────────
    window.NexoraAppState = {
        theme: localStorage.getItem('nx_theme') || 'dark',
        ttsEnabled: localStorage.getItem('nx_tts') !== 'false',
        soundEnabled: localStorage.getItem('nx_sound') !== 'false',
        units: localStorage.getItem('nx_units') || 'metric',
        speechRate: parseFloat(localStorage.getItem('nx_rate') || '1.0'),
        speechPitch: parseFloat(localStorage.getItem('nx_pitch') || '1.0')
    };

    let synth = window.speechSynthesis;
    let voices = [];
    let selectedVoice = null;
    let isListening = false;
    let chatHistory = [];

    // ── Init ─────────────────────────────────────────
    applyTheme(window.NexoraAppState.theme);
    initSettings();
    initVoices();
    initSpeechRec();
    initSpaceHubModal();
    handleScrollVisibility();
    checkUrlParams();

    // Global suggestion launcher
    window.sendSuggestion = function (text) {
        if (window.NexoraAudio) window.NexoraAudio.playClick();
        inputEl.value = text;
        formEl.dispatchEvent(new Event('submit', { cancelable: true }));
    };

    // Check URL parameters for direct deep-linking
    function checkUrlParams() {
        const params = new URLSearchParams(window.location.search);
        const mode = params.get('mode');
        const query = params.get('query') || params.get('q');

        if (mode === 'space') {
            setTimeout(() => window.openSpaceHub(), 300);
        } else if (query) {
            setTimeout(() => sendSuggestion(query), 300);
        }
    }

    // ── Settings ─────────────────────────────────────
    function initSettings() {
        document.querySelectorAll('.theme-opt').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === window.NexoraAppState.theme);
            btn.addEventListener('click', () => {
                if (window.NexoraAudio) window.NexoraAudio.playClick();
                window.NexoraAppState.theme = btn.dataset.theme;
                applyTheme(window.NexoraAppState.theme);
                localStorage.setItem('nx_theme', window.NexoraAppState.theme);
                document.querySelectorAll('.theme-opt').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        document.getElementById('settings-btn').addEventListener('click', openSettings);
        document.getElementById('close-settings').addEventListener('click', closeSettings);
        backdrop.addEventListener('click', closeSettings);

        document.getElementById('clear-btn').addEventListener('click', () => {
            if (window.NexoraAudio) window.NexoraAudio.playClick();
            if (confirm('Start a new chat?')) {
                chatEl.innerHTML = '';
                chatEl.appendChild(welcomeEl);
                welcomeEl.classList.remove('hidden');
                chatHistory = [];
            }
        });

        // Sound Effects Toggle
        updateSoundUI();
        if (soundToggleBtn) {
            soundToggleBtn.addEventListener('click', () => {
                window.NexoraAppState.soundEnabled = !window.NexoraAppState.soundEnabled;
                localStorage.setItem('nx_sound', window.NexoraAppState.soundEnabled);
                updateSoundUI();
                if (window.NexoraAudio) window.NexoraAudio.playClick();
            });
        }

        if (soundCheckbox) {
            soundCheckbox.checked = window.NexoraAppState.soundEnabled;
            soundCheckbox.addEventListener('change', e => {
                window.NexoraAppState.soundEnabled = e.target.checked;
                localStorage.setItem('nx_sound', window.NexoraAppState.soundEnabled);
                updateSoundUI();
            });
        }

        const ttsToggle = document.getElementById('tts-enabled');
        if (ttsToggle) {
            ttsToggle.checked = window.NexoraAppState.ttsEnabled;
            ttsToggle.addEventListener('change', e => {
                window.NexoraAppState.ttsEnabled = e.target.checked;
                localStorage.setItem('nx_tts', window.NexoraAppState.ttsEnabled);
                if (!window.NexoraAppState.ttsEnabled && synth) synth.cancel();
            });
        }

        if (voiceSelect) {
            voiceSelect.addEventListener('change', e => {
                selectedVoice = voices[e.target.value];
            });
        }

        if (rateSlider && rateVal) {
            rateSlider.value = window.NexoraAppState.speechRate;
            rateVal.textContent = window.NexoraAppState.speechRate.toFixed(1);
            rateSlider.addEventListener('input', e => {
                const val = parseFloat(e.target.value);
                window.NexoraAppState.speechRate = val;
                rateVal.textContent = val.toFixed(1);
                localStorage.setItem('nx_rate', val);
            });
        }

        if (pitchSlider && pitchVal) {
            pitchSlider.value = window.NexoraAppState.speechPitch;
            pitchVal.textContent = window.NexoraAppState.speechPitch.toFixed(1);
            pitchSlider.addEventListener('input', e => {
                const val = parseFloat(e.target.value);
                window.NexoraAppState.speechPitch = val;
                pitchVal.textContent = val.toFixed(1);
                localStorage.setItem('nx_pitch', val);
            });
        }

        const unitsEl = document.getElementById('weather-units');
        if (unitsEl) {
            unitsEl.value = window.NexoraAppState.units;
            unitsEl.addEventListener('change', e => {
                window.NexoraAppState.units = e.target.value;
                localStorage.setItem('nx_units', window.NexoraAppState.units);
            });
        }

        const exportBtn = document.getElementById('export-chat-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', exportChat);
        }

        document.getElementById('reset-settings').addEventListener('click', () => {
            if (confirm('Reset all settings to default?')) {
                localStorage.clear();
                location.reload();
            }
        });
    }

    function updateSoundUI() {
        if (soundIcon) {
            soundIcon.className = window.NexoraAppState.soundEnabled ? 'fas fa-volume-high' : 'fas fa-volume-xmark';
        }
        if (soundToggleBtn) {
            soundToggleBtn.classList.toggle('active', window.NexoraAppState.soundEnabled);
        }
        if (soundCheckbox) {
            soundCheckbox.checked = window.NexoraAppState.soundEnabled;
        }
    }

    function applyTheme(t) { document.body.setAttribute('data-theme', t); }
    function openSettings() {
        if (window.NexoraAudio) window.NexoraAudio.playClick();
        settingsPanel.classList.add('open');
        backdrop.classList.add('show');
    }
    function closeSettings() {
        settingsPanel.classList.remove('open');
        backdrop.classList.remove('show');
    }

    // ── Space Hub Modal Controller ────────────────────
    function initSpaceHubModal() {
        if (openSpaceModalBtn) {
            openSpaceModalBtn.addEventListener('click', () => window.openSpaceHub());
        }
        if (closeSpaceModalBtn) {
            closeSpaceModalBtn.addEventListener('click', closeSpaceHub);
        }
    }

    window.openSpaceHub = async function(topic = '') {
        if (window.NexoraAudio) window.NexoraAudio.playClick();
        spaceModal.classList.add('open');
        spaceModal.setAttribute('aria-hidden', 'false');

        spaceModalBody.innerHTML = `
            <div style="text-align:center;padding:50px 20px;color:var(--space-cyan);">
                <i class="fas fa-rocket fa-spin fa-2x" style="margin-bottom:14px;"></i>
                <p style="font-weight:600;">Fetching live spaceflight intelligence stream…</p>
            </div>`;

        if (window.fetchAndRenderSpaceNews) {
            const res = await window.fetchAndRenderSpaceNews(topic, 12);
            spaceModalBody.innerHTML = res.html || `<p>${res.text}</p>`;
        }
    };

    function closeSpaceHub() {
        spaceModal.classList.remove('open');
        spaceModal.setAttribute('aria-hidden', 'true');
    }

    // ── Chat UI ──────────────────────────────────────
    function hideWelcome() {
        if (!welcomeEl.classList.contains('hidden')) welcomeEl.classList.add('hidden');
    }

    function appendMessage(role, content, isHtml = false, plainText = '') {
        hideWelcome();
        const wrap = document.createElement('div');
        wrap.className = `message ${role}`;

        if (role === 'assistant') {
            const av = document.createElement('div');
            av.className = 'bot-avatar';
            av.innerHTML = '<i class="fas fa-robot"></i>';
            wrap.appendChild(av);
        }

        const bubbleWrap = document.createElement('div');
        bubbleWrap.className = 'message-bubble-wrapper';

        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        if (isHtml) bubble.innerHTML = content;
        else bubble.textContent = content;
        bubbleWrap.appendChild(bubble);

        // Assistant action toolbar (Copy, Speak)
        if (role === 'assistant') {
            const toolbar = document.createElement('div');
            toolbar.className = 'msg-actions';

            const copyText = plainText || (isHtml ? bubble.innerText : content);

            toolbar.innerHTML = `
                <button class="msg-btn copy-btn" title="Copy to clipboard">
                    <i class="far fa-copy"></i> Copy
                </button>
                <button class="msg-btn tts-btn" title="Read aloud">
                    <i class="fas fa-volume-high"></i> Listen
                </button>
            `;

            const copyBtn = toolbar.querySelector('.copy-btn');
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(copyText).then(() => {
                    copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                    setTimeout(() => copyBtn.innerHTML = '<i class="far fa-copy"></i> Copy', 2000);
                });
            });

            const ttsBtn = toolbar.querySelector('.tts-btn');
            ttsBtn.addEventListener('click', () => speak(copyText));

            bubbleWrap.appendChild(toolbar);
        }

        wrap.appendChild(bubbleWrap);

        const ti = document.getElementById('typing-indicator');
        if (ti) ti.remove();

        chatEl.appendChild(wrap);
        scrollToBottom();

        // Save to chat history
        chatHistory.push({ role, text: plainText || content, timestamp: new Date().toISOString() });
    }

    function showTyping() {
        if (document.getElementById('typing-indicator')) return;
        hideWelcome();
        const wrap = document.createElement('div');
        wrap.id = 'typing-indicator';
        wrap.className = 'message assistant';
        wrap.innerHTML = `
            <div class="bot-avatar"><i class="fas fa-robot"></i></div>
            <div class="message-bubble-wrapper">
                <div class="message-bubble">
                    <div class="typing-dots">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
            </div>`;
        chatEl.appendChild(wrap);
        scrollToBottom();
    }

    function scrollToBottom() {
        chatEl.scrollTo({ top: chatEl.scrollHeight, behavior: 'smooth' });
    }

    function handleScrollVisibility() {
        chatEl.addEventListener('scroll', () => {
            const fromBottom = chatEl.scrollHeight - chatEl.clientHeight - chatEl.scrollTop;
            scrollBtn.classList.toggle('visible', fromBottom > 80);
        });
        scrollBtn.addEventListener('click', scrollToBottom);
    }

    // ── Form Submit & CORE NLP ENGINE ────────────────
    formEl.addEventListener('submit', e => {
        e.preventDefault();
        const text = inputEl.value.trim();
        if (!text) return;
        if (window.NexoraAudio) window.NexoraAudio.playSend();
        appendMessage('user', text);
        inputEl.value = '';
        processInput(text);
    });

    const FRIENDLY_EXAMPLES = {
        spacenews:  'show me space news',
        weather:    'weather in Durban',
        crypto:     'Bitcoin price',
        dictionary: 'define serendipity',
        jokes:      'tell me a joke',
        reddit:     'show me reddit posts',
        bible:      'a Bible verse',
        advice:     'give me some advice',
        image:      'show me a photo of space'
    };

    function getFriendlyExamples(count = 3) {
        const modules = (window.NexoraRegistry && window.NexoraRegistry.modules) || [];
        return modules
            .map(m => FRIENDLY_EXAMPLES[m.id] || m.example || m.name)
            .slice(0, count);
    }

    async function processInput(text) {
        showTyping();
        let resp = { html: null, text: '' };

        try {
            // 1. Greetings
            if (/^(hi|hello|hey|greetings)/i.test(text)) {
                resp.text = `Hello! I'm Nexora. I pull live spaceflight news, weather, crypto, math calculations and more. How can I help you today?`;
            }

            // 2. Help / capabilities
            else if (/^(help|what can you do|commands|capabilities)/i.test(text)) {
                const modules = (window.NexoraRegistry && window.NexoraRegistry.modules) || [];

                const listItems = modules.length > 0
                    ? modules.map(m => {
                        const example = FRIENDLY_EXAMPLES[m.id] || m.example || m.name;
                        return `<li><span class="help-example">${escapeHtml(example)}</span></li>`;
                    }).join('')
                    : '<li>Basic chat</li>';

                resp.text = `Here's what I can help with: ${getFriendlyExamples(4).join(', ')}, and more.`;

                resp.html = `
                    <div class="help-container">
                        <p style="margin:0 0 8px;font-weight:600;">Here's what I can do:</p>
                        <ul style="margin:0;padding-left:18px;line-height:1.8;">${listItems}</ul>
                    </div>`;
            }

            // 3. Smart module delegation
            else {
                const matchedAPI = window.NexoraRegistry ? window.NexoraRegistry.matchIntent(text) : null;

                if (matchedAPI) {
                    resp = await matchedAPI.module.handle(matchedAPI.match, window.NexoraAppState);
                } else {
                    const examples = getFriendlyExamples(3);
                    const hint = examples.length > 0
                        ? `Try asking "${examples[0]}", "${examples[1]}" or "${examples[2]}"`
                        : 'Try asking about space news, weather or crypto';

                    resp.text = `I'm not sure how to process that query. ${hint}. Type "help" to view all capabilities.`;
                }
            }
        } catch (err) {
            console.error(err);
            resp.text = "Something went wrong fetching data — please try again in a moment.";
        }

        if (window.NexoraAudio) window.NexoraAudio.playReceive();

        if (resp.html) appendMessage('assistant', resp.html, true, resp.text);
        else appendMessage('assistant', resp.text);

        speak(resp.text);
    }

    // ── Voice / Speech ───────────────────────────────
    function initVoices() {
        if (!synth) return;
        const load = () => {
            voices = synth.getVoices();
            if (!voices.length) { setTimeout(load, 150); return; }
            if (voiceSelect) voiceSelect.innerHTML = '';

            voices.forEach((v, i) => {
                if (!v.lang.startsWith('en')) return;
                const o = document.createElement('option');
                o.value = i;
                o.textContent = `${v.name} (${v.lang})`;
                if (voiceSelect) voiceSelect.appendChild(o);
            });

            selectedVoice = voices.find(v => v.lang === 'en-US') || voices[0];
            if (voiceSelect && selectedVoice) {
                voiceSelect.value = voices.indexOf(selectedVoice);
            }
        };
        if (synth.onvoiceschanged !== undefined) synth.onvoiceschanged = load;
        load();
    }

    function speak(text) {
        if (!window.NexoraAppState.ttsEnabled || !synth) return;
        synth.cancel();
        const clean = text.replace(/<[^>]*>/g, '');
        const u = new SpeechSynthesisUtterance(clean);
        if (selectedVoice) u.voice = selectedVoice;
        u.rate = window.NexoraAppState.speechRate;
        u.pitch = window.NexoraAppState.speechPitch;
        synth.speak(u);
    }

    function initSpeechRec() {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) {
            if (micBtn) micBtn.style.display = 'none';
            return;
        }
        const rec = new SR();
        rec.continuous = false;
        rec.interimResults = false;

        rec.onstart = () => {
            isListening = true;
            micBtn.classList.add('listening');
            inputEl.placeholder = 'Listening to your voice…';
            if (window.NexoraAudio) window.NexoraAudio.playMic();
        };

        rec.onresult = e => {
            inputEl.value = e.results[0][0].transcript;
            formEl.dispatchEvent(new Event('submit', { cancelable: true }));
        };

        rec.onend = () => {
            isListening = false;
            micBtn.classList.remove('listening');
            inputEl.placeholder = 'Message Nexora…';
        };

        micBtn.addEventListener('click', () => isListening ? rec.stop() : rec.start());
    }

    // ── Export Chat ──────────────────────────────────
    function exportChat() {
        if (!chatHistory.length) {
            alert('No chat history to export yet!');
            return;
        }
        const exportData = JSON.stringify(chatHistory, null, 2);
        const blob = new Blob([exportData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nexora-chat-export-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // ── Helpers ──────────────────────────────────────
    function escapeHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

})();