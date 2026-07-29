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
    initOCRButtonsAndDragDrop();
    initSlashCommandPalette();
    handleScrollVisibility();
    checkUrlParams();

    // Global suggestion launcher
    window.sendSuggestion = function (text) {
        if (window.NexoraAudio) window.NexoraAudio.playClick();
        inputEl.value = text;
        formEl.dispatchEvent(new Event('submit', { cancelable: true }));
    };

    // ── OCR Trigger & Drag-Drop / Paste Integration ──
    function initOCRButtonsAndDragDrop() {
        const ocrBtn = document.getElementById('ocr-trigger-btn');
        if (ocrBtn) {
            ocrBtn.addEventListener('click', () => {
                if (window.NexoraAudio) window.NexoraAudio.playClick();
                if (window.openOCRModal) window.openOCRModal();
                else processInput('scan text from image');
            });
        }

        const dropOverlay = document.getElementById('drop-overlay');

        // Global Drag Over
        window.addEventListener('dragover', e => {
            if (e.dataTransfer && e.dataTransfer.types && Array.from(e.dataTransfer.types).includes('Files')) {
                e.preventDefault();
                if (dropOverlay) dropOverlay.classList.remove('hidden');
            }
        });

        // Global Drag Leave
        window.addEventListener('dragleave', e => {
            if (e.clientX <= 0 || e.clientY <= 0 || e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
                if (dropOverlay) dropOverlay.classList.add('hidden');
            }
        });

        // Global Drop
        window.addEventListener('drop', e => {
            e.preventDefault();
            if (dropOverlay) dropOverlay.classList.add('hidden');

            const files = e.dataTransfer?.files;
            if (files && files.length > 0) {
                const file = files[0];
                if (file.type.startsWith('image/')) {
                    if (window.openOCRWithFile) {
                        window.openOCRWithFile(file);
                    } else {
                        processInput('scan text from image');
                    }
                }
            }
        });

        // Global Paste (Ctrl+V Image Handler)
        window.addEventListener('paste', e => {
            const items = e.clipboardData?.items;
            if (!items) return;

            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    const file = items[i].getAsFile();
                    if (file) {
                        e.preventDefault();
                        if (window.openOCRWithFile) {
                            window.openOCRWithFile(file);
                        } else {
                            processInput('scan text from image');
                        }
                        break;
                    }
                }
            }
        });
    }

    // ── Slash Command Palette (/ Tool Launcher) ───────
    function initSlashCommandPalette() {
        const slashPalette = document.getElementById('slash-palette');
        if (!slashPalette) return;

        function updatePalette() {
            const val = inputEl.value;
            if (!val.startsWith('/')) {
                slashPalette.classList.add('hidden');
                return;
            }

            const search = val.slice(1).toLowerCase().trim();
            const modules = (window.NexoraRegistry && window.NexoraRegistry.getAllModules)
                ? window.NexoraRegistry.getAllModules()
                : [];

            const filtered = modules.filter(m => 
                m.slash.toLowerCase().includes(search) || 
                m.name.toLowerCase().includes(search) ||
                m.desc.toLowerCase().includes(search)
            );

            if (!filtered.length) {
                slashPalette.classList.add('hidden');
                return;
            }

            slashPalette.innerHTML = filtered.map(m => `
                <div class="slash-item" data-example="${escapeHtml(m.example || m.slash)}">
                    <div class="slash-icon"><i class="${m.icon}"></i></div>
                    <div class="slash-details">
                        <span class="slash-title">${escapeHtml(m.name)}</span>
                        <span class="slash-desc">${escapeHtml(m.desc)}</span>
                    </div>
                    <span class="slash-cmd">${escapeHtml(m.slash)}</span>
                </div>
            `).join('');

            slashPalette.classList.remove('hidden');

            slashPalette.querySelectorAll('.slash-item').forEach(item => {
                item.addEventListener('click', () => {
                    if (window.NexoraAudio) window.NexoraAudio.playClick();
                    const ex = item.getAttribute('data-example');
                    inputEl.value = ex;
                    slashPalette.classList.add('hidden');
                    inputEl.focus();
                });
            });
        }

        inputEl.addEventListener('input', updatePalette);
        inputEl.addEventListener('focus', () => { if (inputEl.value.startsWith('/')) updatePalette(); });
        
        document.addEventListener('click', e => {
            if (!slashPalette.contains(e.target) && e.target !== inputEl) {
                slashPalette.classList.add('hidden');
            }
        });
    }

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
        if (!soundIcon) return;
        if (window.NexoraAppState.soundEnabled) {
            soundIcon.className = 'fas fa-volume-high';
            if (soundToggleBtn) soundToggleBtn.setAttribute('title', 'Mute Sound FX');
        } else {
            soundIcon.className = 'fas fa-volume-xmark';
            if (soundToggleBtn) soundToggleBtn.setAttribute('title', 'Enable Sound FX');
        }
    }

    function applyTheme(theme) {
        document.body.setAttribute('data-theme', theme);
    }

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
        const slashPalette = document.getElementById('slash-palette');
        if (slashPalette) slashPalette.classList.add('hidden');
        processInput(text);
    });

    const FRIENDLY_EXAMPLES = {
        ocr:        'scan text from image',
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
                resp.text = `Hello! I'm Nexora. I pull live spaceflight news, weather, crypto, math calculations, document text (OCR) and more. How can I help you today?`;
            }

            // 2. Help / capabilities
            else if (/^(help|what can you do|commands|capabilities)/i.test(text)) {
                const modules = (window.NexoraRegistry && window.NexoraRegistry.modules) || [];

                const listItems = modules.length > 0
                    ? modules.map(m => {
                        const example = FRIENDLY_EXAMPLES[m.id] || m.example || m.name;
                        return `<li><span class="help-example" onclick="sendSuggestion('${escapeHtml(example)}')">${escapeHtml(example)}</span> — ${escapeHtml(m.desc || m.name)}</li>`;
                    }).join('')
                    : '<li>Basic chat</li>';

                resp.text = `Here's what I can help with: ${getFriendlyExamples(4).join(', ')}, and more.`;

                resp.html = `
                    <div class="help-container">
                        <p style="margin:0 0 8px;font-weight:600;">Nexora Capabilities & Slash Commands:</p>
                        <ul style="margin:0;padding-left:18px;line-height:1.8;">${listItems}</ul>
                    </div>`;
            }

            // 3. Smart module delegation
            else {
                const matchedAPI = window.NexoraRegistry ? window.NexoraRegistry.matchIntent(text) : null;

                if (matchedAPI && matchedAPI.module) {
                    resp = await matchedAPI.module.handle(matchedAPI.match, window.NexoraAppState);
                } else {
                    resp.text = `I couldn't quite match your query. Pick one of Nexora's live tools below:`;
                    resp.html = `
                        <div class="rich-widget disambiguation-widget">
                            <div class="widget-title"><i class="fas fa-compass"></i> Pick a Live Nexora Tool</div>
                            <p style="margin:4px 0 12px 0;font-size:0.88rem;color:var(--text-muted);">
                                Couldn't match "<em>${escapeHtml(text)}</em>" to an exact command. Select what you would like to run:
                            </p>
                            <div class="dis-chips">
                                <button class="dis-chip" onclick="if(window.openOCRModal) window.openOCRModal(); else sendSuggestion('scan text from image');">
                                    <i class="fas fa-font"></i> OCR Scan Image
                                </button>
                                <button class="dis-chip" onclick="sendSuggestion('weather in Durban')">
                                    <i class="fas fa-cloud-sun"></i> Weather Forecast
                                </button>
                                <button class="dis-chip" onclick="sendSuggestion('bitcoin price')">
                                    <i class="fab fa-bitcoin"></i> Crypto Ticker
                                </button>
                                <button class="dis-chip" onclick="sendSuggestion('derivative of x^2 + 2x')">
                                    <i class="fas fa-calculator"></i> Math Solver
                                </button>
                                <button class="dis-chip" onclick="sendSuggestion('Show me latest space news')">
                                    <i class="fas fa-rocket"></i> Space News
                                </button>
                                <button class="dis-chip" onclick="sendSuggestion('define serendipity')">
                                    <i class="fas fa-book"></i> Dictionary
                                </button>
                            </div>
                        </div>`;
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