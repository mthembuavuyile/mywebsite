import { state } from '../state.js';
import { CONFIG, ENEMY_TYPES } from '../config.js';
import { playSound } from '../systems/audio.js';
import { createExplosionEffect } from '../systems/particles.js';
import { updateHUD, triggerHitMarker, showWaveBanner } from '../ui/hud.js';
import { takeDamage } from './player.js';

export function loadZombieModelGLTF() {
    if (typeof THREE.GLTFLoader === 'undefined') return;
    const loader = new THREE.GLTFLoader();
    loader.load('assets/models/zombie_walk_animated.glb', (gltf) => {
        state.zombieGltfModel = gltf;
    }, undefined, () => {
        console.info('Using procedural fallback mutant models.');
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
                node.castShadow = true;
                node.receiveShadow = true;
            }
        });
        zombie.userData.mixer = mixer;
    } else {
        zombie = new THREE.Group();
        const matBody = new THREE.MeshStandardMaterial({
            color: def.color,
            roughness: 0.8,
            metalness: 0.2
        });
        const matEye = new THREE.MeshBasicMaterial({
            color: def.type === 'spitter' ? 0x22c55e : (def.type === 'tank' ? 0xa855f7 : 0xef4444)
        });

        // Torso
        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.33, 1.25, 10), matBody);
        torso.position.y = 1.05;
        torso.castShadow = true;
        zombie.add(torso);

        // Head
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 14, 14), matBody);
        head.position.y = 1.88;
        head.castShadow = true;
        zombie.add(head);

        // Glowing eyes
        const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), matEye);
        eyeL.position.set(-0.11, 1.92, -0.26);
        const eyeR = eyeL.clone();
        eyeR.position.x = 0.11;
        zombie.add(eyeL, eyeR);

        // Outstretched aggressive arms
        const armGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.82, 8);
        const armL = new THREE.Mesh(armGeo, matBody);
        armL.name = 'armL';
        armL.position.set(-0.48, 1.35, -0.32);
        armL.rotation.x = -Math.PI / 2.1;
        armL.castShadow = true;

        const armR = armL.clone();
        armR.name = 'armR';
        armR.position.x = 0.48;
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
        deathStartTime: 0,
        walkTime: Math.random() * Math.PI * 2
    });

    return zombie;
}

export function spawnWaveEnemies() {
    const count = Math.min(6 + state.wave * 3, 42);
    const safeRadius = 22;

    for (let i = 0; i < count; i++) {
        let typeIdx = 0;
        const r = Math.random();
        if (state.wave >= 2 && r < 0.35) typeIdx = 1; // Runners
        if (state.wave >= 3 && r > 0.72) typeIdx = 3; // Spitters
        if (state.wave >= 4 && r > 0.86) typeIdx = 2; // Tanks

        const enemy = createZombieMesh(typeIdx);

        let x, z, valid = false, attempts = 0;
        while (!valid && attempts < 75) {
            x = (Math.random() - 0.5) * (CONFIG.groundSize - 30);
            z = (Math.random() - 0.5) * (CONFIG.groundSize - 30);
            if (Math.sqrt(x * x + z * z) > safeRadius) valid = true;
            attempts++;
        }

        enemy.position.set(x, 0, z);
        state.scene.add(enemy);
        state.enemies.push(enemy);
    }

    updateHUD();
}

export function spawnPowerUp(pos) {
    const pGroup = new THREE.Group();
    const type = Math.random() < 0.55 ? 'health' : 'ammo';
    const color = type === 'health' ? 0x22c55e : 0x06b6d4;

    const box = new THREE.Mesh(
        new THREE.BoxGeometry(0.65, 0.65, 0.65),
        new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.6,
            transparent: true,
            opacity: 0.92
        })
    );
    pGroup.add(box);

    const light = new THREE.PointLight(color, 1.2, 5);
    pGroup.add(light);

    pGroup.position.copy(pos);
    pGroup.position.y = 0.8;
    pGroup.userData = { type: type, created: Date.now() };

    state.scene.add(pGroup);
    state.powerUps.push(pGroup);
}

export function updateEnemies(delta) {
    const now = Date.now();

    for (let i = state.enemies.length - 1; i >= 0; i--) {
        const e = state.enemies[i];

        if (e.userData.isDying) {
            // Smooth death fade & scale down
            const fade = (now - e.userData.deathStartTime) / 450;
            if (fade >= 1) {
                state.scene.remove(e);
                state.enemies.splice(i, 1);
                if (state.enemies.length === 0) {
                    nextWave();
                }
            } else {
                e.scale.multiplyScalar(0.96);
                e.position.y -= 0.015;
            }
            continue;
        }

        if (e.userData.mixer) {
            e.userData.mixer.update(delta);
        } else {
            e.userData.walkTime += delta * 6.5;
            const armL = e.getObjectByName('armL');
            const armR = e.getObjectByName('armR');
            if (armL) armL.rotation.z = Math.sin(e.userData.walkTime) * 0.35;
            if (armR) armR.rotation.z = -Math.sin(e.userData.walkTime) * 0.35;
        }

        const distToPlayer = e.position.distanceTo(state.player.position);

        if (e.userData.def.isRanged && distToPlayer < 26 && distToPlayer > 7) {
            e.lookAt(state.player.position.x, 0, state.player.position.z);
            if (now - e.userData.lastAttack > e.userData.def.attackCd) {
                e.userData.lastAttack = now;

                const spitMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
                const spit = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), spitMat);
                spit.position.copy(e.position).add(new THREE.Vector3(0, 1.6, 0));

                const dir = new THREE.Vector3()
                    .subVectors(state.player.position, e.position)
                    .normalize();
                spit.userData = { dir: dir, speed: 0.65, damage: e.userData.damage, created: now };

                state.scene.add(spit);
                state.spitProjectiles.push(spit);
            }
        } else if (distToPlayer > 1.45) {
            const dir = new THREE.Vector3().subVectors(state.player.position, e.position);
            dir.y = 0;
            dir.normalize();

            e.position.addScaledVector(dir, e.userData.speed * (delta * 60));
            e.lookAt(state.player.position.x, 0, state.player.position.z);
        } else {
            // Melee attack range
            if (now - e.userData.lastAttack > e.userData.def.attackCd) {
                e.userData.lastAttack = now;
                takeDamage(e.userData.damage);
            }
        }
    }
}

export function updateSpitProjectiles(delta) {
    for (let i = state.spitProjectiles.length - 1; i >= 0; i--) {
        const s = state.spitProjectiles[i];
        s.position.addScaledVector(s.userData.dir, s.userData.speed);

        const playerCenter = state.player.position.clone().add(new THREE.Vector3(0, 1.0, 0));
        if (s.position.distanceTo(playerCenter) < 1.1) {
            takeDamage(s.userData.damage);
            createExplosionEffect(s.position, 0x22c55e, 18);
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
            if (b.position.distanceTo(center) < (0.95 * e.scale.y)) {
                destroyed = true;
                state.shotsHit++;
                e.userData.health -= b.userData.damage;
                playSound('hit');
                triggerHitMarker();

                // Flash white on hit
                e.traverse(child => {
                    if (child.isMesh && child.material) {
                        const origHex = child.material.color.getHex();
                        child.material.color.setHex(0xffffff);
                        setTimeout(() => { if (child.material) child.material.color.setHex(origHex); }, 75);
                    }
                });

                if (b.userData.isPlasma) {
                    createExplosionEffect(b.position, 0x06b6d4, 32, 1.3);
                    playSound('explosion');
                    state.enemies.forEach(otherE => {
                        if (otherE !== e && !otherE.userData.isDying) {
                            if (b.position.distanceTo(otherE.position) < b.userData.splashRadius) {
                                otherE.userData.health -= b.userData.damage * 0.65;
                            }
                        }
                    });
                } else {
                    createExplosionEffect(b.position, 0xef4444, 8);
                }

                if (e.userData.health <= 0) {
                    e.userData.isDying = true;
                    e.userData.deathStartTime = now;
                    state.score += e.userData.def.health;
                    state.kills++;
                    updateHUD();

                    if (Math.random() < 0.25) {
                        spawnPowerUp(e.position.clone());
                    }

                    createExplosionEffect(e.position, e.userData.def.color, 24);
                }
                break;
            }
        }

        if (destroyed || now - b.userData.created > 2200 || Math.abs(b.position.x) > CONFIG.groundSize / 2 || Math.abs(b.position.z) > CONFIG.groundSize / 2) {
            state.scene.remove(b);
            state.bullets.splice(i, 1);
        }
    }
}

export function nextWave() {
    state.wave++;
    playSound('wave');
    showWaveBanner(`WAVE ${state.wave}`);
    setTimeout(() => {
        if (state.gameActive && !state.isPaused) {
            spawnWaveEnemies();
        }
    }, 2200);
}
