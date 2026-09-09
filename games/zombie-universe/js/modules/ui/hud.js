import { state } from '../state.js';
import { WEAPONS } from '../config.js';
import { switchWeapon } from '../entities/weapons.js';

export function updateHUD() {
    const hpVal = document.getElementById('healthVal');
    const hpBar = document.getElementById('healthBar');
    if(hpVal) hpVal.textContent = `${Math.round(state.health)} HP`;
    if(hpBar) hpBar.style.width = `${(state.health / state.maxHealth) * 100}%`;
    
    const scoreVal = document.getElementById('scoreVal');
    if(scoreVal) scoreVal.textContent = state.score;
    
    const waveVal = document.getElementById('waveVal');
    if(waveVal) waveVal.textContent = state.wave;

    if (state.weaponState && state.weaponState[state.currentWeaponIdx]) {
        const ammoVal = document.getElementById('ammoVal');
        const wState = state.weaponState[state.currentWeaponIdx];
        if(ammoVal) ammoVal.textContent = wState.isReloading ? 'RELOADING...' : `${wState.ammo} / ∞`;
    }
}

export function setupUI() {
    document.querySelectorAll('.weapon-btn').forEach((btn, idx) => {
        btn.addEventListener('click', () => switchWeapon(idx));
    });
}

export function showWaveBanner(text) {
    const banner = document.getElementById('waveBanner');
    if(banner) {
        banner.textContent = text;
        banner.style.opacity = '1';
        setTimeout(() => banner.style.opacity = '0', 2200);
    }
}

export function triggerHitMarker() {
    const marker = document.getElementById('hitMarker');
    if(marker) {
        marker.style.opacity = '1';
        marker.style.transform = 'translate(-50%, -50%) scale(1.2)';
        setTimeout(() => {
            marker.style.opacity = '0';
            marker.style.transform = 'translate(-50%, -50%) scale(1.0)';
        }, 150);
    }
}
