import { state } from '../state.js';
import { WEAPONS, CONFIG } from '../config.js';
import { switchWeapon } from '../entities/weapons.js';

export function updateHUD() {
    // Health display
    const hpVal = document.getElementById('healthVal');
    const hpBar = document.getElementById('healthBar');
    if (hpVal) hpVal.textContent = `${Math.round(state.health)} HP`;
    if (hpBar) hpBar.style.width = `${Math.max(0, (state.health / state.maxHealth) * 100)}%`;

    // Stamina display
    const staminaBar = document.getElementById('staminaBar');
    if (staminaBar) staminaBar.style.width = `${Math.max(0, (state.stamina / CONFIG.maxStamina) * 100)}%`;

    // Score & Wave display
    const scoreVal = document.getElementById('scoreVal');
    if (scoreVal) scoreVal.textContent = state.score.toLocaleString();

    const waveVal = document.getElementById('waveVal');
    if (waveVal) waveVal.textContent = state.wave;

    const killsVal = document.getElementById('killsVal');
    if (killsVal) killsVal.textContent = state.kills;

    // Ammo display
    if (state.weaponState && state.weaponState[state.currentWeaponIdx]) {
        const ammoVal = document.getElementById('ammoVal');
        const wState = state.weaponState[state.currentWeaponIdx];
        const w = WEAPONS[state.currentWeaponIdx];
        if (ammoVal) {
            ammoVal.textContent = wState.isReloading ? 'RELOADING...' : `${wState.ammo} / ${w.magSize}`;
        }
    }
}

export function setupUI() {
    document.querySelectorAll('.weapon-btn').forEach((btn, idx) => {
        btn.addEventListener('click', () => switchWeapon(idx));
    });

    // Populate saved high score on start screen
    const savedHighScore = localStorage.getItem(CONFIG.storageScoreKey) || '0';
    const savedBestWave = localStorage.getItem(CONFIG.storageWaveKey) || '1';
    const startHighScoreEl = document.getElementById('startHighScore');
    if (startHighScoreEl) {
        startHighScoreEl.textContent = `Personal Best: ${parseInt(savedHighScore).toLocaleString()} pts (Wave ${savedBestWave})`;
    }
}

export function showWaveBanner(text) {
    const banner = document.getElementById('waveBanner');
    if (banner) {
        banner.textContent = text;
        banner.classList.add('visible');
        setTimeout(() => {
            if (banner) banner.classList.remove('visible');
        }, 2200);
    }
}

export function triggerHitMarker() {
    const marker = document.getElementById('hitMarker');
    if (marker) {
        marker.style.opacity = '1';
        marker.style.transform = 'translate(-50%, -50%) scale(1.25)';
        setTimeout(() => {
            if (marker) {
                marker.style.opacity = '0';
                marker.style.transform = 'translate(-50%, -50%) scale(1.0)';
            }
        }, 130);
    }
}
