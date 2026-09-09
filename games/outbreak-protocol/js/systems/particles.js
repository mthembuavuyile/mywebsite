import { state } from '../state.js';

const MAX_PARTICLES = 160;

export function createExplosionEffect(pos, colorHex, count = 20, speedMult = 1.0) {
    // If approaching particle cap, clean up oldest particles first
    while (state.particles.length + count > MAX_PARTICLES && state.particles.length > 0) {
        const oldest = state.particles.shift();
        if (oldest && state.scene) state.scene.remove(oldest);
    }

    const geom = new THREE.SphereGeometry(0.12, 6, 6);

    for (let i = 0; i < count; i++) {
        const pMat = new THREE.MeshBasicMaterial({
            color: colorHex,
            transparent: true,
            opacity: 0.95
        });
        const p = new THREE.Mesh(geom, pMat);
        p.position.copy(pos);

        const dir = new THREE.Vector3(
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.2) * 2,
            (Math.random() - 0.5) * 2
        ).normalize();

        const speed = (0.12 + Math.random() * 0.22) * speedMult;
        const life = 350 + Math.random() * 400;

        p.userData = {
            dir: dir,
            speed: speed,
            created: Date.now(),
            life: life
        };

        state.scene.add(p);
        state.particles.push(p);
    }
}

export function updateParticles(delta) {
    const now = Date.now();
    for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.position.addScaledVector(p.userData.dir, p.userData.speed);

        const elapsed = now - p.userData.created;
        const lifeRatio = 1 - (elapsed / p.userData.life);

        if (lifeRatio <= 0) {
            state.scene.remove(p);
            state.particles.splice(i, 1);
        } else {
            p.scale.setScalar(Math.max(0.01, lifeRatio));
            p.material.opacity = lifeRatio;
        }
    }
}
