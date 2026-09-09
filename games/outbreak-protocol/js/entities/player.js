import { state } from '../state.js';
import { CONFIG } from '../config.js';
import { checkPlayerObstacleCollisions } from '../systems/physics.js';
import { playSound } from '../systems/audio.js';
import { updateWeaponVisual } from './weapons.js';
import { updateHUD } from '../ui/hud.js';

let bobTimer = 0;

export function createPlayer() {
    state.player = new THREE.Group();
    state.player.position.set(0, 0, 0);
    state.scene.add(state.player);

    // Procedural 3rd-person operative model
    state.playerBody = new THREE.Group();

    const matArmor = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.7 });
    const matCloth = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const matSkin = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.6 });
    const matVisor = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 0.85 });
    const matGun = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.3, metalness: 0.8 });

    // Torso & tactical vest
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.75, 1.0, 0.45), matArmor);
    torso.position.y = 1.2;
    torso.castShadow = true;
    state.playerBody.add(torso);

    // Tactical badge
    const badge = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.47), matVisor);
    badge.position.set(0, 1.35, 0.02);
    state.playerBody.add(badge);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), matSkin);
    head.position.y = 1.9;
    head.castShadow = true;
    state.playerBody.add(head);

    // Tactical helmet & visor
    const helmet = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.34, 0.22, 16), matArmor);
    helmet.position.y = 2.0;
    state.playerBody.add(helmet);

    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.12, 0.22), matVisor);
    visor.position.set(0, 1.92, -0.18);
    state.playerBody.add(visor);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.13, 0.11, 0.85, 12);
    const legL = new THREE.Mesh(legGeo, matCloth);
    legL.name = 'legL';
    legL.position.set(-0.22, 0.425, 0);
    legL.castShadow = true;
    const legR = legL.clone();
    legR.name = 'legR';
    legR.position.x = 0.22;
    state.playerBody.add(legL, legR);

    // Arms
    const armGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.7, 10);
    const armL = new THREE.Mesh(armGeo, matArmor);
    armL.name = 'armL';
    armL.position.set(-0.45, 1.35, -0.2);
    armL.rotation.set(-Math.PI / 4, 0.2, 0.3);
    const armR = new THREE.Mesh(armGeo, matArmor);
    armR.name = 'armR';
    armR.position.set(0.45, 1.35, -0.2);
    armR.rotation.set(-Math.PI / 3, -0.3, -0.3);
    state.playerBody.add(armL, armR);

    // Gun in hand for 3rd person
    const gun3rd = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.6), matGun);
    gun3rd.position.set(0.2, 1.25, -0.4);
    gun3rd.rotation.y = -0.1;
    state.playerBody.add(gun3rd);

    state.playerBody.visible = false;
    state.player.add(state.playerBody);

    // Camera setup inside player group
    state.camera.position.set(0, 1.7, 0);
    state.player.add(state.camera);

    // 1st-person weapon holder attached to camera
    state.weaponHolder = new THREE.Group();
    state.weaponHolder.position.set(0.32, -0.28, -0.55);
    state.camera.add(state.weaponHolder);

    // Laser sight
    const laserGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -45)
    ]);
    const laserMat = new THREE.LineBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.65 });
    state.laserSight = new THREE.Line(laserGeo, laserMat);
    state.weaponHolder.add(state.laserSight);

    updateWeaponVisual();
}

export function loadPlayerModelGLTF() {
    if (typeof THREE.GLTFLoader === 'undefined') return;
    const loader = new THREE.GLTFLoader();
    loader.load('assets/models/fbi.glb', (gltf) => {
        state.playerGltfModel = gltf.scene;
        state.playerGltfModel.scale.setScalar(1.0);
        state.playerGltfModel.position.set(0, 0, 0);
        state.playerGltfModel.rotation.y = Math.PI;

        state.playerGltfModel.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        state.playerGltfModel.visible = state.isThirdPerson;
        if (state.playerBody) {
            state.playerBody.visible = state.isThirdPerson && !state.playerGltfModel;
        }
        state.player.add(state.playerGltfModel);
    }, undefined, () => {
        console.info('Using high-poly procedural operative model.');
    });
}

export function updatePlayer(delta) {
    // Stamina calculation for sprint
    if (state.isSprinting && (state.moveForward || state.moveBackward || state.moveLeft || state.moveRight)) {
        state.stamina = Math.max(0, state.stamina - CONFIG.staminaDrain * delta);
        if (state.stamina <= 0) {
            state.isSprinting = false;
        }
    } else {
        state.stamina = Math.min(CONFIG.maxStamina, state.stamina + CONFIG.staminaRegen * delta);
    }

    const currentSpeed = (state.isSprinting ? CONFIG.playerSprintSpeed : CONFIG.playerSpeed) * delta;
    const moveDir = new THREE.Vector3();

    const forward = new THREE.Vector3();
    state.player.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), forward).normalize();

    if (state.moveForward) moveDir.sub(forward);
    if (state.moveBackward) moveDir.add(forward);
    if (state.moveLeft) moveDir.sub(right);
    if (state.moveRight) moveDir.add(right);

    // Mobile touch vector support
    if (state.touchMoveActive) {
        moveDir.addScaledVector(forward, -state.touchMoveDir.y);
        moveDir.addScaledVector(right, state.touchMoveDir.x);
    }

    const isMoving = moveDir.lengthSq() > 0.001;

    if (isMoving) {
        moveDir.normalize();

        // 1st-person head bob
        if (!state.isThirdPerson) {
            bobTimer += delta * (state.isSprinting ? 14 : 9);
            state.camera.position.y = 1.7 + Math.sin(bobTimer) * (state.isSprinting ? 0.05 : 0.025);
            state.weaponHolder.position.x = 0.32 + Math.cos(bobTimer * 0.5) * 0.015;
        }

        // 3rd-person leg walk cycle
        if (state.isThirdPerson && state.playerBody) {
            const walkCycle = state.clock.getElapsedTime() * (state.isSprinting ? 16 : 10);
            const legL = state.playerBody.getObjectByName('legL');
            const legR = state.playerBody.getObjectByName('legR');
            if (legL) legL.rotation.x = Math.sin(walkCycle) * 0.5;
            if (legR) legR.rotation.x = -Math.sin(walkCycle) * 0.5;
        }
    } else {
        if (!state.isThirdPerson) {
            state.camera.position.y = 1.7;
            state.weaponHolder.position.x = 0.32;
        }
        if (state.isThirdPerson && state.playerBody) {
            const legL = state.playerBody.getObjectByName('legL');
            const legR = state.playerBody.getObjectByName('legR');
            if (legL) legL.rotation.x = 0;
            if (legR) legR.rotation.x = 0;
        }
    }

    // New prospective position
    const nextPos = state.player.position.clone().addScaledVector(moveDir, currentSpeed);

    // Arena boundary limits
    const bound = CONFIG.groundSize / 2 - 2.0;
    nextPos.x = Math.max(-bound, Math.min(bound, nextPos.x));
    nextPos.z = Math.max(-bound, Math.min(bound, nextPos.z));

    // Collision check against precomputed static obstacles
    if (checkPlayerObstacleCollisions(nextPos)) {
        state.player.position.copy(nextPos);
    } else {
        // Sliding along axes if single-axis movement is clear
        const slideX = state.player.position.clone();
        slideX.x = nextPos.x;
        if (checkPlayerObstacleCollisions(slideX)) {
            state.player.position.copy(slideX);
        } else {
            const slideZ = state.player.position.clone();
            slideZ.z = nextPos.z;
            if (checkPlayerObstacleCollisions(slideZ)) {
                state.player.position.copy(slideZ);
            }
        }
    }

    updateHUD();
}

export function takeDamage(amount) {
    if (!state.gameActive || state.health <= 0) return;

    state.health = Math.max(0, state.health - amount);
    playSound('hurt');
    updateHUD();

    const flash = document.getElementById('damageFlash');
    if (flash) {
        flash.style.opacity = '1';
        setTimeout(() => { if (flash) flash.style.opacity = '0'; }, 220);
    }

    if (state.health <= 0) {
        document.dispatchEvent(new Event('gameOver'));
    }
}
