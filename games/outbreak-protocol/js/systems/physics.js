import { state } from '../state.js';

export function checkPlayerObstacleCollisions(pos) {
    const radius = 0.65;
    const rSq = radius * radius;
    const boxes = state.obstacleBoxes;
    const len = boxes.length;

    for (let i = 0; i < len; i++) {
        const b = boxes[i];
        const closestX = Math.max(b.min.x, Math.min(pos.x, b.max.x));
        const closestZ = Math.max(b.min.z, Math.min(pos.z, b.max.z));
        const dx = pos.x - closestX;
        const dz = pos.z - closestZ;

        if (dx * dx + dz * dz < rSq) {
            return false;
        }
    }
    return true;
}

export function isPositionBlocked(pos, radius = 0.5) {
    const rSq = radius * radius;
    const boxes = state.obstacleBoxes;
    const len = boxes.length;

    for (let i = 0; i < len; i++) {
        const b = boxes[i];
        const closestX = Math.max(b.min.x, Math.min(pos.x, b.max.x));
        const closestZ = Math.max(b.min.z, Math.min(pos.z, b.max.z));
        const dx = pos.x - closestX;
        const dz = pos.z - closestZ;

        if (dx * dx + dz * dz < rSq) {
            return true;
        }
    }
    return false;
}
