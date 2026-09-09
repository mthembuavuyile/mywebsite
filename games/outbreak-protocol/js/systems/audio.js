import { state } from '../state.js';

const SOUND_FILES = {
    shoot: 'assets/sounds/shoot.mp3',
    hit: 'assets/sounds/hit.mp3',
    powerup: 'assets/sounds/powerup.mp3',
    explode: 'assets/sounds/explode.mp3'
};

export function initAudio() {
    try {
        if (!state.audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            state.audioCtx = new AudioContext();
        }

        if (state.audioCtx.state === 'suspended') {
            state.audioCtx.resume();
        }

        // Preload sound files into buffers
        preloadAudioBuffers();
    } catch (e) {
        console.warn('AudioContext initialization error:', e);
    }
}

async function preloadAudioBuffers() {
    if (!state.audioCtx) return;

    for (const [key, path] of Object.entries(SOUND_FILES)) {
        if (state.audioBuffers[key]) continue;
        try {
            const resp = await fetch(path);
            if (resp.ok) {
                const arrayBuffer = await resp.arrayBuffer();
                state.audioCtx.decodeAudioData(arrayBuffer, (decoded) => {
                    state.audioBuffers[key] = decoded;
                }, (err) => {
                    console.warn(`Could not decode ${path}:`, err);
                });
            }
        } catch (e) {
            // Will gracefully use procedural audio fallback
        }
    }
}

export function playSound(type) {
    if (!state.audioCtx) return;
    if (state.audioCtx.state === 'suspended') {
        state.audioCtx.resume();
    }

    // Try buffer playback first for mapped audio files
    const bufferKey = (type === 'pistol' || type === 'rifle' || type === 'shotgun') ? 'shoot' : (type === 'explosion' ? 'explode' : (type === 'health' || type === 'ammo' ? 'powerup' : type));

    if (state.audioBuffers[bufferKey]) {
        try {
            const source = state.audioCtx.createBufferSource();
            source.buffer = state.audioBuffers[bufferKey];

            const gain = state.audioCtx.createGain();
            let volume = 0.45;
            if (type === 'shotgun') {
                source.playbackRate.value = 0.8;
                volume = 0.6;
            } else if (type === 'rifle') {
                source.playbackRate.value = 1.25;
                volume = 0.35;
            } else if (type === 'pistol') {
                source.playbackRate.value = 1.0;
                volume = 0.4;
            } else if (type === 'hit') {
                volume = 0.3;
            }

            gain.gain.setValueAtTime(volume, state.audioCtx.currentTime);
            source.connect(gain);
            gain.connect(state.audioCtx.destination);
            source.start(0);
            return;
        } catch (e) {
            // fallback to procedural oscillator
        }
    }

    // Procedural Web Audio synthesis fallback
    playProceduralSound(type);
}

function playProceduralSound(type) {
    if (!state.audioCtx) return;
    const now = state.audioCtx.currentTime;
    const osc = state.audioCtx.createOscillator();
    const gain = state.audioCtx.createGain();

    osc.connect(gain);
    gain.connect(state.audioCtx.destination);

    switch (type) {
        case 'shoot':
        case 'pistol':
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(420, now);
            osc.frequency.exponentialRampToValueAtTime(70, now + 0.12);
            gain.gain.setValueAtTime(0.35, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
            osc.start(now);
            osc.stop(now + 0.12);
            break;

        case 'rifle':
            osc.type = 'square';
            osc.frequency.setValueAtTime(520, now);
            osc.frequency.exponentialRampToValueAtTime(90, now + 0.09);
            gain.gain.setValueAtTime(0.28, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);
            osc.start(now);
            osc.stop(now + 0.09);
            break;

        case 'shotgun':
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(260, now);
            osc.frequency.exponentialRampToValueAtTime(35, now + 0.28);
            gain.gain.setValueAtTime(0.55, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
            osc.start(now);
            osc.stop(now + 0.28);
            break;

        case 'plasma':
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, now);
            osc.frequency.exponentialRampToValueAtTime(140, now + 0.26);
            gain.gain.setValueAtTime(0.48, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.26);
            osc.start(now);
            osc.stop(now + 0.26);
            break;

        case 'hit':
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(320, now);
            osc.frequency.linearRampToValueAtTime(120, now + 0.08);
            gain.gain.setValueAtTime(0.28, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
            osc.start(now);
            osc.stop(now + 0.08);
            break;

        case 'reload':
            osc.type = 'sine';
            osc.frequency.setValueAtTime(280, now);
            osc.frequency.linearRampToValueAtTime(620, now + 0.14);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
            osc.start(now);
            osc.stop(now + 0.14);
            break;

        case 'explosion':
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(130, now);
            osc.frequency.exponentialRampToValueAtTime(22, now + 0.45);
            gain.gain.setValueAtTime(0.65, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
            osc.start(now);
            osc.stop(now + 0.45);
            break;

        case 'health':
        case 'powerup':
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.exponentialRampToValueAtTime(880, now + 0.22);
            gain.gain.setValueAtTime(0.35, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
            osc.start(now);
            osc.stop(now + 0.22);
            break;

        case 'hurt':
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(160, now);
            osc.frequency.exponentialRampToValueAtTime(60, now + 0.18);
            gain.gain.setValueAtTime(0.4, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
            osc.start(now);
            osc.stop(now + 0.18);
            break;

        case 'wave':
            osc.type = 'sine';
            osc.frequency.setValueAtTime(330, now);
            osc.frequency.linearRampToValueAtTime(660, now + 0.35);
            gain.gain.setValueAtTime(0.35, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
            osc.start(now);
            osc.stop(now + 0.4);
            break;
    }
}
