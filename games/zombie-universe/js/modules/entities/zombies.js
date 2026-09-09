import { state, setGameState } from '../state.js';
import { CONFIG, ENEMY_TYPES } from '../config.js';
import { playSound } from '../systems/audio.js';
import { updateHUD, triggerHitMarker, showWaveBanner } from '../ui/hud.js';
import { takeDamage } from './player.js';

export function loadZombieModelGLTF() {
    if (typeof THREE.GLTFLoader === 'undefined') return;
    const loader = new THREE.GLTFLoader();
    loader.load('assets/models/zombie_walk_animated.glb', (gltf) => {
        state.zombieGltfModel = gltf;
    }, undefined, (err) => {
        console.warn('zombie_walk_animated.glb not found, using procedural fallback zombies');
    });
}

function createZombieMesh(typeIdx) {
    const def = ENEMY_TYPES[typeIdx];
    let zombie;

    if (state.zombieGltfModel && typeof THREE.SkeletonUtils !== 'undefined') {
        zombie = THREE.SkeletonUtils.clone(state.zombieGltfModel.scene);
        const mixer = new THREE.AnimationMixer(zombie);
        if (state.zombieGltfModel.animations && state.zombieGltfModel.animations.length > 0) {
            mixer.clipAction(state.zombieGltfModel.animations[0]).play();
        }
        zombie.scale.setScalar(0.02 * def.size);

        zombie.traverse(node => {
            if (node.isMesh && node.material) {
                node.material = node.material.clone();
                node.material.color.setHex(def.color);
                node.castShadow = true; node.receiveShadow = true;
            }
        });
        zombie.userData.mixer = mixer;
    } else {
        zombie = new THREE.Group();
        const matBody = new THREE.MeshStandardMaterial({ color: def.color, roughness: 0.8, metalness: 0.2 });
        const matEye = new THREE.MeshBasicMaterial({ color: def.type === 'spitter' ? 0x00ff44 : 0xff0000 });

        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.35, 1.3, 10), matBody);
        torso.position.y = 1.05; torso.castShadow = true;
        zombie.add(torso);

        const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), matBody);
        head.position.y = 1.9; head.castShadow = true;
        zombie.add(head);

        const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), matEye);
        eyeL.position.set(-0.12, 1.95, -0.25);
        const eyeR = eyeL.clone(); eyeR.position.x = 0.12;
        zombie.add(eyeL, eyeR);

        const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.8, 8), matBody);
        armL.name = 'armL'; armL.position.set(-0.5, 1.35, -0.3); armL.rotation.x = -Math.PI / 2.2; armL.castShadow = true;
        const armR = armL.clone(); armR.name = 'armR'; armR.position.x = 0.5;
        zombie.add(armL, armR);

        zombie.scale.setScalar(def.size);
    }

    zombie.userData = Object.assign(zombie.userData || {}, {
        typeIdx: typeIdx,
        def: def,
        health: def.health,
        maxHealth: def.health,
        speed: def.speed,
        damage: def.damage,
        lastAttack: 0,
        isDying: false,
        walkTime: Math.random() * Math.PI * 2
    });

    return zombie;
}

export function spawnWaveEnemies() {
    const count = Math.min(6 + state.wave * 3, 40);
    const safeRadius = 22;

    for (let i = 0; i < count; i++) {
        let typeIdx = 0;
        const r = Math.random();
        if (state.wave >= 2 && r < 0.3) typeIdx = 1;
        if (state.wave >= 3 && r > 0.7) typeIdx = 3;
        if (state.wave >= 4 && r > 0.85) typeIdx = 2;

        const enemy = createZombieMesh(typeIdx);

        let x, z, valid = false, attempts = 0;
        while (!valid && attempts < 80) {
            x = (Math.random() - 0.5) * (CONFIG.groundSize - 25);
            z = (Math.random() - 0.5) * (CONFIG.groundSize - 25);
            if (Math.sqrt(x * x + z * z) > safeRadius) valid = true;
            attempts++;
        }

        enemy.position.set(x, 0, z);
        state.scene.add(enemy);
        state.enemies.push(enemy);
    }

    updateHUD();
}

function spawnPowerUp(pos) {
    const pGroup = new THREE.Group();
    const type = Math.random() < 0.6 ? 'health' : 'ammo';
    const color = type === 'health' ? 0x00ff44 : 0x00f0ff;

    const box = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.6, 0.6),
        new THREE.MeshStandardMaterial({ color: color, emissive: color, emissiveIntensity: 0.5, transparent: true, opacity: 0.9 })
    );
    pGroup.add(box);

    const light = new THREE.PointLight(color, 1, 5);
    pGroup.add(light);

    pGroup.position.copy(pos); pGroup.position.y = 0.8;
    pGroup.userData = { type: type, created: Date.now() };

    state.scene.add(pGroup);
    state.powerUps.push(pGroup);
}

export function updateEnemies(delta) {
    const now = Date.now();

    state.enemies.forEach(e => {
        if (e.userData.isDying) return;

        if (e.userData.mixer) {
            e.userData.mixer.update(delta);
        } else {
            e.userData.walkTime += delta * 6.0;
            const armL = e.getObjectByName('armL');
            const armR = e.getObjectByName('armR');
            if (armL) armL.rotation.z = Math.sin(e.userData.walkTime) * 0.3;
            if (armR) armR.rotation.z = -Math.sin(e.userData.walkTime) * 0.3;
        }

        const distToPlayer = e.position.distanceTo(state.player.position);

        if (e.userData.def.isRanged && distToPlayer < 25 && distToPlayer > 6) {
            e.lookAt(state.player.position.x, 0, state.player.position.z);
            if (now - e.userData.lastAttack > e.userData.def.attackCd) {
                e.userData.lastAttack = now;

                const spitMat = new THREE.MeshBasicMaterial({ color: 0x00ff44 });
                const spit = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), spitMat);
                spit.position.copy(e.position).add(new THREE.Vector3(0, 1.6, 0));

                const dir = new THREE.Vector3().subVectors(state.player.position, e.position).normalize();
                spit.userData = { dir: dir, speed: 0.6, damage: e.userData.damage, created: now };

                state.scene.add(spit);
                state.spitProjectiles.push(spit);
            }
        } else if (distToPlayer > 1.4) {
            const dir = new THREE.Vector3().subVectors(state.player.position, e.position);
            dir.y = 0; dir.normalize();

            e.position.addScaledVector(dir, e.userData.speed * (delta * 60));
            e.lookAt(state.player.position.x, 0, state.player.position.z);
        } else {
            if (now - e.userData.lastAttack > e.userData.def.attackCd) {
                e.userData.lastAttack = now;
                takeDamage(e.userData.damage);
            }
        }
    });
}

export function updateSpitProjectiles(delta) {
    for (let i = state.spitProjectiles.length - 1; i >= 0; i--) {
        const s = state.spitProjectiles[i];
        s.position.addScaledVector(s.userData.dir, s.userData.speed);

        if (s.position.distanceTo(state.player.position.clone().add(new THREE.Vector3(0, 1, 0))) < 1.0) {
            takeDamage(s.userData.damage);
            createExplosionEffect(s.position, 0x00ff44, 15);
            state.scene.remove(s);
            state.spitProjectiles.splice(i, 1);
            continue;
        }

        if (Date.now() - s.userData.created > 3000) {
            state.scene.remove(s);
            state.spitProjectiles.splice(i, 1);
        }
    }
}

export function createExplosionEffect(pos, colorHex, count = 25) {
    for (let i = 0; i < count; i++) {
        const pMat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 1.0 });
        const p = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), pMat);
        p.position.copy(pos);

        const dir = new THREE.Vector3(
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.2) * 2,
            (Math.random() - 0.5) * 2
        ).normalize();

        p.userData = { dir: dir, speed: 0.1 + Math.random() * 0.25, created: Date.now(), life: 400 + Math.random() * 400 };

        state.scene.add(p);
        state.particles.push(p);
    }
}

export function updateBullets(delta) {
    const now = Date.now();

    for (let i = state.bullets.length - 1; i >= 0; i--) {
        const b = state.bullets[i];
        b.position.addScaledVector(b.userData.dir, b.userData.speed);

        let destroyed = false;

        for (let j = state.enemies.length - 1; j >= 0; j--) {
            const e = state.enemies[j];
            if (e.userData.isDying) continue;

            const center = e.position.clone().add(new THREE.Vector3(0, 1.1 * e.scale.y, 0));
            if (b.position.distanceTo(center) < (0.9 * e.scale.y)) {
                destroyed = true;
                e.userData.health -= b.userData.damage;
                playSound('hit');
                triggerHitMarker();

                e.traverse(child => {
                    if (child.isMesh && child.material) {
                        const origHex = child.material.color.getHex();
                        child.material.color.setHex(0xffffff);
                        setTimeout(() => { if (child.material) child.material.color.setHex(origHex); }, 80);
                    }
                });

                if (b.userData.isPlasma) {
                    createExplosionEffect(b.position, 0x00f0ff, 35);
                    playSound('explosion');
                    state.enemies.forEach(otherE => {
                        if (otherE !== e && !otherE.userData.isDying) {
                            if (b.position.distanceTo(otherE.position) < b.userData.splashRadius) {
                                otherE.userData.health -= b.userData.damage * 0.6;
                            }
                        }
                    });
                } else {
                    createExplosionEffect(b.position, 0xff2222, 6);
                }

                if (e.userData.health <= 0) {
                    e.userData.isDying = true;
                    state.score += e.userData.def.health;
                    updateHUD();

                    if (Math.random() < 0.22) spawnPowerUp(e.position.clone());

                    createExplosionEffect(e.position, e.userData.def.color, 25);
                    state.scene.remove(e);
                    state.enemies.splice(j, 1);

                    if (state.enemies.length === 0) {
                        nextWave();
                    }
                }
                break;
            }
        }

        if (destroyed || now - b.userData.created > 2500 || Math.abs(b.position.x) > CONFIG.groundSize / 2) {
            state.scene.remove(b);
            state.bullets.splice(i, 1);
        }
    }
}

export function nextWave() {
    state.wave++;
    showWaveBanner(`WAVE ${state.wave}`);
    setTimeout(() => spawnWaveEnemies(), 2000);
}
