function bibleApp() {
    return {

        // ─────────────────────────────────────────────
        // CONSTANTS & DATA
        // ─────────────────────────────────────────────

        bibleBooks: [
            { id: 'GEN', name: 'Genesis', chapters: 50, testament: 'OT' },
            { id: 'EXO', name: 'Exodus', chapters: 40, testament: 'OT' },
            { id: 'LEV', name: 'Leviticus', chapters: 27, testament: 'OT' },
            { id: 'NUM', name: 'Numbers', chapters: 36, testament: 'OT' },
            { id: 'DEU', name: 'Deuteronomy', chapters: 34, testament: 'OT' },
            { id: 'JOS', name: 'Joshua', chapters: 24, testament: 'OT' },
            { id: 'JDG', name: 'Judges', chapters: 21, testament: 'OT' },
            { id: 'RUT', name: 'Ruth', chapters: 4, testament: 'OT' },
            { id: '1SA', name: '1 Samuel', chapters: 31, testament: 'OT' },
            { id: '2SA', name: '2 Samuel', chapters: 24, testament: 'OT' },
            { id: '1KI', name: '1 Kings', chapters: 22, testament: 'OT' },
            { id: '2KI', name: '2 Kings', chapters: 25, testament: 'OT' },
            { id: '1CH', name: '1 Chronicles', chapters: 29, testament: 'OT' },
            { id: '2CH', name: '2 Chronicles', chapters: 36, testament: 'OT' },
            { id: 'EZR', name: 'Ezra', chapters: 10, testament: 'OT' },
            { id: 'NEH', name: 'Nehemiah', chapters: 13, testament: 'OT' },
            { id: 'EST', name: 'Esther', chapters: 10, testament: 'OT' },
            { id: 'JOB', name: 'Job', chapters: 42, testament: 'OT' },
            { id: 'PSA', name: 'Psalms', chapters: 150, testament: 'OT' },
            { id: 'PRO', name: 'Proverbs', chapters: 31, testament: 'OT' },
            { id: 'ECC', name: 'Ecclesiastes', chapters: 12, testament: 'OT' },
            { id: 'SNG', name: 'Song of Solomon', chapters: 8, testament: 'OT' },
            { id: 'ISA', name: 'Isaiah', chapters: 66, testament: 'OT' },
            { id: 'JER', name: 'Jeremiah', chapters: 52, testament: 'OT' },
            { id: 'LAM', name: 'Lamentations', chapters: 5, testament: 'OT' },
            { id: 'EZK', name: 'Ezekiel', chapters: 48, testament: 'OT' },
            { id: 'DAN', name: 'Daniel', chapters: 12, testament: 'OT' },
            { id: 'HOS', name: 'Hosea', chapters: 14, testament: 'OT' },
            { id: 'JOL', name: 'Joel', chapters: 3, testament: 'OT' },
            { id: 'AMO', name: 'Amos', chapters: 9, testament: 'OT' },
            { id: 'OBA', name: 'Obadiah', chapters: 1, testament: 'OT' },
            { id: 'JON', name: 'Jonah', chapters: 4, testament: 'OT' },
            { id: 'MIC', name: 'Micah', chapters: 7, testament: 'OT' },
            { id: 'NAM', name: 'Nahum', chapters: 3, testament: 'OT' },
            { id: 'HAB', name: 'Habakkuk', chapters: 3, testament: 'OT' },
            { id: 'ZEP', name: 'Zephaniah', chapters: 3, testament: 'OT' },
            { id: 'HAG', name: 'Haggai', chapters: 2, testament: 'OT' },
            { id: 'ZEC', name: 'Zechariah', chapters: 14, testament: 'OT' },
            { id: 'MAL', name: 'Malachi', chapters: 4, testament: 'OT' },
            { id: 'MAT', name: 'Matthew', chapters: 28, testament: 'NT' },
            { id: 'MRK', name: 'Mark', chapters: 16, testament: 'NT' },
            { id: 'LUK', name: 'Luke', chapters: 24, testament: 'NT' },
            { id: 'JHN', name: 'John', chapters: 21, testament: 'NT' },
            { id: 'ACT', name: 'Acts', chapters: 28, testament: 'NT' },
            { id: 'ROM', name: 'Romans', chapters: 16, testament: 'NT' },
            { id: '1CO', name: '1 Corinthians', chapters: 16, testament: 'NT' },
            { id: '2CO', name: '2 Corinthians', chapters: 13, testament: 'NT' },
            { id: 'GAL', name: 'Galatians', chapters: 6, testament: 'NT' },
            { id: 'EPH', name: 'Ephesians', chapters: 6, testament: 'NT' },
            { id: 'PHP', name: 'Philippians', chapters: 4, testament: 'NT' },
            { id: 'COL', name: 'Colossians', chapters: 4, testament: 'NT' },
            { id: '1TH', name: '1 Thessalonians', chapters: 5, testament: 'NT' },
            { id: '2TH', name: '2 Thessalonians', chapters: 3, testament: 'NT' },
            { id: '1TI', name: '1 Timothy', chapters: 6, testament: 'NT' },
            { id: '2TI', name: '2 Timothy', chapters: 4, testament: 'NT' },
            { id: 'TIT', name: 'Titus', chapters: 3, testament: 'NT' },
            { id: 'PHM', name: 'Philemon', chapters: 1, testament: 'NT' },
            { id: 'HEB', name: 'Hebrews', chapters: 13, testament: 'NT' },
            { id: 'JAS', name: 'James', chapters: 5, testament: 'NT' },
            { id: '1PE', name: '1 Peter', chapters: 5, testament: 'NT' },
            { id: '2PE', name: '2 Peter', chapters: 3, testament: 'NT' },
            { id: '1JN', name: '1 John', chapters: 5, testament: 'NT' },
            { id: '2JN', name: '2 John', chapters: 1, testament: 'NT' },
            { id: '3JN', name: '3 John', chapters: 1, testament: 'NT' },
            { id: 'JUD', name: 'Jude', chapters: 1, testament: 'NT' },
            { id: 'REV', name: 'Revelation', chapters: 22, testament: 'NT' }
        ],

        translations: [
            { id: 'web', name: 'World English Bible (WEB)' },
            { id: 'kjv', name: 'King James Version (KJV)' },
            { id: 'bbe', name: 'Bible in Basic English (BBE)' }
        ],

        themes: ['light', 'dark', 'sepia'],

        dailyVerses: [
            { text: "For God so loved the world, that he gave his one and only Son, that whoever believes in him should not perish, but have eternal life.", reference: "John 3:16", book: "JHN", chapter: 3, verse: 16 },
            { text: "I can do all things through Christ, who strengthens me.", reference: "Philippians 4:13", book: "PHP", chapter: 4, verse: 13 },
            { text: "Trust in Yahweh with all your heart, and don’t lean on your own understanding.", reference: "Proverbs 3:5", book: "PRO", chapter: 3, verse: 5 },
            { text: "But the fruit of the Spirit is love, joy, peace, patience, kindness, goodness, faith, gentleness, and self-control. Against such things there is no law.", reference: "Galatians 5:22-23", book: "GAL", chapter: 5, verse: 22 },
            { text: "For I know the thoughts that I think toward you, says Yahweh, thoughts of peace, and not of evil, to give you hope and a future.", reference: "Jeremiah 29:11", book: "JER", chapter: 29, verse: 11 },
            { text: "Yahweh is my shepherd: I shall lack nothing.", reference: "Psalms 23:1", book: "PSA", chapter: 23, verse: 1 },
            { text: "But those who wait for Yahweh will renew their strength. They will mount up with wings like eagles. They will run, and not be weary. They will walk, and not faint.", reference: "Isaiah 40:31", book: "ISA", chapter: 40, verse: 31 },
            { text: "And we know that all things work together for good for those who love God, for those who are called according to his purpose.", reference: "Romans 8:28", book: "ROM", chapter: 8, verse: 28 },
            { text: "Don’t be anxious for anything, but in everything by prayer and petition with thanksgiving, let your requests be made known to God.", reference: "Philippians 4:6", book: "PHP", chapter: 4, verse: 6 },
            { text: "Therefore if anyone is in Christ, he is a new creation. The old things have passed away. Behold, all things have become new.", reference: "2 Corinthians 5:17", book: "2CO", chapter: 5, verse: 17 }
        ],

        bollsTranslationMap: {
            web: 'WEB',
            kjv: 'KJV',
            bbe: 'WEB' // Bolls does not host BBE, so fallback gracefully to WEB
        },

        // ─────────────────────────────────────────────
        // STATE
        // ─────────────────────────────────────────────

        selectedBook: 'JHN',
        selectedChapter: 3,
        translation: 'web',
        theme: 'light',
        
        currentView: 'home',
        verseOfTheDay: null,

        verses: [],
        loading: false,
        error: false,
        errorMessage: '',

        highlights: {},

        // UI State
        showNavigator: false,
        navStep: 'books',   // 'books' | 'chapters'
        navBookId: '',
        searchQuery: '',
        showTranslationMenu: false,
        activeVerse: null,
        toast: { show: false, message: '', timeout: null },
        targetVerse: null,

        // Concurrency & Race Condition guards
        activeFetchId: 0,
        activeAbortController: null,

        // ─────────────────────────────────────────────
        // COMPUTED GETTERS
        // ─────────────────────────────────────────────

        get oldTestamentBooks() {
            const q = this.searchQuery.toLowerCase().trim();
            return this.bibleBooks.filter(
                b => b.testament === 'OT' && (b.name.toLowerCase().includes(q) || b.id.toLowerCase().includes(q))
            );
        },

        get newTestamentBooks() {
            const q = this.searchQuery.toLowerCase().trim();
            return this.bibleBooks.filter(
                b => b.testament === 'NT' && (b.name.toLowerCase().includes(q) || b.id.toLowerCase().includes(q))
            );
        },

        get currentBookName() {
            return this.bibleBooks.find(b => b.id === this.selectedBook)?.name || '';
        },

        get currentBook() {
            return this.bibleBooks.find(b => b.id === this.selectedBook) || null;
        },

        get currentPassageLabel() {
            return this.currentBookName ? `${this.currentBookName} ${this.selectedChapter}` : '';
        },

        get translationName() {
            return this.translations.find(t => t.id === this.translation)?.name || '';
        },

        get navBookName() {
            return this.bibleBooks.find(b => b.id === this.navBookId)?.name || '';
        },

        get navChapters() {
            const book = this.bibleBooks.find(b => b.id === this.navBookId);
            return book ? Array.from({ length: book.chapters }, (_, i) => i + 1) : [];
        },

        get isFirstChapter() {
            return this.selectedBook === 'GEN' && this.selectedChapter === 1;
        },

        get isLastChapter() {
            return this.selectedBook === 'REV' && this.selectedChapter === 22;
        },

        isVerseHighlighted(verse) {
            if (!verse) return false;
            const key = `${this.selectedBook}-${this.selectedChapter}-${verse.verse}`;
            return !!this.highlights[key];
        },

        // ─────────────────────────────────────────────
        // HELPERS
        // ─────────────────────────────────────────────

        _findBook(query) {
            if (!query) return null;
            const q = String(query).trim().toLowerCase();
            return this.bibleBooks.find(b => b.id.toLowerCase() === q || b.name.toLowerCase() === q) || null;
        },

        _updateUrl(push = false) {
            try {
                const url = new URL(window.location.href);
                if (this.currentView === 'home') {
                    url.search = '';
                } else {
                    url.searchParams.set('book', this.selectedBook);
                    url.searchParams.set('chapter', String(this.selectedChapter));
                    if (this.translation !== 'web') {
                        url.searchParams.set('translation', this.translation);
                    } else {
                        url.searchParams.delete('translation');
                    }
                    if (this.targetVerse) {
                        url.searchParams.set('verse', String(this.targetVerse));
                    } else {
                        url.searchParams.delete('verse');
                    }
                }
                const state = { view: this.currentView, book: this.selectedBook, chapter: this.selectedChapter };
                if (push) {
                    history.pushState(state, '', url.toString());
                } else {
                    history.replaceState(state, '', url.toString());
                }
            } catch {}
        },

        // ─────────────────────────────────────────────
        // INITIALIZATION
        // ─────────────────────────────────────────────

        init() {
            this.loadPreferences();

            // Handle browser Back / Forward navigation
            window.addEventListener('popstate', (e) => {
                if (e.state && e.state.view) {
                    this.currentView = e.state.view;
                    if (e.state.book && e.state.chapter) {
                        this.selectedBook = e.state.book;
                        this.selectedChapter = e.state.chapter;
                        this.fetchVerses();
                    }
                } else if (this.currentView === 'reader') {
                    this.currentView = 'home';
                }
            });

            // Parse URL Parameters (support both book ID & Name, e.g. "John" or "JHN")
            let hasParams = false;
            const params = new URLSearchParams(window.location.search);

            if (params.has('book')) {
                const matched = this._findBook(params.get('book'));
                if (matched) {
                    this.selectedBook = matched.id;
                    hasParams = true;
                }
            }

            if (params.has('chapter')) {
                const c = parseInt(params.get('chapter'), 10);
                const currentB = this.currentBook;
                if (!isNaN(c) && c > 0) {
                    this.selectedChapter = currentB ? Math.min(c, currentB.chapters) : c;
                    hasParams = true;
                }
            }

            if (params.has('translation')) {
                const t = params.get('translation').toLowerCase();
                if (this.translations.find(trans => trans.id === t)) {
                    this.translation = t;
                    hasParams = true;
                }
            }

            if (params.has('verse')) {
                const v = parseInt(params.get('verse'), 10);
                if (!isNaN(v) && v > 0) {
                    this.targetVerse = v;
                    hasParams = true;
                }
            }

            // Select verse of the day based on day of year
            const now = new Date();
            const start = new Date(now.getFullYear(), 0, 0);
            const diff = now - start;
            const oneDay = 1000 * 60 * 60 * 24;
            const dayOfYear = Math.floor(diff / oneDay);
            this.verseOfTheDay = this.dailyVerses[dayOfYear % this.dailyVerses.length];

            this.loadHighlights();
            this.applyTheme();

            // Preload cached passage for instantaneous display
            const cached = this._readCache();
            if (cached && Array.isArray(cached) && cached.length > 0) {
                this.verses = cached;
            }

            if (hasParams) {
                this.currentView = 'reader';
                this.fetchVerses();
            }
        },

        // ─────────────────────────────────────────────
        // PREFERENCES
        // ─────────────────────────────────────────────

        loadPreferences() {
            try {
                this.selectedBook = localStorage.getItem('avuyile_bible_book') || 'JHN';
                this.selectedChapter = parseInt(localStorage.getItem('avuyile_bible_chapter') || '3', 10);
                this.translation = localStorage.getItem('avuyile_bible_translation') || 'web';
                this.theme = localStorage.getItem('avuyile_bible_theme') || 'light';

                // Guard against corrupted or invalid values
                if (!this.bibleBooks.find(b => b.id === this.selectedBook)) this.selectedBook = 'JHN';
                if (!this.translations.find(t => t.id === this.translation)) this.translation = 'web';
                if (!this.themes.includes(this.theme)) this.theme = 'light';
                const currentB = this.bibleBooks.find(b => b.id === this.selectedBook);
                const maxChapters = currentB ? currentB.chapters : 50;
                if (isNaN(this.selectedChapter) || this.selectedChapter < 1) this.selectedChapter = 1;
                if (this.selectedChapter > maxChapters) this.selectedChapter = maxChapters;
            } catch {
                // localStorage unavailable (private browsing, etc.) — defaults used silently
            }
        },

        savePreferences() {
            try {
                localStorage.setItem('avuyile_bible_book', this.selectedBook);
                localStorage.setItem('avuyile_bible_chapter', String(this.selectedChapter));
                localStorage.setItem('avuyile_bible_translation', this.translation);
                localStorage.setItem('avuyile_bible_theme', this.theme);
            } catch {
                // Ignore storage quota errors
            }
        },

        saveHighlights() {
            try {
                localStorage.setItem('avuyile_bible_highlights', JSON.stringify(this.highlights));
            } catch (e) {
                console.warn('Could not save highlights to localStorage:', e);
                this.showToast('Could not save highlight (storage full?)', 4000);
            }
        },

        loadHighlights() {
            try {
                const storedHighlights = localStorage.getItem('avuyile_bible_highlights');
                this.highlights = storedHighlights ? JSON.parse(storedHighlights) : {};
            } catch (e) {
                console.warn('Could not load highlights from localStorage, resetting:', e);
                this.highlights = {};
            }
        },

        // ─────────────────────────────────────────────
        // THEME MANAGEMENT
        // ─────────────────────────────────────────────

        cycleTheme() {
            const idx = this.themes.indexOf(this.theme);
            this.theme = this.themes[(idx + 1) % this.themes.length];
            this.applyTheme();
            this.savePreferences();
        },

        applyTheme() {
            const html = document.documentElement;
            html.classList.remove('dark', 'sepia');
            if (this.theme === 'dark') html.classList.add('dark');
            if (this.theme === 'sepia') html.classList.add('sepia');
        },

        // ─────────────────────────────────────────────
        // TEXT SANITIZATION
        // ─────────────────────────────────────────────

        /**
         * Cleans verse text: strips Strong's tags & numbers cleanly,
         * decodes standard HTML entities, strips remaining tags,
         * removes duplicate verse prefixes, and normalises whitespace.
         */
        _cleanVerseText(str) {
            if (!str) return '';

            let cleanText = String(str);

            // 1. Remove Strong's concordance tags and their inner numbers (<S>1161</S>)
            cleanText = cleanText.replace(/<[sS][^>]*>[\s\S]*?<\/[sS]>/gi, '');

            // 2. Decode standard HTML entities
            cleanText = cleanText
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'")
                .replace(/&apos;/g, "'")
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&nbsp;/g, ' ');

            // 3. Strip any remaining HTML tags
            cleanText = cleanText.replace(/<[^>]*>/g, '');

            // 4. Remove leading verse numbers (e.g., "1 And" or "1: And")
            cleanText = cleanText.replace(/^\s*\d+[\s:.-]*/, '');

            // 5. Remove residual bracketed references or Strong's numbers
            cleanText = cleanText.replace(/\[\d+\]/g, '');
            cleanText = cleanText.replace(/\(\d+\)/g, '');
            cleanText = cleanText.replace(/([a-zA-Z])\d+/g, '$1');
            cleanText = cleanText.replace(/\b\d{4,5}\b/g, '');

            // 6. Normalise whitespace
            return cleanText.replace(/\s+/g, ' ').trim();
        },

        // ─────────────────────────────────────────────
        // CACHE HELPERS
        // ─────────────────────────────────────────────

        _cacheKey() {
            return `avuyile_bible_${this.translation}_${this.selectedBook}_${this.selectedChapter}`;
        },

        _readCache() {
            try {
                const raw = localStorage.getItem(this._cacheKey());
                if (!raw) return null;
                const parsed = JSON.parse(raw);
                return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
            } catch {
                return null;
            }
        },

        _writeCache(verses) {
            try {
                localStorage.setItem(this._cacheKey(), JSON.stringify(verses));
            } catch {
                // Storage quota exceeded or unavailable — not critical
            }
        },

        // ─────────────────────────────────────────────
        // VERSE FETCHING & COMPLETION
        // ─────────────────────────────────────────────

        _finalizeFetch(verses) {
            this.verses = verses;
            this._writeCache(this.verses);
            this.loading = false;
            this.error = false;
            this.errorMessage = '';

            // Handle target verse scrolling (deep links & Verse of the Day)
            if (this.targetVerse) {
                const vNum = this.targetVerse;
                const attemptScroll = (retryCount = 0) => {
                    const el = document.getElementById('verse-' + vNum);
                    if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        const targetV = this.verses.find(v => v.verse == vNum);
                        if (targetV) this.activeVerse = targetV;
                        this.targetVerse = null;
                    } else if (retryCount < 5) {
                        setTimeout(() => attemptScroll(retryCount + 1), 70);
                    } else {
                        this.targetVerse = null;
                    }
                };

                if (typeof this.$nextTick === 'function') {
                    this.$nextTick(() => attemptScroll(0));
                } else {
                    setTimeout(() => attemptScroll(0), 50);
                }
            }
        },

        goHome() {
            this.currentView = 'home';
            this.activeVerse = null;
            window.scrollTo({ top: 0, behavior: 'smooth' });
            this._updateUrl(false);
        },

        openReader() {
            this.currentView = 'reader';
            this._updateUrl(false);
            if (this.verses.length === 0 || this.error) {
                this.fetchVerses();
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        },

        openVerseOfTheDay() {
            if (!this.verseOfTheDay) return;
            this.selectedBook = this.verseOfTheDay.book;
            this.selectedChapter = this.verseOfTheDay.chapter;
            this.targetVerse = this.verseOfTheDay.verse;
            this.currentView = 'reader';
            this._updateUrl(false);
            this.fetchVerses();
        },

        openTranslations() {
            this.showTranslationMenu = true;
        },

        closeTranslations() {
            this.showTranslationMenu = false;
        },

        setTranslation(id) {
            if (id === this.translation) {
                this.closeTranslations();
                return;
            }
            this.translation = id;
            this.closeTranslations();
            this._updateUrl();
            this.fetchVerses();
        },

        async fetchVerses() {
            // Cancel previous in-flight fetch to eliminate race conditions
            if (this.activeAbortController) {
                try { this.activeAbortController.abort(); } catch {}
            }
            this.activeAbortController = new AbortController();
            const currentFetchId = ++this.activeFetchId;

            this.loading = true;
            this.error = false;
            this.errorMessage = '';
            this.activeVerse = null;

            if (!this.targetVerse) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }

            this.savePreferences();

            // Fast display from cache while network resolves
            const cached = this._readCache();
            if (cached && !this.targetVerse) {
                this.verses = cached;
                this.loading = false;
            }

            const bookName = this.currentBookName;
            const chapter = this.selectedChapter;
            const bookIndex = this.bibleBooks.findIndex(b => b.id === this.selectedBook) + 1; // 1-based

            const isStale = () => currentFetchId !== this.activeFetchId;

            // ── Tier 1: bible-api.com ────────────────
            try {
                const url = `https://bible-api.com/${encodeURIComponent(bookName)}+${chapter}?translation=${this.translation}`;
                const fetchPromise = fetch(url, { signal: this.activeAbortController.signal });
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Tier-1 network timeout')), 5000)
                );

                const response = await Promise.race([fetchPromise, timeoutPromise]);
                const data = await response.json();

                if (isStale()) return;

                if (!response.ok || data.error) throw new Error(data.error || 'Primary API error');

                const rawVerses = data.verses || [];
                if (rawVerses.length === 0) throw new Error('Empty response from primary API');

                const formattedVerses = rawVerses.map(v => ({
                    verse: v.verse,
                    text: this._cleanVerseText(v.text)
                }));

                this._finalizeFetch(formattedVerses);
                return;

            } catch (err1) {
                if (isStale()) return;
                if (err1.name !== 'AbortError') {
                    console.warn('[Bible] Tier-1 (bible-api.com) failed:', err1.message);
                }
            }

            // ── Tier 2: bolls.life ───────────────────
            try {
                const bollsTranslation = this.bollsTranslationMap[this.translation] || this.translation.toUpperCase();
                const url = `https://bolls.life/get-chapter/${bollsTranslation}/${bookIndex}/${chapter}/`;
                const fetchPromise = fetch(url, { signal: this.activeAbortController.signal });
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Tier-2 network timeout')), 5000)
                );

                const response = await Promise.race([fetchPromise, timeoutPromise]);
                if (isStale()) return;
                if (!response.ok) throw new Error(`Bolls API HTTP ${response.status}`);

                const data = await response.json();
                if (isStale()) return;

                if (!Array.isArray(data) || data.length === 0) throw new Error('Empty response from Bolls API');

                const formattedVerses = data.map(v => ({
                    verse: v.verse,
                    text: this._cleanVerseText(v.text)
                }));

                if (this.translation === 'bbe' && bollsTranslation === 'WEB') {
                    this.showToast('BBE unavailable; loaded WEB translation.');
                }

                this._finalizeFetch(formattedVerses);
                return;

            } catch (err2) {
                if (isStale()) return;
                if (err2.name !== 'AbortError') {
                    console.warn('[Bible] Tier-2 (bolls.life) failed:', err2.message);
                }
            }

            // ── Tier 3: Offline device cache fallback ─────────
            const fallbackCached = this._readCache();
            if (fallbackCached) {
                this._finalizeFetch(fallbackCached);
                this.showToast('Offline mode — loaded from device cache.');
                return;
            }

            if (isStale()) return;

            // ── Ultimate failure ──────────────────────
            this.error = true;
            this.verses = [];

            const translationHints = {
                bbe: 'KJV or WEB',
                web: 'KJV or BBE',
                kjv: 'WEB or BBE'
            };

            const suggestion = translationHints[this.translation];
            this.errorMessage = `Unable to load passage. Please check your internet connection and try again.${suggestion ? ` You could also try the ${suggestion} translation.` : ''}`;
            this.loading = false;
        },

        // ─────────────────────────────────────────────
        // NAVIGATION & CHAPTER SWITCHING
        // ─────────────────────────────────────────────

        openNavigator() {
            this.navBookId = this.selectedBook;
            this.navStep = 'books';
            this.searchQuery = '';
            this.showNavigator = true;
        },

        closeNavigator() {
            this.showNavigator = false;
            this.searchQuery = '';
        },

        selectNavBook(book) {
            this.navBookId = book.id;
            this.navStep = 'chapters';
            this.$nextTick?.(() => {
                const el = document.querySelector('.nav-scroll-container');
                if (el) el.scrollTop = 0;
            });
        },

        backToBooks() {
            this.navStep = 'books';
        },

        executeNavigation(chapter) {
            this.selectedBook = this.navBookId;
            this.selectedChapter = chapter;
            this.targetVerse = null;
            this.currentView = 'reader'; // Ensure view switches to reader from Home
            this.closeNavigator();
            this._updateUrl(false);
            this.fetchVerses();
        },

        prevChapter() {
            if (this.loading || this.isFirstChapter) return;

            const idx = this.bibleBooks.findIndex(b => b.id === this.selectedBook);
            if (idx < 0) return;

            this.targetVerse = null;
            if (this.selectedChapter > 1) {
                this.selectedChapter--;
            } else if (idx > 0) {
                const prev = this.bibleBooks[idx - 1];
                this.selectedBook = prev.id;
                this.selectedChapter = prev.chapters;
            }

            this._updateUrl();
            this.fetchVerses();
        },

        nextChapter() {
            if (this.loading || this.isLastChapter) return;

            const idx = this.bibleBooks.findIndex(b => b.id === this.selectedBook);
            if (idx < 0) return;
            const book = this.bibleBooks[idx];

            this.targetVerse = null;
            if (this.selectedChapter < book.chapters) {
                this.selectedChapter++;
            } else if (idx < this.bibleBooks.length - 1) {
                this.selectedBook = this.bibleBooks[idx + 1].id;
                this.selectedChapter = 1;
            }

            this._updateUrl();
            this.fetchVerses();
        },

        // ─────────────────────────────────────────────
        // VERSE INTERACTION
        // ─────────────────────────────────────────────

        selectVerse(verse) {
            this.activeVerse = (this.activeVerse?.verse === verse.verse) ? null : verse;
        },

        _getShareUrl() {
            const baseUrl = window.location.origin + window.location.pathname;
            const vNum = this.activeVerse ? this.activeVerse.verse : '';
            return `${baseUrl}?book=${this.selectedBook}&chapter=${this.selectedChapter}&verse=${vNum}&translation=${this.translation}`;
        },

        clearActiveVerse() {
            this.activeVerse = null;
        },

        getFormattedVerse(verse) {
            if (!verse) return '';
            const ref = `${this.currentBookName} ${this.selectedChapter}:${verse.verse}`;
            return `"${verse.text.trim()}" — ${ref} (${this.translation.toUpperCase()})`;
        },

        getFormattedActiveVerse() {
            return this.getFormattedVerse(this.activeVerse);
        },

        async copyActiveVerse() {
            if (!this.activeVerse) return;
            const text = this.getFormattedActiveVerse();
            const shareUrl = this._getShareUrl();

            try {
                await navigator.clipboard.writeText(`${text}\n\nRead here: ${shareUrl}`);
                this.clearActiveVerse();
                this.showToast('Verse and link copied to clipboard ✓');
            } catch {
                prompt('Copy this verse:', `${text}\n\nRead here: ${shareUrl}`);
            }
        },

        shareActiveVerse() {
            if (!this.activeVerse) return;
            const text = this.getFormattedActiveVerse();
            const shareUrl = this._getShareUrl();

            if (navigator.share) {
                navigator.share({
                    title: `Bible Verse: ${this.currentBookName} ${this.selectedChapter}:${this.activeVerse.verse}`,
                    text: text,
                    url: shareUrl
                })
                    .then(() => this.clearActiveVerse())
                    .catch(err => {
                        if (err.name !== 'AbortError') this.copyActiveVerse();
                    });
            } else {
                this.copyActiveVerse();
            }
        },

        toggleHighlight(verse) {
            if (!verse) return;
            const key = `${this.selectedBook}-${this.selectedChapter}-${verse.verse}`;

            if (this.highlights[key]) {
                const newHighlights = { ...this.highlights };
                delete newHighlights[key];
                this.highlights = newHighlights;
                this.showToast('Verse unhighlighted.');
            } else {
                this.highlights = { ...this.highlights, [key]: true };
                this.showToast('Verse highlighted ✓');
            }
            this.saveHighlights();
            this.clearActiveVerse();
        },

        // ─────────────────────────────────────────────
        // TOAST NOTIFICATIONS
        // ─────────────────────────────────────────────

        showToast(message, durationMs = 3000) {
            this.toast.message = message;
            this.toast.show = true;
            if (this.toast.timeout) clearTimeout(this.toast.timeout);
            this.toast.timeout = setTimeout(() => {
                this.toast.show = false;
                this.toast.message = '';
                this.toast.timeout = null;
            }, durationMs);
        }

    };
}