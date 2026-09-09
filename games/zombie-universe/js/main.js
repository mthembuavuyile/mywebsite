import { state, resetGameStats } from './state.js';
import { CONFIG, WEAPONS } from './config.js';
import { initAudio } from './systems/audio.js';
import { setupGraphics, onResize } from './systems/graphics.js';
import { createEnvironment } from './entities/map.js';
import { createPlayer, loadPlayerModelGLTF, updatePlayer } from './entities/player.js';
import { loadZombieModelGLTF, spawnWaveEnemies, updateEnemies, updateSpitProjectiles, updateBullets } from './entities/zombies.js';
import { switchWeapon, reloadWeapon, shoot } from './entities/weapons.js';
import { updateHUD, setupUI, showWaveBanner } from './ui/hud.js';
import { initMinimap, drawMinimap } from './ui/minimap.js';

function init() {
    setupGraphics();
    createEnvironment();
    createPlayer();
    loadPlayerModelGLTF();
    loadZombieModelGLTF();
    initMinimap();
    setupUI();
    setupEventListeners();

    document.getElementById('startScreen').style.display = 'flex';
}

function updateParticles(delta) {
    const now = Date.now();
    for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.position.addScaledVector(p.userData.dir, p.userData.speed);

        const lifeRatio = 1 - ((now - p.userData.created) / p.userData.life);
        if (lifeRatio <= 0) {
            state.scene.remove(p);
            state.particles.splice(i, 1);
        } else {
            p.scale.setScalar(lifeRatio);
            p.material.opacity = lifeRatio;
        }
    }
}

function updatePowerUps(delta) {
    state.powerUps.forEach((pu, i) => {
        pu.rotation.y += 0.03;
        pu.position.y = 0.8 + Math.sin(Date.now() * 0.004) * 0.15;

        if (pu.position.distanceTo(state.player.position) < 1.8) {
            if (pu.userData.type === 'health') {
                state.health = Math.min(state.maxHealth, state.health + 45);
            } else {
                state.weaponState[state.currentWeaponIdx].ammo = WEAPONS[state.currentWeaponIdx].magSize;
            }
            updateHUD();
            state.scene.remove(pu);
            state.powerUps.splice(i, 1);
        }
    });
}

function update(delta) {
    if (state.isPaused) return;

    if (state.isShooting) shoot();
    updatePlayer(delta);
    updateEnemies(delta);
    updateBullets(delta);
    updateSpitProjectiles(delta);
    updateParticles(delta);
    updatePowerUps(delta);
    drawMinimap();
}

function animate() {
    if (!state.gameActive) return;
    requestAnimationFrame(animate);

    const delta = state.clock.getDelta();
    update(delta);
    state.renderer.render(state.scene, state.camera);
}

function startGame() {
    initAudio();
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('hud').style.display = 'flex';
    document.getElementById('weaponSelector').style.display = 'flex';
    document.getElementById('crosshair').style.display = 'block';
    document.getElementById('minimapContainer').style.display = 'block';

    state.gameActive = true;
    resetGameStats();
    state.weaponState = WEAPONS.map(w => ({ ammo: w.magSize, isReloading: false }));

    spawnWaveEnemies();
    showWaveBanner('WAVE 1');
    updateHUD();

    state.clock.start();
    animate();
}

function togglePause() {
    if (!state.gameActive) return;
    state.isPaused = !state.isPaused;
    document.getElementById('pauseScreen').style.display = state.isPaused ? 'flex' : 'none';
    if (state.isPaused) document.exitPointerLock();
}

function toggleCameraView() {
    state.isThirdPerson = !state.isThirdPerson;
    if (state.playerGltfModel) state.playerGltfModel.visible = state.isThirdPerson;
    if (state.playerBody) state.playerBody.visible = state.isThirdPerson && !state.playerGltfModel;
    if (state.weaponHolder) state.weaponHolder.visible = !state.isThirdPerson;

    if (state.isThirdPerson) {
        state.camera.position.set(0, 2.4, 4.5);
        state.camera.rotation.set(-0.25, 0, 0);
        document.getElementById('crosshair').style.display = 'none';
    } else {
        state.camera.position.set(0, 1.7, 0);
        state.camera.rotation.set(0, 0, 0);
        document.getElementById('crosshair').style.display = 'block';
    }
}

function gameOver() {
    state.gameActive = false;
    document.exitPointerLock();
    document.getElementById('hud').style.display = 'none';
    document.getElementById('weaponSelector').style.display = 'none';
    document.getElementById('crosshair').style.display = 'none';
    document.getElementById('minimapContainer').style.display = 'none';

    document.getElementById('finalScore').textContent = `Final Score: ${state.score} | Waves Survived: ${state.wave - 1}`;
    document.getElementById('gameOver').style.display = 'flex';
}

document.addEventListener('gameOver', gameOver);

function setupEventListeners() {
    window.addEventListener('resize', onResize);

    document.addEventListener('keydown', (e) => {
        if (e.code === 'KeyW' || e.code === 'ArrowUp') state.moveForward = true;
        if (e.code === 'KeyS' || e.code === 'ArrowDown') state.moveBackward = true;
        if (e.code === 'KeyA' || e.code === 'ArrowLeft') state.moveLeft = true;
        if (e.code === 'KeyD' || e.code === 'ArrowRight') state.moveRight = true;

        if (e.code === 'KeyR') reloadWeapon();
        if (e.code === 'KeyV') toggleCameraView();
        if (e.code === 'Escape') togglePause();
        if (e.code === 'Space') state.isShooting = true;

        if (e.code === 'Digit1') switchWeapon(0);
        if (e.code === 'Digit2') switchWeapon(1);
        if (e.code === 'Digit3') switchWeapon(2);
        if (e.code === 'Digit4') switchWeapon(3);
    });

    document.addEventListener('keyup', (e) => {
        if (e.code === 'KeyW' || e.code === 'ArrowUp') state.moveForward = false;
        if (e.code === 'KeyS' || e.code === 'ArrowDown') state.moveBackward = false;
        if (e.code === 'KeyA' || e.code === 'ArrowLeft') state.moveLeft = false;
        if (e.code === 'KeyD' || e.code === 'ArrowRight') state.moveRight = false;
        if (e.code === 'Space') state.isShooting = false;
    });

    window.addEventListener('wheel', (e) => {
        if (!state.gameActive || state.isPaused) return;
        let nextIdx = state.currentWeaponIdx + (e.deltaY > 0 ? 1 : -1);
        if (nextIdx < 0) nextIdx = WEAPONS.length - 1;
        if (nextIdx >= WEAPONS.length) nextIdx = 0;
        switchWeapon(nextIdx);
    });

    const canvas = document.getElementById('gameCanvas');
    canvas.addEventListener('mousedown', (e) => {
        if (e.button === 0 && state.gameActive && !state.isPaused) {
            if (document.pointerLockElement !== canvas) {
                canvas.requestPointerLock();
            }
            state.isShooting = true;
        }
    });

    document.addEventListener('mouseup', () => state.isShooting = false);

    document.addEventListener('mousemove', (e) => {
        if (document.pointerLockElement === canvas && state.gameActive && !state.isPaused) {
            state.player.rotation.y -= e.movementX * CONFIG.mouseSens;
            if (!state.isThirdPerson) {
                state.camera.rotation.x -= e.movementY * CONFIG.mouseSens;
                state.camera.rotation.x = Math.max(CONFIG.minPitch, Math.min(CONFIG.maxPitch, state.camera.rotation.x));
            } else {
                state.camera.rotation.x -= e.movementY * CONFIG.mouseSens * 0.5;
                state.camera.rotation.x = Math.max(-0.4, Math.min(0.2, state.camera.rotation.x));
            }
        }
    });

    document.getElementById('startButton').addEventListener('click', startGame);
    document.getElementById('resumeButton').addEventListener('click', togglePause);
    document.getElementById('viewToggleButton').addEventListener('click', toggleCameraView);
    document.getElementById('restartButtonPause').addEventListener('click', () => location.reload());
    document.getElementById('restartButtonGameOver').addEventListener('click', () => location.reload());
}

window.onload = init;
