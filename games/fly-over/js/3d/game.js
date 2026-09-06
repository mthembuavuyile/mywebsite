/* ==========================================================================
   Game Coordinator — High-Stakes Flight Loop, Stunt Gates, & Arcade Physics
   ========================================================================== */

class Game {
    constructor() {
        this.stadiumDefs = StadiumBuilder.getStadiumDefs();
        this.currentStadiumIndex = 0;
        this.state = 'MENU'; // MENU, CINEMATIC, FLIGHT, RESULT
        
        // Flight state & metrics
        this.score = 0;
        this.multiplier = 1.0;
        this.hype = 0;
        this.peakHype = 0;
        this.closestClearance = 999;
        this.proximityBonus = 0;
        this.gatesHit = 0;
        this.totalGates = 6;
        this.currentGateIndex = 0;
        this.diveGateCleared = false;
        
        // Wind
        this.windTime = 0;
        this.windVector = { x: 0, y: 0 };
        this.isMuted = false;
        
        // Pyrotechnics
        this.pyroParticles = [];
        this.pyroTimer = 0;
        
        // Keyboard Controls
        this.keys = {
            pitchUp: false,
            pitchDown: false,
            rollLeft: false,
            rollRight: false,
            boost: false,
            brake: false
        };

        // Mobile Touch Inputs
        this.touchInput = {
            analogPitch: 0,
            analogRoll: 0,
            pitchDown: false,
            boost: false,
            brake: false
        };

        // Gamepad Inputs
        this.gamepadRoll = 0;
        this.gamepadPitch = 0;
        this.gamepadBoost = false;
        this.gamepadBrake = false;
        this._lastGpCamPressed = false;

        this._initThree();
        this._initAudio();
        this._initInputs();
        
        this.ui = new UIController(this);
        this.aircraft = new Aircraft(this.scene);
        this.cameraController = new CameraController(this.camera);
        this.cameraController.setupOrbitControls(this.renderer.domElement);

        this.currentEnv = null;
        this._loadStadiumEnvironment(0);

        this.clock = new THREE.Clock();
        this._animate();
    }

    _initThree() {
        const container = document.getElementById('game-canvas-container');
        const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth <= 900;
        const isPortrait = window.innerWidth < window.innerHeight;
        const initialFov = isPortrait ? 74 : 60;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x70c5e8); // Cape Town coastal sky
        this.scene.fog = new THREE.FogExp2(0x70c5e8, 0.00038);

        this.camera = new THREE.PerspectiveCamera(initialFov, window.innerWidth / window.innerHeight, 0.5, 7500);
        this.camera.position.set(0, 180, 2300);

        this.renderer = new THREE.WebGLRenderer({ 
            antialias: !isMobile, 
            powerPreference: 'high-performance' 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 1.75));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        container.appendChild(this.renderer.domElement);

        // Lighting
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x2e7d32, 0.7);
        hemiLight.position.set(0, 500, 0);
        this.scene.add(hemiLight);

        const sunLight = new THREE.DirectionalLight(0xfffaed, 1.35);
        sunLight.position.set(350, 550, 300);
        sunLight.castShadow = true;
        const shadowRes = isMobile ? 1024 : 2048;
        sunLight.shadow.mapSize.width = shadowRes;
        sunLight.shadow.mapSize.height = shadowRes;
        sunLight.shadow.camera.near = 20;
        sunLight.shadow.camera.far = 2500;
        sunLight.shadow.camera.left = -400;
        sunLight.shadow.camera.right = 400;
        sunLight.shadow.camera.top = 400;
        sunLight.shadow.camera.bottom = -400;
        this.scene.add(sunLight);

        window.addEventListener('resize', () => {
            const isPort = window.innerWidth < window.innerHeight;
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.fov = isPort ? 74 : 60;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    _initAudio() {
        if (!window._audioManager) {
            window._audioManager = new AudioManager();
        }
        this.audio = window._audioManager;
    }

    _initInputs() {
        window.addEventListener('keydown', e => {
            if (e.repeat) return;

            // Decoupled flight controls:
            // Pitch: W / Up = pull up/climb, S / Down = push down/dive
            if (e.code === 'KeyW' || e.code === 'ArrowUp') {
                this.keys.pitchUp = true;
            }
            if (e.code === 'KeyS' || e.code === 'ArrowDown') {
                this.keys.pitchDown = true;
            }

            // Roll: A / Left = bank left, D / Right = bank right
            if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
                this.keys.rollLeft = true;
            }
            if (e.code === 'KeyD' || e.code === 'ArrowRight') {
                this.keys.rollRight = true;
            }

            // Boost: Space or Shift (decoupled from pitch!)
            if (e.code === 'Space' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
                this.keys.boost = true;
                if (this.audio && this.state === 'FLIGHT') this.audio.boostEngage();
            }

            // Airbrake / Dive Flaps: X or Ctrl
            if (e.code === 'KeyX' || e.code === 'ControlLeft' || e.code === 'ControlRight') {
                this.keys.brake = true;
                if (this.audio && this.state === 'FLIGHT') this.audio.airbrake();
            }

            // Camera switch: C
            if (e.code === 'KeyC') {
                this.toggleCamera();
            }

            // Quick Restart: R
            if (e.code === 'KeyR') {
                this.launchLevel(this.currentStadiumIndex);
                this.startFlight();
            }

            // Audio mute: M
            if (e.code === 'KeyM') {
                this.toggleAudio();
            }

            // Cinematic start: Space or Enter
            if (this.state === 'CINEMATIC' && (e.code === 'Space' || e.code === 'Enter')) {
                this.startFlight();
            }
        });

        window.addEventListener('keyup', e => {
            if (e.code === 'KeyW' || e.code === 'ArrowUp') this.keys.pitchUp = false;
            if (e.code === 'KeyS' || e.code === 'ArrowDown') this.keys.pitchDown = false;
            if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.keys.rollLeft = false;
            if (e.code === 'KeyD' || e.code === 'ArrowRight') this.keys.rollRight = false;
            if (e.code === 'Space' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') this.keys.boost = false;
            if (e.code === 'KeyX' || e.code === 'ControlLeft' || e.code === 'ControlRight') this.keys.brake = false;
        });

        // Cinematic Screen Click / Tap to start
        window.addEventListener('pointerdown', e => {
            if (this.state === 'CINEMATIC') {
                this.startFlight();
            }
        });

        // Mobile Audio Context Unlock on first touch/click
        const unlockAudio = () => {
            if (this.audio) {
                this.audio.init();
                this.audio.resume();
            }
            window.removeEventListener('touchstart', unlockAudio);
            window.removeEventListener('pointerdown', unlockAudio);
        };
        window.addEventListener('touchstart', unlockAudio, { passive: true });
        window.addEventListener('pointerdown', unlockAudio, { passive: true });
    }

    _pollGamepad() {
        if (!navigator.getGamepads) return;
        const gamepads = navigator.getGamepads();
        const gp = gamepads[0];
        if (!gp) return;

        // Left Stick (Axes 0: Roll, Axes 1: Pitch)
        const stickX = gp.axes[0] || 0;
        const stickY = gp.axes[1] || 0;

        this.gamepadRoll = Math.abs(stickX) > 0.15 ? stickX : 0;
        // Stick Down (pull back) = climb (+), Stick Up (push forward) = dive (-)
        this.gamepadPitch = Math.abs(stickY) > 0.15 ? -stickY : 0;

        // Right Trigger (Button 7) or A Button (Button 0) = Boost
        this.gamepadBoost = (gp.buttons[7] && gp.buttons[7].pressed) || (gp.buttons[0] && gp.buttons[0].pressed);
        // Left Trigger (Button 6) or B Button (Button 1) = Brake
        this.gamepadBrake = (gp.buttons[6] && gp.buttons[6].pressed) || (gp.buttons[1] && gp.buttons[1].pressed);

        // Y Button (Button 3) = Camera Switch
        const camBtn = gp.buttons[3] && gp.buttons[3].pressed;
        if (camBtn && !this._lastGpCamPressed) {
            this.toggleCamera();
        }
        this._lastGpCamPressed = camBtn;
    }

    toggleCamera() {
        if (!this.cameraController) return 'CHASE';
        const newView = this.cameraController.cycleFlightView();
        if (this.ui) {
            this.ui.updateCameraDisplay(newView);
        }
        return newView;
    }

    _loadStadiumEnvironment(index) {
        if (this.currentEnv) {
            this.scene.remove(this.currentEnv.group);
        }
        this.currentStadiumIndex = index;
        const def = this.stadiumDefs[index];
        this.currentEnv = StadiumBuilder.buildEnvironment(this.scene, def.id);
    }

    launchLevel(index) {
        this._loadStadiumEnvironment(index);
        const def = this.stadiumDefs[index];
        
        this.aircraft.reset(def.startPos);
        this.cameraController.setMode('CINEMATIC_INTRO');
        this.state = 'CINEMATIC';

        if (this.audio) {
            this.audio.init();
            this.audio.resume();
            this.audio.startWind(0.3);
        }

        this.ui.setupCinematic(def);
    }

    startFlight() {
        if (this.state !== 'CINEMATIC') return;
        
        this.state = 'FLIGHT';
        this.score = 0;
        this.multiplier = 1.0;
        this.hype = 0;
        this.peakHype = 0;
        this.closestClearance = 999;
        this.proximityBonus = 0;
        this.gatesHit = 0;
        this.currentGateIndex = 0;
        this.diveGateCleared = false;
        this._vuvuzelaTriggered = false;

        const def = this.stadiumDefs[this.currentStadiumIndex];
        this.aircraft.reset(def.startPos);
        this.cameraController.setMode('ACTION_FLIGHT');

        if (this.audio) {
            this.audio.uiClick();
            this.audio.startEngine();
            this.audio.startWind(def.windFactor * 0.4);
        }

        this.ui.setupHUD(def);
    }

    enterMenu() {
        this.state = 'MENU';
        this.cameraController.setMode('CINEMATIC_INTRO');
        if (this.audio) {
            this.audio.stopAll();
        }
    }

    _checkProximityAndCollisions(dt) {
        const jetPos = this.aircraft.position;
        const def = this.stadiumDefs[this.currentStadiumIndex];

        // ── 1. Calculate Real-Time Clearance ──
        let minClearance = 999;

        // Distance to terrain ground
        const groundDist = jetPos.y - 1.8;
        if (groundDist < minClearance) minClearance = groundDist;

        // Distance to stadium roof / obstacles
        if (this.currentEnv && this.currentEnv.colliders) {
            for (let c of this.currentEnv.colliders) {
                if (c.box) {
                    if (c.box.containsPoint(jetPos)) {
                        this._triggerCrash();
                        return;
                    }

                    const closestPoint = new THREE.Vector3();
                    c.box.clampPoint(jetPos, closestPoint);
                    const dist = jetPos.distanceTo(closestPoint);
                    if (dist < minClearance) {
                        minClearance = dist;
                    }
                }
            }
        }

        this.aircraft.clearance = minClearance;
        if (minClearance < this.closestClearance) {
            this.closestClearance = minClearance;
        }

        // Direct ground crash threshold
        if (groundDist <= 0.4) {
            this._triggerCrash();
            return;
        }

        // ── 2. Flight Gates Collision Check ──
        if (this.currentEnv && this.currentEnv.flightGates) {
            this.currentEnv.flightGates.forEach((gate, idx) => {
                if (!gate.passed) {
                    const distToGate = jetPos.distanceTo(gate.pos);
                    if (distToGate < gate.radius) {
                        gate.passed = true;
                        this.gatesHit++;
                        this.currentGateIndex = idx + 1;
                        this.score += 5000;
                        this.hype = Math.min(100, this.hype + 20);

                        if (gate.required) {
                            this.diveGateCleared = true;
                        }

                        // Stunt Gate Chime & Haptic
                        if (this.audio) this.audio.gateSuccess();
                        if (navigator.vibrate) navigator.vibrate(30);

                        // Barrel Roll Stunt Bonus
                        if (Math.abs(this.aircraft.roll) > 0.38) {
                            this.score += 2500;
                            this.ui.showBonusPopup('🌀 BARREL ROLL! +2,500');
                        } else {
                            this.ui.showBonusPopup(`🎯 ${gate.label}! +5,000`);
                        }

                        // Gate flash animation
                        gate.mesh.scale.set(1.4, 1.4, 1.4);
                        gate.mesh.children.forEach(c => {
                            if (c.material) c.material.color.setHex(0xffffff);
                        });
                    }
                }
            });
        }

        // ── 3. Stadium Bowl Dive Zone & Proximity Scoring ──
        const inStadiumZone = (jetPos.z < 160 && jetPos.z > -320);

        if (inStadiumZone) {
            // Player is inside stadium perimeter
            if (minClearance < 35.0) {
                // Must dive below 25m to count as an authentic low pass
                const dangerWeight = Math.pow((35.0 / Math.max(1.0, minClearance)), 1.5);
                const pointsDelta = dangerWeight * 160 * dt;
                this.score += pointsDelta;
                this.proximityBonus += pointsDelta;

                // Proximity Multiplier (up to 10x for ultra low skimming)
                this.multiplier = Math.min(10.0, 1.0 + (30.0 / Math.max(1.5, minClearance)) * 0.45);

                // Hype accumulation
                if (minClearance < 15.0) {
                    this.hype = Math.min(100, this.hype + (20.0 / minClearance) * dt * 45);
                    this.cameraController.addShake(0.06);
                } else {
                    this.hype = Math.min(100, this.hype + dt * 15);
                }

                // Dynamic Crowd Roar
                if (this.audio && minClearance < 22.0) {
                    this.audio.crowdRoar(Math.min(1.0, (22.0 - minClearance) / 16.0));
                }

                // GPWS Cockpit Warning on near ground/roof
                if (minClearance < 6.5 && this.audio) {
                    this.audio.terrainWarning();
                }

                // Grass Skimming Hype Popup
                if (minClearance < 3.2 && !this._grassSkimTriggered) {
                    this._grassSkimTriggered = true;
                    this.ui.showBonusPopup('🌱 GRASS SKIMMER! +2,500');
                    this.score += 2500;
                    if (navigator.vibrate) navigator.vibrate([20, 20, 20]);
                }

                // Perimeter Pyrotechnics erupt
                if (minClearance < 25.0) {
                    this._triggerPyrotechnics();
                }
            }

            if (this.hype > this.peakHype) {
                this.peakHype = this.hype;
            }

            // 100% Hype event: Vuvuzela Surge!
            if (this.hype >= 100 && !this._vuvuzelaTriggered) {
                this._vuvuzelaTriggered = true;
                if (this.audio) this.audio.vuvuzela(2.5);
                if (navigator.vibrate) navigator.vibrate([40, 40, 80]);
                this.ui.showBonusPopup('🎺 VUVUZELA SURGE! +10,000 PTS 🎺');
                this.score += 10000;
            }
        } else {
            this.hype = Math.max(0, this.hype - dt * 12);
            this._grassSkimTriggered = false;
        }

        // ── 4. Mission Complete / Checkpoint ──
        if (jetPos.z <= def.exitZ) {
            this._finishLevel();
        }
    }

    _triggerPyrotechnics() {
        if (!this.currentEnv || !this.currentEnv.flarePositions) return;

        this.pyroTimer += 1;
        if (this.pyroTimer % 6 === 0) {
            this.currentEnv.flarePositions.forEach(pos => {
                const flare = new THREE.Mesh(
                    new THREE.SphereGeometry(1.4, 8, 8),
                    new THREE.MeshBasicMaterial({ color: Math.random() > 0.5 ? 0xff1744 : 0xffffff })
                );
                flare.position.copy(pos);
                this.scene.add(flare);
                this.pyroParticles.push({
                    mesh: flare,
                    vel: new THREE.Vector3((Math.random() - 0.5) * 12, 55 + Math.random() * 30, (Math.random() - 0.5) * 12),
                    life: 1.3
                });
            });
        }
    }

    _updatePyrotechnics(dt) {
        for (let i = this.pyroParticles.length - 1; i >= 0; i--) {
            const p = this.pyroParticles[i];
            p.life -= dt;
            p.mesh.position.addScaledVector(p.vel, dt);
            p.mesh.scale.multiplyScalar(1.025);

            if (p.life <= 0) {
                this.scene.remove(p.mesh);
                this.pyroParticles.splice(i, 1);
            }
        }
    }

    _triggerCrash() {
        if (this.state !== 'FLIGHT') return;
        this.state = 'RESULT';
        this.aircraft.triggerCrash();

        if (this.audio) {
            this.audio.crash();
            this.audio.stopEngine();
        }

        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 150]);
        }

        this.cameraController.addShake(1.5);
        this.ui.showResultScreen({
            status: 'CRASHED',
            closestClearance: this.closestClearance,
            peakHype: this.peakHype,
            gatesHit: this.gatesHit,
            totalGates: def.gates.length,
            proximityBonus: this.proximityBonus,
            finalScore: this.score,
            stars: 0
        });
    }

    _finishLevel() {
        if (this.state !== 'FLIGHT') return;
        this.state = 'RESULT';

        const def = this.stadiumDefs[this.currentStadiumIndex];

        // ── MUST-DIVE RULE: Check if player actually dove below 25m ──
        if (this.closestClearance > 25.0) {
            // Failed: Flew too high
            if (this.audio) this.audio.stopEngine();
            this.ui.showResultScreen({
                status: 'TOO_HIGH',
                closestClearance: this.closestClearance,
                peakHype: this.peakHype,
                gatesHit: this.gatesHit,
                totalGates: def.gates.length,
                proximityBonus: 0,
                finalScore: Math.floor(this.score * 0.2),
                stars: 0
            });
            return;
        }

        // Passed! Calculate Star Rating
        let stars = 1;
        if (this.score >= def.thresholds[2] && this.closestClearance < 6.0) stars = 3;
        else if (this.score >= def.thresholds[1] && this.closestClearance < 14.0) stars = 2;

        if (this.audio) {
            this.audio.fanfare();
            this.audio.stopEngine();
        }

        if (navigator.vibrate) {
            navigator.vibrate([50, 50, 100]);
        }

        this.saveProgress(def.id, stars, this.score);

        this.ui.showResultScreen({
            status: 'CLEARED',
            closestClearance: this.closestClearance,
            peakHype: this.peakHype,
            gatesHit: this.gatesHit,
            totalGates: def.gates.length,
            proximityBonus: this.proximityBonus,
            finalScore: this.score,
            stars: stars
        });
    }

    saveProgress(stadiumId, stars, score) {
        const progress = this.loadProgress();
        progress[`stars_${stadiumId}`] = Math.max(progress[`stars_${stadiumId}`] || 0, stars);
        progress[`score_${stadiumId}`] = Math.max(progress[`score_${stadiumId}`] || 0, score);
        
        const currentIdx = this.stadiumDefs.findIndex(s => s.id === stadiumId);
        if (currentIdx < this.stadiumDefs.length - 1) {
            const nextId = this.stadiumDefs[currentIdx + 1].id;
            progress[`unlocked_${nextId}`] = true;
        }

        localStorage.setItem('springbok_flyover_3d_progress', JSON.stringify(progress));
    }

    loadProgress() {
        try {
            return JSON.parse(localStorage.getItem('springbok_flyover_3d_progress')) || {};
        } catch (e) {
            return {};
        }
    }

    toggleAudio() {
        this.isMuted = !this.isMuted;
        if (this.audio && this.audio.masterGain) {
            this.audio.masterGain.gain.value = this.isMuted ? 0.0 : 0.25;
        }
        return this.isMuted;
    }

    _animate() {
        requestAnimationFrame(() => this._animate());

        const dt = Math.min(this.clock.getDelta(), 0.1);
        const def = this.stadiumDefs[this.currentStadiumIndex];

        this.windTime += dt;
        this.windVector.x = Math.sin(this.windTime * 0.7) * (def.windFactor * 14);
        this.windVector.y = Math.cos(this.windTime * 1.1) * (def.windFactor * 7);

        if (this.state === 'FLIGHT') {
            this._pollGamepad();

            // Merge keys, touchInput, and gamepad
            const pitchUp = this.keys.pitchUp;
            const pitchDown = this.keys.pitchDown || this.touchInput.pitchDown;
            const rollLeft = this.keys.rollLeft;
            const rollRight = this.keys.rollRight;
            const boost = this.keys.boost || this.touchInput.boost || this.gamepadBoost;
            const brake = this.keys.brake || this.touchInput.brake || this.gamepadBrake;

            // Analog overrides
            let analogPitch = this.touchInput.analogPitch || this.gamepadPitch || 0;
            let analogRoll = this.touchInput.analogRoll || this.gamepadRoll || 0;

            this.aircraft.setControls({
                pitchUp,
                pitchDown,
                rollLeft,
                rollRight,
                boost,
                brake,
                analogPitch,
                analogRoll
            });

            this.aircraft.update(dt, this.windVector);
            this._checkProximityAndCollisions(dt);

            this.ui.updateHUD({
                score: this.score,
                multiplier: this.multiplier,
                hype: this.hype,
                clearance: this.aircraft.clearance,
                altitude: this.aircraft.position.y,
                speed: this.aircraft.speed,
                gForce: this.aircraft.gForce,
                gatesHit: this.gatesHit,
                currentGate: this.currentGateIndex,
                roll: this.aircraft.roll
            });
        } else if (this.state === 'RESULT' && !this.aircraft.crashed) {
            // Autopilot victory rollout / smooth cruise down the airfield runway
            this.aircraft.targetPitch = -0.01;
            this.aircraft.targetRoll = 0.0;
            this.aircraft.targetSpeed = 150;
            this.aircraft.update(dt, { x: 0, y: 0 });
        }

        this.cameraController.update(dt, this.aircraft, new THREE.Vector3(0, 0, -100));
        this._updatePyrotechnics(dt);
        this.renderer.render(this.scene, this.camera);
    }
}

window.addEventListener('load', () => {
    window.gameInstance = new Game();
});
