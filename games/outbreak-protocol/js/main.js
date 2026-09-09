import { state, resetGameStats } from './state.js';
import { CONFIG, WEAPONS } from './config.js';
import { initAudio, playSound } from './systems/audio.js';
import { setupGraphics, onResize } from './systems/graphics.js';
import { createEnvironment } from './entities/map.js';
import { createPlayer, loadPlayerModelGLTF, updatePlayer } from './entities/player.js';
import { loadZombieModelGLTF, spawnWaveEnemies, updateEnemies, updateSpitProjectiles, updateBullets } from './entities/zombies.js';
import { switchWeapon, reloadWeapon, shoot } from './entities/weapons.js';
import { updateParticles } from './systems/particles.js';
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

function updatePowerUps(delta) {
    for (let i = state.powerUps.length - 1; i >= 0; i--) {
        const pu = state.powerUps[i];
        pu.rotation.y += 0.035;
        pu.position.y = 0.8 + Math.sin(Date.now() * 0.005) * 0.16;

        if (pu.position.distanceTo(state.player.position) < 1.9) {
            if (pu.userData.type === 'health') {
                state.health = Math.min(state.maxHealth, state.health + 40);
                playSound('health');
            } else {
                state.weaponState[state.currentWeaponIdx].ammo = WEAPONS[state.currentWeaponIdx].magSize;
                playSound('powerup');
            }
            updateHUD();
            state.scene.remove(pu);
            state.powerUps.splice(i, 1);
        }
    }
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

    const delta = Math.min(state.clock.getDelta(), 0.1);
    update(delta);
    state.renderer.render(state.scene, state.camera);
}

function startGame() {
    initAudio();
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('hud').style.display = 'flex';
    document.getElementById('weaponSelector').style.display = 'flex';
    document.getElementById('crosshair').style.display = state.isThirdPerson ? 'none' : 'block';
    document.getElementById('minimapContainer').style.display = 'block';

    state.gameActive = true;
    state.isPaused = false;
    resetGameStats();

    // Reset weapons ammo
    state.weaponState = WEAPONS.map(w => ({ ammo: w.magSize, isReloading: false }));

    spawnWaveEnemies();
    showWaveBanner('WAVE 1');
    updateHUD();

    state.clock.start();
    animate();

    const canvas = document.getElementById('gameCanvas');
    if (canvas && document.pointerLockElement !== canvas) {
        canvas.requestPointerLock().catch(() => {});
    }
}

function togglePause() {
    if (!state.gameActive) return;
    state.isPaused = !state.isPaused;
    document.getElementById('pauseScreen').style.display = state.isPaused ? 'flex' : 'none';

    if (state.isPaused) {
        document.exitPointerLock();
    } else {
        const canvas = document.getElementById('gameCanvas');
        if (canvas) canvas.requestPointerLock().catch(() => {});
    }
}

function toggleCameraView() {
    state.isThirdPerson = !state.isThirdPerson;

    if (state.playerGltfModel) state.playerGltfModel.visible = state.isThirdPerson;
    if (state.playerBody) state.playerBody.visible = state.isThirdPerson && !state.playerGltfModel;
    if (state.weaponHolder) state.weaponHolder.visible = !state.isThirdPerson;

    if (state.isThirdPerson) {
        state.camera.position.set(0, 2.5, 4.8);
        state.camera.rotation.set(-0.24, 0, 0);
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

    // Calculate accuracy
    const accuracy = state.shotsFired > 0
        ? Math.round((state.shotsHit / state.shotsFired) * 100)
        : 0;

    // Save High Score
    const currentHigh = parseInt(localStorage.getItem(CONFIG.storageScoreKey) || '0');
    const isNewHigh = state.score > currentHigh;
    if (isNewHigh) {
        localStorage.setItem(CONFIG.storageScoreKey, state.score.toString());
        localStorage.setItem(CONFIG.storageWaveKey, state.wave.toString());
    }

    const finalScoreEl = document.getElementById('finalScore');
    if (finalScoreEl) {
        finalScoreEl.innerHTML = `
            <div style="font-size: 1.4rem; font-weight: 700; margin-bottom: 8px; color: ${isNewHigh ? '#22c55e' : '#fff'};">
                ${isNewHigh ? '🏆 NEW RECORD HIGH SCORE!' : 'OPERATIVE STATUS: DECEASED'}
            </div>
            <div>Score: <b>${state.score.toLocaleString()}</b> | Waves Survived: <b>${state.wave - 1}</b></div>
            <div>Enemies Neutralized: <b>${state.kills}</b> | Accuracy: <b>${accuracy}%</b></div>
        `;
    }

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

        if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') state.isSprinting = true;
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
        if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') state.isSprinting = false;
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
                canvas.requestPointerLock().catch(() => {});
            }
            state.isShooting = true;
        }
    });

    document.addEventListener('mouseup', () => {
        state.isShooting = false;
    });

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

    // Touch Controls (Mobile)
    const joystick = document.getElementById('moveJoystick');
    const thumb = joystick ? joystick.querySelector('.touch-thumb') : null;
    let touchId = null;
    let touchStart = { x: 0, y: 0 };

    if (joystick) {
        joystick.addEventListener('touchstart', (e) => {
            const touch = e.changedTouches[0];
            touchId = touch.identifier;
            const rect = joystick.getBoundingClientRect();
            touchStart = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
            state.touchMoveActive = true;
        });

        window.addEventListener('touchmove', (e) => {
            if (!state.touchMoveActive) return;
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === touchId) {
                    const t = e.changedTouches[i];
                    const dx = t.clientX - touchStart.x;
                    const dy = t.clientY - touchStart.y;
                    const dist = Math.hypot(dx, dy);
                    const maxDist = 45;
                    const clampDist = Math.min(dist, maxDist);
                    const angle = Math.atan2(dy, dx);

                    const clampedX = Math.cos(angle) * clampDist;
                    const clampedY = Math.sin(angle) * clampDist;

                    if (thumb) {
                        thumb.style.transform = `translate(calc(-50% + ${clampedX}px), calc(-50% + ${clampedY}px))`;
                    }
                    state.touchMoveDir = { x: clampedX / maxDist, y: clampedY / maxDist };
                }
            }
        });

        const endTouch = () => {
            state.touchMoveActive = false;
            state.touchMoveDir = { x: 0, y: 0 };
            if (thumb) thumb.style.transform = 'translate(-50%, -50%)';
        };
        window.addEventListener('touchend', endTouch);
        window.addEventListener('touchcancel', endTouch);
    }

    const shootTouch = document.getElementById('shootBtnTouch');
    if (shootTouch) {
        shootTouch.addEventListener('touchstart', (e) => { e.preventDefault(); state.isShooting = true; });
        shootTouch.addEventListener('touchend', () => { state.isShooting = false; });
    }

    const viewBtnTouch = document.getElementById('viewBtnTouch');
    if (viewBtnTouch) {
        viewBtnTouch.addEventListener('click', toggleCameraView);
    }

    // UI Buttons
    document.getElementById('startButton').addEventListener('click', startGame);
    document.getElementById('resumeButton').addEventListener('click', togglePause);
    document.getElementById('viewToggleButton').addEventListener('click', toggleCameraView);
    document.getElementById('restartButtonPause').addEventListener('click', () => location.reload());
    document.getElementById('restartButtonGameOver').addEventListener('click', () => location.reload());
}

window.onload = init;
