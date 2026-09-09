import { state } from '../state.js';
import { WEAPONS } from '../config.js';
import { playSound } from '../systems/audio.js';
import { updateHUD } from '../ui/hud.js';

export function shoot() {
    if (!state.gameActive || state.isPaused) return;

    const w = WEAPONS[state.currentWeaponIdx];
    const wState = state.weaponState[state.currentWeaponIdx];
    const now = Date.now();

    if (wState.isReloading || now - state.lastShootTime < w.cooldown) return;

    if (wState.ammo <= 0) {
        reloadWeapon();
        return;
    }

    wState.ammo--;
    state.lastShootTime = now;
    state.shotsFired++;
    updateHUD();

    // Weapon-specific audio
    playSound(w.id);

    // Dynamic recoil impulse
    state.camera.rotation.x -= w.recoil;
    if (state.weaponHolder) {
        state.weaponHolder.position.z = -0.45;
        state.weaponHolder.rotation.x = 0.1;
        setTimeout(() => {
            if (state.weaponHolder) {
                state.weaponHolder.position.z = -0.55;
                state.weaponHolder.rotation.x = 0;
            }
        }, 70);
    }

    // Dynamic muzzle flash light
    const flash = new THREE.PointLight(w.color, 2.2, 7);
    flash.position.set(0.3, -0.2, -0.9);
    state.camera.add(flash);
    setTimeout(() => { state.camera.remove(flash); }, 45);

    // Bullet trajectory calculation
    const camWorldDir = new THREE.Vector3();
    state.camera.getWorldDirection(camWorldDir);
    const camWorldPos = new THREE.Vector3();
    state.camera.getWorldPosition(camWorldPos);

    for (let i = 0; i < w.pellets; i++) {
        const dir = camWorldDir.clone();
        dir.x += (Math.random() - 0.5) * w.spread;
        dir.y += (Math.random() - 0.5) * w.spread;
        dir.z += (Math.random() - 0.5) * w.spread;
        dir.normalize();

        const bulletGeo = w.isPlasma
            ? new THREE.SphereGeometry(0.28, 12, 12)
            : new THREE.SphereGeometry(0.08, 8, 8);

        const bulletMat = new THREE.MeshBasicMaterial({ color: w.color });
        const bullet = new THREE.Mesh(bulletGeo, bulletMat);

        bullet.position.copy(camWorldPos).addScaledVector(dir, 0.7);
        bullet.userData = {
            dir: dir,
            speed: w.speed,
            damage: w.damage,
            created: now,
            isPlasma: w.isPlasma || false,
            splashRadius: w.splashRadius || 0
        };

        state.scene.add(bullet);
        state.bullets.push(bullet);
    }
}

export function reloadWeapon() {
    const wState = state.weaponState[state.currentWeaponIdx];
    const w = WEAPONS[state.currentWeaponIdx];
    if (wState.isReloading || wState.ammo === w.magSize) return;

    wState.isReloading = true;
    playSound('reload');

    const ammoEl = document.getElementById('ammoVal');
    if (ammoEl) ammoEl.textContent = 'RELOADING...';

    setTimeout(() => {
        wState.ammo = w.magSize;
        wState.isReloading = false;
        updateHUD();
    }, w.reloadTime);
}

export function switchWeapon(idx) {
    if (idx < 0 || idx >= WEAPONS.length) return;
    state.currentWeaponIdx = idx;
    updateWeaponVisual();
    updateHUD();

    document.querySelectorAll('.weapon-btn').forEach((btn, i) => {
        btn.classList.toggle('active', i === idx);
    });
}

export function updateWeaponVisual() {
    if (!state.weaponHolder) return;

    // Preserve laser sight while clearing previous gun mesh
    for (let i = state.weaponHolder.children.length - 1; i >= 0; i--) {
        if (state.weaponHolder.children[i] !== state.laserSight) {
            state.weaponHolder.remove(state.weaponHolder.children[i]);
        }
    }

    const w = WEAPONS[state.currentWeaponIdx];
    const gunGroup = new THREE.Group();
    const matMetal = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.85, roughness: 0.25 });
    const matAccent = new THREE.MeshStandardMaterial({ color: w.color, emissive: w.color, emissiveIntensity: 0.35 });

    if (state.currentWeaponIdx === 0) {
        // Tactical Pistol
        const slide = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.11, 0.32), matMetal);
        const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.24, 12), matMetal);
        barrel.rotation.x = Math.PI / 2;
        barrel.position.set(0, 0.025, -0.2);
        gunGroup.add(slide, barrel);
    } else if (state.currentWeaponIdx === 1) {
        // AR-7 Rifle
        const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.13, 0.58), matMetal);
        const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.46, 12), matMetal);
        barrel.rotation.x = Math.PI / 2;
        barrel.position.set(0, 0.03, -0.4);
        const mag = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.24, 0.1), matAccent);
        mag.position.set(0, -0.12, -0.06);
        gunGroup.add(receiver, barrel, mag);
    } else if (state.currentWeaponIdx === 2) {
        // Combat Shotgun
        const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.15, 0.68), matMetal);
        const barrel1 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.52, 12), matMetal);
        barrel1.rotation.x = Math.PI / 2;
        barrel1.position.set(-0.03, 0.03, -0.42);
        const barrel2 = barrel1.clone();
        barrel2.position.x = 0.03;
        gunGroup.add(receiver, barrel1, barrel2);
    } else {
        // Plasma Disruptor
        const chassis = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.18, 0.52), matMetal);
        const core = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), matAccent);
        core.position.set(0, 0, -0.14);
        const emitter = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.32, 16), matAccent);
        emitter.rotation.x = Math.PI / 2;
        emitter.position.set(0, 0, -0.36);
        gunGroup.add(chassis, core, emitter);
    }

    state.weaponHolder.add(gunGroup);
    if (state.laserSight) {
        state.laserSight.material.color.setHex(w.color);
    }
}
