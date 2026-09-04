/* ========================================
   Procedural Audio Manager
   All sounds generated via Web Audio API —
   no external audio files needed.
   ======================================== */

class AudioManager {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.engineOsc = null;
        this.engineGain = null;
        this.windSource = null;
        this.windGain = null;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.25;
            this.masterGain.connect(this.ctx.destination);
            this.initialized = true;
        } catch (e) {
            console.warn('Web Audio not available:', e);
        }
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // ── Engine Sound ──
    startEngine() {
        if (!this.initialized) return;
        // Main engine tone (low sawtooth)
        this.engineOsc = this.ctx.createOscillator();
        this.engineOsc.type = 'sawtooth';
        this.engineOsc.frequency.value = 80;

        // LFO for engine rumble
        const lfo = this.ctx.createOscillator();
        lfo.frequency.value = 6;
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.value = 15;
        lfo.connect(lfoGain);
        lfoGain.connect(this.engineOsc.frequency);
        lfo.start();
        this._engineLfo = lfo;

        // Low-pass filter for that muffled jet sound
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 600;
        filter.Q.value = 2;
        this._engineFilter = filter;

        this.engineGain = this.ctx.createGain();
        this.engineGain.gain.value = 0.15;

        this.engineOsc.connect(filter);
        filter.connect(this.engineGain);
        this.engineGain.connect(this.masterGain);
        this.engineOsc.start();
    }

    setEngineThrust(value) {
        if (!this.engineOsc) return;
        // value: 0 (idle) to 1 (full thrust)
        const freq = 80 + value * 120;
        const vol = 0.1 + value * 0.2;
        const filterFreq = 400 + value * 800;
        this.engineOsc.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.1);
        this.engineGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.05);
        if (this._engineFilter) {
            this._engineFilter.frequency.setTargetAtTime(filterFreq, this.ctx.currentTime, 0.1);
        }
    }

    stopEngine() {
        if (this.engineOsc) {
            this.engineOsc.stop();
            this.engineOsc = null;
        }
        if (this._engineLfo) {
            this._engineLfo.stop();
            this._engineLfo = null;
        }
    }

    // ── Wind Sound ──
    startWind(intensity = 0.5) {
        if (!this.initialized) return;
        const bufferSize = this.ctx.sampleRate * 2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1);
        }
        this.windSource = this.ctx.createBufferSource();
        this.windSource.buffer = buffer;
        this.windSource.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 300;
        filter.Q.value = 0.5;

        // LFO to modulate wind intensity
        const lfo = this.ctx.createOscillator();
        lfo.frequency.value = 0.3;
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.value = 100;
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        lfo.start();
        this._windLfo = lfo;

        this.windGain = this.ctx.createGain();
        this.windGain.gain.value = 0.05 * intensity;

        this.windSource.connect(filter);
        filter.connect(this.windGain);
        this.windGain.connect(this.masterGain);
        this.windSource.start();
    }

    setWindIntensity(value) {
        if (this.windGain) {
            this.windGain.gain.setTargetAtTime(0.03 + value * 0.08, this.ctx.currentTime, 0.2);
        }
    }

    stopWind() {
        if (this.windSource) {
            this.windSource.stop();
            this.windSource = null;
        }
        if (this._windLfo) {
            this._windLfo.stop();
            this._windLfo = null;
        }
    }

    // ── Crowd Roar ──
    crowdRoar(intensity = 1.0) {
        if (!this.initialized) return;
        const duration = 0.8;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            const t = i / this.ctx.sampleRate;
            const envelope = Math.sin(Math.PI * t / duration);
            data[i] = (Math.random() * 2 - 1) * envelope;
        }
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 800;
        filter.Q.value = 1;

        const gain = this.ctx.createGain();
        gain.gain.value = 0.12 * intensity;

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        source.start();
    }

    // ── Vuvuzela ──
    vuvuzela(duration = 1.5) {
        if (!this.initialized) return;
        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = 235; // Bb3 — the iconic vuvuzela note

        const osc2 = this.ctx.createOscillator();
        osc2.type = 'sawtooth';
        osc2.frequency.value = 237; // slight detune for buzz

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 500;
        filter.Q.value = 3;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.08, this.ctx.currentTime + duration - 0.2);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + duration);

        osc.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc2.start();
        osc.stop(this.ctx.currentTime + duration);
        osc2.stop(this.ctx.currentTime + duration);
    }

    // ── Terrain Warning Alarm ──
    terrainWarning() {
        if (!this.initialized) return;
        // Two-tone alarm beep
        const now = this.ctx.currentTime;
        for (let i = 0; i < 3; i++) {
            const osc = this.ctx.createOscillator();
            osc.type = 'square';
            osc.frequency.value = i % 2 === 0 ? 1200 : 900;

            const gain = this.ctx.createGain();
            gain.gain.value = 0.1;

            osc.connect(gain);
            gain.connect(this.masterGain);

            const start = now + i * 0.15;
            osc.start(start);
            osc.stop(start + 0.1);
        }
    }

    // ── Near Miss Whoosh ──
    nearMiss() {
        if (!this.initialized) return;
        const duration = 0.4;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            const t = i / this.ctx.sampleRate;
            const env = Math.exp(-t * 8);
            data[i] = (Math.random() * 2 - 1) * env;
        }
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 2000;

        const gain = this.ctx.createGain();
        gain.gain.value = 0.2;

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        source.start();
    }

    // ── Crash Sound ──
    crash() {
        if (!this.initialized) return;
        // Low boom
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.5);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.8);

        // Debris noise
        const duration = 1.0;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            const t = i / this.ctx.sampleRate;
            data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 4);
        }
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.value = 0.25;
        source.connect(noiseGain);
        noiseGain.connect(this.masterGain);
        source.start();
    }

    // ── UI Click ──
    uiClick() {
        if (!this.initialized) return;
        const osc = this.ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.value = 800;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
    }

    // ── Level Complete Fanfare ──
    fanfare() {
        if (!this.initialized) return;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            osc.type = 'triangle';
            osc.frequency.value = freq;
            const gain = this.ctx.createGain();
            const start = this.ctx.currentTime + i * 0.15;
            gain.gain.setValueAtTime(0.15, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(start);
            osc.stop(start + 0.4);
        });
    }

    // ── Stunt Gate Success Chime ──
    gateSuccess() {
        if (!this.initialized) return;
        const now = this.ctx.currentTime;
        const notes = [587.33, 880.00, 1174.66]; // D5, A5, D6 triumphant arpeggio
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = freq;
            const gain = this.ctx.createGain();
            const start = now + idx * 0.06;
            gain.gain.setValueAtTime(0.12, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(start);
            osc.stop(start + 0.35);
        });
    }

    // ── Airbrake / Dive Flaps Hiss ──
    airbrake() {
        if (!this.initialized) return;
        const duration = 0.25;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.5;
        }
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1400;
        filter.Q.value = 2;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        source.start();
    }

    // ── Turbo Boost Whoosh ──
    boostEngage() {
        if (!this.initialized) return;
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(660, this.ctx.currentTime + 0.3);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.35);
    }

    // ── Cleanup ──
    stopAll() {
        this.stopEngine();
        this.stopWind();
    }
}

window.AudioManager = AudioManager;
