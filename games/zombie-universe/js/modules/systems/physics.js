import { state } from '../state.js';
import { CONFIG } from '../config.js';

export function checkPlayerObstacleCollisions(pos) {
    const radius = 0.6;
    for (const obs of state.obstacles) {
        const box = new THREE.Box3().setFromObject(obs);
        const closestX = Math.max(box.min.x, Math.min(pos.x, box.max.x));
        const closestZ = Math.max(box.min.z, Math.min(pos.z, box.max.z));
        const dx = pos.x - closestX, dz = pos.z - closestZ;
        if ((dx * dx + dz * dz) < (radius * radius)) return false;
    }
    return true;
}
