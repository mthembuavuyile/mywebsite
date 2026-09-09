import { state, setGameState } from '../state.js';
import { CONFIG, WEAPONS } from '../config.js';
import { checkPlayerObstacleCollisions } from '../systems/physics.js';
import { updateWeaponVisual } from './weapons.js';
import { updateHUD } from '../ui/hud.js';

export function createPlayer() {
    state.player = new THREE.Group();
    state.player.position.set(0, 0, 0);
    state.scene.add(state.player);

    state.playerBody = new THREE.Group();

    const matArmor = new THREE.MeshStandardMaterial({ color: 0x162032, roughness: 0.4, metalness: 0.6 });
    const matCloth = new THREE.MeshStandardMaterial({ color: 0x0d121c, roughness: 0.8 });
    const matSkin = new THREE.MeshStandardMaterial({ color: 0xe0b58e, roughness: 0.6 });
    const matVisor = new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x00f0ff, emissiveIntensity: 0.8 });
    const matGun = new THREE.MeshStandardMaterial({ color: 0x11151c, roughness: 0.3, metalness: 0.8 });

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.75, 1.0, 0.45), matArmor);
    torso.position.y = 1.2; torso.castShadow = true;
    state.playerBody.add(torso);

    const badge = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.47), matVisor);
    badge.position.set(0, 1.35, 0.02);
    state.playerBody.add(badge);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), matSkin);
    head.position.y = 1.9; head.castShadow = true;
    state.playerBody.add(head);

    const helmet = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.34, 0.22, 16), matArmor);
    helmet.position.y = 2.0; state.playerBody.add(helmet);

    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.12, 0.22), matVisor);
    visor.position.set(0, 1.92, -0.18); state.playerBody.add(visor);

    const legGeo = new THREE.CylinderGeometry(0.13, 0.11, 0.85, 12);
    const legL = new THREE.Mesh(legGeo, matCloth);
    legL.name = 'legL'; legL.position.set(-0.22, 0.425, 0); legL.castShadow = true;
    const legR = legL.clone(); legR.name = 'legR'; legR.position.x = 0.22;
    state.playerBody.add(legL, legR);

    const armGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.7, 10);
    const armL3rd = new THREE.Mesh(armGeo, matArmor);
    armL3rd.name = 'armL3rd'; armL3rd.position.set(-0.45, 1.35, -0.2); armL3rd.rotation.set(-Math.PI / 4, 0.2, 0.3);
    const armR3rd = new THREE.Mesh(armGeo, matArmor);
    armR3rd.name = 'armR3rd'; armR3rd.position.set(0.45, 1.35, -0.2); armR3rd.rotation.set(-Math.PI / 3, -0.3, -0.3);
    state.playerBody.add(armL3rd, armR3rd);

    const gun3rd = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.6), matGun);
    gun3rd.position.set(0.2, 1.25, -0.4); gun3rd.rotation.y = -0.1;
    state.playerBody.add(gun3rd);

    state.playerBody.visible = false;
    state.player.add(state.playerBody);

    state.camera.position.set(0, 1.7, 0);
    state.player.add(state.camera);

    state.weaponHolder = new THREE.Group();
    state.weaponHolder.position.set(0.32, -0.28, -0.55);
    state.camera.add(state.weaponHolder);

    const laserGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -40)
    ]);
    const laserMat = new THREE.LineBasicMaterial({ color: 0xff0044, transparent: true, opacity: 0.6 });
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
        if (state.playerBody) state.playerBody.visible = state.isThirdPerson && !state.playerGltfModel;
        state.player.add(state.playerGltfModel);
    }, undefined, (err) => {
        console.warn('fbi.glb not found or failed to load, using procedural fallback model');
    });
}

export function updatePlayer(delta) {
    const speed = CONFIG.playerSpeed * delta;
    const moveDir = new THREE.Vector3();

    const forward = new THREE.Vector3();
    state.player.getWorldDirection(forward);
    forward.y = 0; forward.normalize();

    const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), forward).normalize();

    if (state.moveForward) moveDir.sub(forward);
    if (state.moveBackward) moveDir.add(forward);
    if (state.moveLeft) moveDir.sub(right);
    if (state.moveRight) moveDir.add(right);

    if (state.touchMoveActive) {
        moveDir.addScaledVector(forward, -state.touchMoveDir.y);
        moveDir.addScaledVector(right, state.touchMoveDir.x);
    }

    if (moveDir.lengthSq() > 0) {
        moveDir.normalize();

        if (state.isThirdPerson) {
            const walkCycle = state.clock.getElapsedTime() * 12;
            const legL = state.playerBody.getObjectByName('legL');
            const legR = state.playerBody.getObjectByName('legR');
            if (legL) legL.rotation.x = Math.sin(walkCycle) * 0.5;
            if (legR) legR.rotation.x = -Math.sin(walkCycle) * 0.5;
        }
    } else if (state.isThirdPerson) {
        const legL = state.playerBody.getObjectByName('legL');
        const legR = state.playerBody.getObjectByName('legR');
        if (legL) legL.rotation.x = 0;
        if (legR) legR.rotation.x = 0;
    }

    const nextPos = state.player.position.clone().addScaledVector(moveDir, speed);

    const bound = CONFIG.groundSize / 2 - 1.5;
    nextPos.x = Math.max(-bound, Math.min(bound, nextPos.x));
    nextPos.z = Math.max(-bound, Math.min(bound, nextPos.z));

    if (checkPlayerObstacleCollisions(nextPos)) {
        state.player.position.copy(nextPos);
    }
}

export function takeDamage(amount) {
    state.health = Math.max(0, state.health - amount);
    updateHUD();

    const flash = document.getElementById('damageFlash');
    if(flash) {
        flash.style.opacity = '1';
        setTimeout(() => flash.style.opacity = '0', 200);
    }

    if (state.health <= 0) {
        // We will dispatch a game over event or call main.js function later.
        document.dispatchEvent(new Event('gameOver'));
    }
}
