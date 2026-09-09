import { state } from '../state.js';
import { CONFIG } from '../config.js';

export function initMinimap() {
    const canvas = document.getElementById('minimapCanvas');
    if (canvas) {
        canvas.width = 150;
        canvas.height = 150;
        state.minimapCtx = canvas.getContext('2d');
    }
}

export function drawMinimap() {
    if (!state.minimapCtx || !state.player) return;

    const ctx = state.minimapCtx;
    const w = 150;
    const cx = w / 2;
    const cy = w / 2;
    const radius = 68;
    const scale = (w - 20) / CONFIG.groundSize;

    ctx.clearRect(0, 0, w, w);

    // Radar background grid
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.clip();

    ctx.fillStyle = 'rgba(5, 10, 22, 0.85)';
    ctx.fillRect(0, 0, w, w);

    // Range rings
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.4, 0, Math.PI * 2);
    ctx.arc(cx, cy, radius * 0.75, 0, Math.PI * 2);
    ctx.stroke();

    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(cx, cy - radius);
    ctx.lineTo(cx, cy + radius);
    ctx.moveTo(cx - radius, cy);
    ctx.lineTo(cx + radius, cy);
    ctx.stroke();

    // Sweeping beam
    const sweepAngle = (Date.now() * 0.0024) % (Math.PI * 2);
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(sweepAngle) * radius, cy + Math.sin(sweepAngle) * radius);
    ctx.stroke();

    // Power-up blips (green / cyan)
    state.powerUps.forEach(pu => {
        const px = cx + (pu.position.x - state.player.position.x) * scale;
        const py = cy + (pu.position.z - state.player.position.z) * scale;
        const dist = Math.hypot(px - cx, py - cy);
        if (dist < radius - 4) {
            ctx.fillStyle = pu.userData.type === 'health' ? '#22c55e' : '#06b6d4';
            ctx.beginPath();
            ctx.arc(px, py, 3.5, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    // Enemy blips
    state.enemies.forEach(e => {
        if (e.userData.isDying) return;
        const ex = cx + (e.position.x - state.player.position.x) * scale;
        const ey = cy + (e.position.z - state.player.position.z) * scale;
        const dist = Math.hypot(ex - cx, ey - cy);

        if (dist < radius - 3) {
            const defType = e.userData.def.type;
            ctx.fillStyle = defType === 'spitter'
                ? '#22c55e'
                : (defType === 'tank' ? '#c084fc' : (defType === 'runner' ? '#f97316' : '#ef4444'));

            ctx.beginPath();
            ctx.arc(ex, ey, defType === 'tank' ? 4.5 : 3.0, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    // Player icon with direction pointer
    const forward = new THREE.Vector3();
    state.player.getWorldDirection(forward);
    const facingAngle = Math.atan2(forward.z, forward.x);

    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx - forward.x * 9, cy - forward.z * 9);
    ctx.stroke();

    ctx.restore();
}
