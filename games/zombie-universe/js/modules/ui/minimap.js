import { state } from '../state.js';
import { CONFIG } from '../config.js';

export function initMinimap() {
    const canvas = document.getElementById('minimapCanvas');
    if(canvas) {
        canvas.width = 140; canvas.height = 140;
        state.minimapCtx = canvas.getContext('2d');
    }
}

export function drawMinimap() {
    if (!state.minimapCtx) return;

    state.minimapCtx.clearRect(0, 0, 140, 140);
    const cx = 70, cy = 70;
    const scale = 140 / CONFIG.groundSize;

    const angle = (Date.now() * 0.002) % (Math.PI * 2);
    state.minimapCtx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
    state.minimapCtx.lineWidth = 1;
    state.minimapCtx.beginPath();
    state.minimapCtx.moveTo(cx, cy);
    state.minimapCtx.lineTo(cx + Math.cos(angle) * 70, cy + Math.sin(angle) * 70);
    state.minimapCtx.stroke();

    state.enemies.forEach(e => {
        if (e.userData.isDying) return;
        const ex = cx + (e.position.x - state.player.position.x) * scale;
        const ey = cy + (e.position.z - state.player.position.z) * scale;

        state.minimapCtx.fillStyle = e.userData.def.type === 'spitter' ? '#00ff44' : (e.userData.def.type === 'tank' ? '#aa00ff' : '#ff3333');
        state.minimapCtx.beginPath();
        state.minimapCtx.arc(ex, ey, 3, 0, Math.PI * 2);
        state.minimapCtx.fill();
    });

    state.minimapCtx.fillStyle = '#00f0ff';
    state.minimapCtx.beginPath();
    state.minimapCtx.arc(cx, cy, 4, 0, Math.PI * 2);
    state.minimapCtx.fill();
}
