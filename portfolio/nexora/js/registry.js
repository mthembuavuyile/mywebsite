// js/registry.js
(function() {
    'use strict';

    window.NexoraRegistry = {
        modules: [],

        moduleMeta: {
            ocr: {
                id: 'ocr',
                icon: 'fas fa-font',
                slash: '/ocr',
                title: 'Text Recognition (OCR)',
                desc: 'Extract text from images, photos or camera',
                keywords: ['ocr', 'scan', 'read', 'extract', 'transcribe', 'photo', 'picture', 'image', 'document', 'writing'],
                example: 'scan text from image'
            },
            spacenews: {
                id: 'spacenews',
                icon: 'fas fa-rocket',
                slash: '/space',
                title: 'Space Intelligence',
                desc: 'Latest NASA, SpaceX & orbit news',
                keywords: ['space', 'spacex', 'nasa', 'rocket', 'orbit', 'artemis', 'astronomy', 'launch', 'starship'],
                example: 'latest space news'
            },
            weather: {
                id: 'weather',
                icon: 'fas fa-cloud-sun',
                slash: '/weather',
                title: 'Live Weather',
                desc: 'Global forecasts & temperatures',
                keywords: ['weather', 'forecast', 'temperature', 'climate', 'rain', 'sunny', 'degree', 'hot', 'cold'],
                example: 'weather in Durban'
            },
            crypto: {
                id: 'crypto',
                icon: 'fab fa-bitcoin',
                slash: '/crypto',
                title: 'Crypto Ticker',
                desc: 'Real-time coin prices & stats',
                keywords: ['crypto', 'bitcoin', 'btc', 'ethereum', 'eth', 'solana', 'doge', 'coin', 'crypto price'],
                example: 'bitcoin price'
            },
            math: {
                id: 'math',
                icon: 'fas fa-calculator',
                slash: '/math',
                title: 'Math Solver',
                desc: 'Step-by-step math & equations',
                keywords: ['math', 'calculate', 'solve', 'equation', 'derivative', 'integral', 'algebra', 'calculus'],
                example: 'derivative of x^2 + 2x'
            },
            currency: {
                id: 'currency',
                icon: 'fas fa-money-bill-wave',
                slash: '/currency',
                title: 'Currency Exchange',
                desc: 'Live FX conversion rates',
                keywords: ['currency', 'convert', 'exchange', 'usd', 'eur', 'gbp', 'zar', 'jpy', 'forex', 'money'],
                example: 'convert 100 USD to EUR'
            },
            dictionary: {
                id: 'dictionary',
                icon: 'fas fa-book',
                slash: '/define',
                title: 'Dictionary',
                desc: 'Definitions, phonetics & synonyms',
                keywords: ['define', 'definition', 'meaning', 'dictionary', 'what is'],
                example: 'define serendipity'
            },
            image: {
                id: 'image',
                icon: 'fas fa-camera-retro',
                slash: '/image',
                title: 'Visual Search',
                desc: 'Fetch & generate visual cards',
                keywords: ['image', 'photo', 'picture', 'visual', 'show photo', 'show image'],
                example: 'show image of deep space'
            },
            reddit: {
                id: 'reddit',
                icon: 'fab fa-reddit',
                slash: '/reddit',
                title: 'Reddit Headlines',
                desc: 'Trending discussions & subreddits',
                keywords: ['reddit', 'subreddit', 'post', 'thread', 'headlines'],
                example: 'show reddit news'
            },
            bible: {
                id: 'bible',
                icon: 'fas fa-bible',
                slash: '/bible',
                title: 'Bible Verse',
                desc: 'Inspirational scriptures & verses',
                keywords: ['bible', 'verse', 'scripture', 'proverbs', 'psalm'],
                example: 'give me a Bible verse'
            },
            advice: {
                id: 'advice',
                icon: 'fas fa-lightbulb',
                slash: '/advice',
                title: 'Life Advice',
                desc: 'Practical life tips & wisdom',
                keywords: ['advice', 'tip', 'wisdom', 'suggestion', 'recommendation'],
                example: 'give me some advice'
            },
            jokes: {
                id: 'jokes',
                icon: 'fas fa-laugh-beam',
                slash: '/joke',
                title: 'Random Joke',
                desc: 'Geeky & clean humor',
                keywords: ['joke', 'funny', 'laugh', 'humor', 'tell me a joke'],
                example: 'tell me a joke'
            }
        },

        // Modules call this function to register themselves
        register(module) {
            // Attach metadata if available
            if (module.id && this.moduleMeta[module.id]) {
                Object.assign(module, this.moduleMeta[module.id]);
            }
            this.modules.push(module);
            console.log(`[Registry] Loaded module: ${module.name || module.id}`);
        },

        // Get all registered module metadata for Slash Palette & UI
        getAllModules() {
            return this.modules.map(m => ({
                id: m.id,
                name: m.title || m.name || m.id,
                icon: m.icon || 'fas fa-cube',
                slash: m.slash || `/${m.id}`,
                desc: m.desc || m.example || '',
                example: m.example || ''
            }));
        },

        // 3-Tier Robust Intent Matcher
        matchIntent(text) {
            if (!text || typeof text !== 'string') return null;
            const cleanText = text.trim();
            const lowerText = cleanText.toLowerCase();

            // ── Tier 1: Exact Regex Intent Matching ──
            for (const module of this.modules) {
                if (module.intents && Array.isArray(module.intents)) {
                    for (const regex of module.intents) {
                        const match = cleanText.match(regex);
                        if (match) {
                            return { module, match, confidence: 1.0, tier: 'regex' };
                        }
                    }
                }
            }

            // ── Tier 2: Keyword / Synonym Mapping ──
            for (const module of this.modules) {
                const keywords = module.keywords || (this.moduleMeta[module.id] && this.moduleMeta[module.id].keywords) || [];
                for (const kw of keywords) {
                    if (lowerText.includes(kw)) {
                        const artificialMatch = this.createArtificialMatch(module, cleanText, kw);
                        if (artificialMatch) {
                            return { module, match: artificialMatch, confidence: 0.85, tier: 'keyword' };
                        }
                    }
                }
            }

            // ── Tier 3: Token Overlap / Fuzzy Matching ──
            let bestModule = null;
            let highestScore = 0;
            const userTokens = lowerText.split(/\s+/).filter(t => t.length > 2);

            for (const module of this.modules) {
                const keywords = module.keywords || (this.moduleMeta[module.id] && this.moduleMeta[module.id].keywords) || [];
                let score = 0;
                for (const token of userTokens) {
                    for (const kw of keywords) {
                        if (kw.includes(token) || token.includes(kw)) {
                            score += 1;
                        }
                    }
                }
                if (score > highestScore && score >= 1) {
                    highestScore = score;
                    bestModule = module;
                }
            }

            if (bestModule) {
                const artificialMatch = this.createArtificialMatch(bestModule, cleanText, 'fuzzy');
                return { module: bestModule, match: artificialMatch, confidence: 0.65, tier: 'fuzzy' };
            }

            return null;
        },

        // Helper to construct usable match arrays for module.handle(match) when regex missed
        createArtificialMatch(module, text, keyword) {
            const id = module.id;

            switch (id) {
                case 'weather': {
                    let city = text.replace(/^(what is the|show me|tell me|get|check)?\s*(weather|forecast|temperature|temp|climate|rain)\s*(in|for|at|like in)?/gi, '').trim();
                    if (!city) city = 'Durban';
                    return [text, 'in', city];
                }
                case 'crypto': {
                    let coin = text.replace(/^(what is the|show me|get|check)?\s*(crypto|bitcoin|eth|ethereum|price|ticker|coin|value)\s*(of|for|right now)?/gi, '').trim();
                    if (!coin) coin = 'bitcoin';
                    return [text, 'price', coin];
                }
                case 'dictionary': {
                    let word = text.replace(/^(define|definition|meaning of|what is the meaning of|what does|mean|dictionary)/gi, '').trim();
                    if (!word) word = 'serendipity';
                    return [text, word];
                }
                case 'math': {
                    let expr = text.replace(/^(math|solve|calculate|evaluate|what is|compute)/gi, '').trim();
                    if (!expr) expr = text;
                    return [text, expr];
                }
                case 'currency': {
                    const numMatch = text.match(/\d+(\.\d+)?/);
                    const amount = numMatch ? numMatch[0] : '1';
                    const codes = text.match(/[A-Za-z]{3}/g) || [];
                    const fromCode = codes[0] || 'USD';
                    const toCode = codes[1] || 'EUR';
                    return [text, amount, fromCode, toCode];
                }
                case 'image': {
                    let query = text.replace(/^(show me|generate|fetch|find)?\s*(an?|the)?\s*(image|photo|picture|visual)\s*(of)?/gi, '').trim();
                    if (!query) query = 'deep space';
                    return [text, query];
                }
                case 'reddit': {
                    let sub = text.replace(/^(show me|fetch|get)?\s*(reddit|subreddit|posts|news|headlines)\s*(from|of|for|r\/)?/gi, '').trim();
                    return [text, sub || 'all'];
                }
                case 'spacenews':
                case 'ocr':
                case 'jokes':
                case 'bible':
                case 'advice':
                default:
                    return [text, text];
            }
        }
    };
})();