/* ==========================================================================
   STORAGE — Centralized Persistence for High Scores, Stars & Unlocks
   Shared across 3D Flight Sim, 3D Stadium Explorer, and 2D Retro Arcade
   ========================================================================== */

(function () {
    const STORAGE_KEY = 'springbok_flyover_save_v2';

    const defaultState = {
        scores: {
            dhl: { stars: 0, bestScore: 0, closestPass: 99.9, cleared: false },
            moses: { stars: 0, bestScore: 0, closestPass: 99.9, cleared: false },
            ellis: { stars: 0, bestScore: 0, closestPass: 99.9, cleared: false },
            loftus: { stars: 0, bestScore: 0, closestPass: 99.9, cleared: false }
        },
        retroScores: {
            dhl: { stars: 0, bestScore: 0, bestClearance: 99.9, cleared: false },
            moses: { stars: 0, bestScore: 0, bestClearance: 99.9, cleared: false },
            ellis: { stars: 0, bestScore: 0, bestClearance: 99.9, cleared: false },
            loftus: { stars: 0, bestScore: 0, bestClearance: 99.9, cleared: false }
        },
        audioMuted: false,
        lastMode: '3d', // '3d' | '2d' | 'inspector'
        lastVenue: 'dhl'
    };

    function loadState() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return defaultState;
            const parsed = JSON.parse(raw);
            return {
                ...defaultState,
                ...parsed,
                scores: { ...defaultState.scores, ...(parsed.scores || {}) },
                retroScores: { ...defaultState.retroScores, ...(parsed.retroScores || {}) }
            };
        } catch (e) {
            console.warn('Could not read save data, using defaults:', e);
            return defaultState;
        }
    }

    function saveState(state) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
            console.warn('Could not write save data:', e);
        }
    }

    const StorageManager = {
        get() {
            return loadState();
        },

        saveRecord(mode, venueId, score, clearance, stars) {
            const state = loadState();
            const target = mode === '2d' ? state.retroScores : state.scores;
            const prev = target[venueId] || { stars: 0, bestScore: 0, closestPass: 99.9, cleared: false };

            const updated = {
                stars: Math.max(prev.stars || 0, stars || 0),
                bestScore: Math.max(prev.bestScore || 0, score || 0),
                closestPass: Math.min(prev.closestPass || 99.9, clearance > 0 ? clearance : 99.9),
                cleared: true
            };

            target[venueId] = updated;
            saveState(state);
            return updated;
        },

        setAudioMuted(muted) {
            const state = loadState();
            state.audioMuted = !!muted;
            saveState(state);
        },

        setLastMode(mode) {
            const state = loadState();
            state.lastMode = mode;
            saveState(state);
        },

        setLastVenue(venueId) {
            const state = loadState();
            state.lastVenue = venueId;
            saveState(state);
        }
    };

    window.FlyoverStorage = StorageManager;
})();
