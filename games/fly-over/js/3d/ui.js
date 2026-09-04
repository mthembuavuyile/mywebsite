/* ==========================================================================
   UI Controller — Glassmorphic Arcade HUD, Virtual Touch Controls, & Views
   ========================================================================== */

class UIController {
    constructor(game) {
        this.game = game;
        
        // DOM Screens
        this.screens = {
            menu: document.getElementById('menu-screen'),
            cinematic: document.getElementById('cinematic-screen'),
            hud: document.getElementById('hud-screen'),
            result: document.getElementById('result-screen')
        };

        // HUD Elements
        this.hudStadiumName = document.getElementById('hud-stadium-name');
        this.hudStadiumCity = document.getElementById('hud-stadium-city');
        this.hudHypeVal = document.getElementById('hud-hype-val');
        this.hudHypeFill = document.getElementById('hud-hype-fill');
        this.hudGateTag = document.getElementById('hud-gate-tag');
        this.hudScore = document.getElementById('hud-score');
        this.hudMultiplier = document.getElementById('hud-multiplier');
        this.hudClearanceNum = document.getElementById('hud-clearance-num');
        this.hudDangerWarning = document.getElementById('hud-danger-warning');
        this.hudAltitude = document.getElementById('hud-altitude');
        this.hudSpeed = document.getElementById('hud-speed');
        this.hudGforce = document.getElementById('hud-gforce');
        this.dangerScreenGlow = document.getElementById('danger-screen-glow');
        this.dialProgress = document.getElementById('dial-progress');
        this.bonusAnchor = document.getElementById('bonus-popup-anchor');

        // Quick Controls & Cockpit Elements
        this.btnHudCam = document.getElementById('btn-hud-cam');
        this.camLabel = document.getElementById('cam-label');
        this.btnHudRetry = document.getElementById('btn-hud-retry');
        this.btnFullscreen = document.getElementById('btn-fullscreen');
        this.cockpitCrosshair = document.getElementById('cockpit-crosshair');
        this.reticleHorizon = document.querySelector('.reticle-horizon-line');
        this.rotatePrompt = document.getElementById('rotate-device-prompt');

        // Virtual Touch Controls
        this.touchJoystickZone = document.getElementById('touch-joystick-zone');
        this.touchJoystickStick = document.getElementById('touch-joystick-stick');
        this.btnTouchBoost = document.getElementById('btn-touch-boost');
        this.btnTouchDive = document.getElementById('btn-touch-dive');

        // Cinematic Elements
        this.cinCity = document.getElementById('cin-city');
        this.cinName = document.getElementById('cin-name');
        this.cinSubtitle = document.getElementById('cin-subtitle');
        this.cinHazardText = document.getElementById('cin-hazard-text');
        this.btnStartFlight = document.getElementById('btn-start-flight');
        this.btnSkipCinematic = document.getElementById('btn-skip-cinematic');

        // Result Elements
        this.resultTitle = document.getElementById('result-title');
        this.resultVerdict = document.getElementById('result-verdict');
        this.resultStars = document.getElementById('result-stars');
        this.resClearance = document.getElementById('res-clearance');
        this.resGates = document.getElementById('res-gates');
        this.resHype = document.getElementById('res-hype');
        this.resScore = document.getElementById('res-score');
        this.btnResultMenu = document.getElementById('btn-result-menu');
        this.btnResultRetry = document.getElementById('btn-result-retry');
        this.btnResultNext = document.getElementById('btn-result-next');

        this.btnAudioToggle = document.getElementById('btn-audio-toggle');

        this._setupListeners();
        this._setupTouchControls();
        this.renderStadiumCards();
    }

    _setupListeners() {
        this.btnStartFlight.addEventListener('click', () => {
            this.game.startFlight();
        });

        this.btnSkipCinematic.addEventListener('click', () => {
            this.game.startFlight();
        });

        this.btnResultMenu.addEventListener('click', () => {
            this.showScreen('menu');
            this.game.enterMenu();
        });

        this.btnResultRetry.addEventListener('click', () => {
            this.game.launchLevel(this.game.currentStadiumIndex);
        });

        this.btnResultNext.addEventListener('click', () => {
            const nextIdx = (this.game.currentStadiumIndex + 1) % this.game.stadiumDefs.length;
            this.game.launchLevel(nextIdx);
        });

        this.btnAudioToggle.addEventListener('click', () => {
            const muted = this.game.toggleAudio();
            this.btnAudioToggle.textContent = muted ? '🔇 MUTED' : '🔊 AUDIO';
        });

        // Camera Angle Toggle
        if (this.btnHudCam) {
            this.btnHudCam.addEventListener('click', () => {
                const newView = this.game.toggleCamera();
                this.updateCameraDisplay(newView);
            });
        }

        // Quick In-Flight Retry
        if (this.btnHudRetry) {
            this.btnHudRetry.addEventListener('click', () => {
                this.game.launchLevel(this.game.currentStadiumIndex);
                this.game.startFlight();
            });
        }

        // Fullscreen Toggle
        if (this.btnFullscreen) {
            this.btnFullscreen.addEventListener('click', () => {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(() => {});
                } else {
                    document.exitFullscreen().catch(() => {});
                }
            });
        }

        // Dismiss Rotate Device Prompt on tap
        if (this.rotatePrompt) {
            this.rotatePrompt.addEventListener('click', () => {
                this.rotatePrompt.classList.add('dismissed');
            });
        }
    }

    _setupTouchControls() {
        if (!this.touchJoystickZone) return;

        let touchId = null;
        let originX = 0;
        let originY = 0;
        const maxRadius = 46;

        const onTouchStart = (e) => {
            if (touchId !== null) return;
            const touch = e.changedTouches ? e.changedTouches[0] : e;
            touchId = touch.identifier !== undefined ? touch.identifier : 'mouse';

            const rect = this.touchJoystickZone.getBoundingClientRect();
            originX = rect.left + rect.width / 2;
            originY = rect.top + rect.height / 2;

            updateStick(touch.clientX, touch.clientY);
        };

        const onTouchMove = (e) => {
            if (touchId === null) return;
            let touch = null;
            if (e.changedTouches) {
                for (let i = 0; i < e.changedTouches.length; i++) {
                    if (e.changedTouches[i].identifier === touchId) {
                        touch = e.changedTouches[i];
                        break;
                    }
                }
            } else if (touchId === 'mouse') {
                touch = e;
            }
            if (!touch) return;
            updateStick(touch.clientX, touch.clientY);
        };

        const onTouchEnd = (e) => {
            if (touchId === null) return;
            let ended = false;
            if (e.changedTouches) {
                for (let i = 0; i < e.changedTouches.length; i++) {
                    if (e.changedTouches[i].identifier === touchId) {
                        ended = true;
                        break;
                    }
                }
            } else if (touchId === 'mouse') {
                ended = true;
            }

            if (ended) {
                touchId = null;
                if (this.touchJoystickStick) {
                    this.touchJoystickStick.style.transform = 'translate(0px, 0px)';
                }
                this.game.touchInput.analogPitch = 0;
                this.game.touchInput.analogRoll = 0;
            }
        };

        const updateStick = (clientX, clientY) => {
            const dx = clientX - originX;
            const dy = clientY - originY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const clampedDist = Math.min(distance, maxRadius);
            const angle = Math.atan2(dy, dx);

            const stickX = Math.cos(angle) * clampedDist;
            const stickY = Math.sin(angle) * clampedDist;

            if (this.touchJoystickStick) {
                this.touchJoystickStick.style.transform = `translate(${stickX}px, ${stickY}px)`;
            }

            // Normalized inputs: -1.0 to +1.0
            // Dragging down (dy > 0) is pulling up/climbing (+1.0 analogPitch)
            // Dragging up (dy < 0) is pushing stick forward/diving (-1.0 analogPitch)
            this.game.touchInput.analogRoll = stickX / maxRadius;
            this.game.touchInput.analogPitch = stickY / maxRadius;
        };

        this.touchJoystickZone.addEventListener('touchstart', onTouchStart, { passive: false });
        window.addEventListener('touchmove', onTouchMove, { passive: false });
        window.addEventListener('touchend', onTouchEnd);
        window.addEventListener('touchcancel', onTouchEnd);

        // Touch Boost Button
        if (this.btnTouchBoost) {
            const startBoost = (e) => {
                e.preventDefault();
                this.game.touchInput.boost = true;
                if (navigator.vibrate) navigator.vibrate(25);
                if (this.game.audio) this.game.audio.boostEngage();
            };
            const stopBoost = (e) => {
                e.preventDefault();
                this.game.touchInput.boost = false;
            };
            this.btnTouchBoost.addEventListener('touchstart', startBoost, { passive: false });
            this.btnTouchBoost.addEventListener('touchend', stopBoost);
            this.btnTouchBoost.addEventListener('touchcancel', stopBoost);
        }

        // Touch Dive Button (Bowl Plunge & Flaps)
        if (this.btnTouchDive) {
            const startDive = (e) => {
                e.preventDefault();
                this.game.touchInput.brake = true;
                this.game.touchInput.pitchDown = true;
                if (navigator.vibrate) navigator.vibrate(20);
                if (this.game.audio) this.game.audio.airbrake();
            };
            const stopDive = (e) => {
                e.preventDefault();
                this.game.touchInput.brake = false;
                this.game.touchInput.pitchDown = false;
            };
            this.btnTouchDive.addEventListener('touchstart', startDive, { passive: false });
            this.btnTouchDive.addEventListener('touchend', stopDive);
            this.btnTouchDive.addEventListener('touchcancel', stopDive);
        }
    }

    updateCameraDisplay(viewName) {
        if (this.camLabel) {
            this.camLabel.textContent = viewName;
        }
        if (this.cockpitCrosshair) {
            if (viewName === 'COCKPIT') {
                this.cockpitCrosshair.classList.remove('hidden');
            } else {
                this.cockpitCrosshair.classList.add('hidden');
            }
        }
        this.showBonusPopup(`📷 CAM: ${viewName}`, window.innerWidth / 2, 80);
    }

    showScreen(screenName) {
        Object.keys(this.screens).forEach(key => {
            if (key === screenName) {
                this.screens[key].classList.remove('hidden');
                this.screens[key].classList.add('active');
            } else {
                this.screens[key].classList.add('hidden');
                this.screens[key].classList.remove('active');
            }
        });
    }

    renderStadiumCards() {
        const grid = document.getElementById('stadium-grid');
        grid.innerHTML = '';

        const progress = this.game.loadProgress();

        this.game.stadiumDefs.forEach((def, index) => {
            const isUnlocked = index === 0 || progress[`unlocked_${def.id}`];
            const stars = progress[`stars_${def.id}`] || 0;

            const card = document.createElement('div');
            card.className = `stadium-card ${isUnlocked ? '' : 'locked'}`;

            let starString = '';
            for (let s = 0; s < 3; s++) {
                starString += s < stars ? '★' : '☆';
            }

            card.innerHTML = `
                <div class="card-top">
                    <span class="card-num">0${index + 1}</span>
                    <span class="card-stars">${isUnlocked ? starString : ''}</span>
                </div>
                <div>
                    <h3 class="card-name">${def.name}</h3>
                    <p class="card-city">${def.city}</p>
                </div>
                <div class="card-hazard">${def.hazardText}</div>
                ${isUnlocked ? `
                <div class="card-actions-row">
                    <button class="btn-card-inspect" data-venue="${def.id}" title="Free Cam Orbit Inspection">🔍 3D Inspect</button>
                    <span class="btn-card-fly">FLY PASS ▶</span>
                </div>` : '<div class="card-lock-badge">🔒</div>'}
            `;

            if (isUnlocked) {
                card.addEventListener('click', (e) => {
                    const inspectBtn = e.target.closest('.btn-card-inspect');
                    if (inspectBtn) {
                        e.stopPropagation();
                        window.location.href = `stadiumdemo.html?venue=${def.id}`;
                        return;
                    }
                    if (this.game.audio) this.game.audio.uiClick();
                    this.game.launchLevel(index);
                });
            }

            grid.appendChild(card);
        });
    }

    setupCinematic(stadiumDef) {
        this.cinCity.textContent = stadiumDef.city;
        this.cinName.textContent = stadiumDef.name;
        this.cinSubtitle.textContent = stadiumDef.subtitle;
        this.cinHazardText.textContent = stadiumDef.hazardText;
        this.showScreen('cinematic');
    }

    setupHUD(stadiumDef) {
        this.hudStadiumName.textContent = stadiumDef.name;
        this.hudStadiumCity.textContent = stadiumDef.city;
        this.hudGateTag.textContent = 'GATE 1/6 • HIGH APPROACH';
        this.showScreen('hud');
    }

    updateHUD(stats) {
        // Score & Multiplier
        this.hudScore.textContent = Math.floor(stats.score).toLocaleString();
        this.hudMultiplier.textContent = `${stats.multiplier.toFixed(1)}x MULTIPLIER`;

        // Hype Meter
        this.hudHypeVal.textContent = `${Math.floor(stats.hype)}%`;
        this.hudHypeFill.style.width = `${Math.min(100, stats.hype)}%`;

        // Gate Tag
        const currentGate = stats.currentGate || 0;
        const gateDef = this.game.stadiumDefs[this.game.currentStadiumIndex].gates[currentGate] || { label: 'FINAL CLIMB' };
        this.hudGateTag.textContent = `GATE ${Math.min(6, currentGate + 1)}/6 • ${gateDef.label}`;

        // Cockpit Artificial Horizon Tilt
        if (this.reticleHorizon && stats.roll !== undefined) {
            this.reticleHorizon.style.transform = `rotate(${-stats.roll * (180 / Math.PI)}deg)`;
        }

        // Clearance Dial & Danger Warning
        if (stats.clearance < 90) {
            const clrVal = stats.clearance.toFixed(1);
            this.hudClearanceNum.textContent = clrVal;
            
            const progressRatio = Math.max(0, Math.min(1, stats.clearance / 45.0));
            const offset = 314 * progressRatio;
            this.dialProgress.style.strokeDashoffset = offset;

            if (stats.clearance < 6.0) {
                this.hudClearanceNum.style.color = '#ff1744';
                this.dialProgress.style.stroke = '#ff1744';
                this.hudDangerWarning.classList.add('active');
                this.dangerScreenGlow.classList.add('active');
            } else if (stats.clearance < 20.0) {
                this.hudClearanceNum.style.color = '#ffd600';
                this.dialProgress.style.stroke = '#ffd600';
                this.hudDangerWarning.classList.remove('active');
                this.dangerScreenGlow.classList.remove('active');
            } else {
                this.hudClearanceNum.style.color = '#00e676';
                this.dialProgress.style.stroke = '#00e676';
                this.hudDangerWarning.classList.remove('active');
                this.dangerScreenGlow.classList.remove('active');
            }
        } else {
            this.hudClearanceNum.textContent = '--';
            this.hudDangerWarning.classList.remove('active');
            this.dangerScreenGlow.classList.remove('active');
        }

        // Instruments
        this.hudAltitude.innerHTML = `${Math.floor(stats.altitude)}<small>m</small>`;
        this.hudSpeed.innerHTML = `${Math.floor(stats.speed)}<small>kts</small>`;
        this.hudGforce.innerHTML = `${stats.gForce.toFixed(1)}<small>G</small>`;
    }

    showBonusPopup(text, x = window.innerWidth / 2, y = window.innerHeight / 2 - 40) {
        const popup = document.createElement('div');
        popup.className = 'bonus-float-text';
        popup.textContent = text;
        popup.style.left = `${x}px`;
        popup.style.top = `${y}px`;
        
        this.bonusAnchor.appendChild(popup);
        setTimeout(() => popup.remove(), 1200);
    }

    showResultScreen(result) {
        this.showScreen('result');

        if (result.status === 'CRASHED') {
            this.resultTitle.textContent = 'CRASHED! EISH!';
            this.resultTitle.className = 'result-title crashed';
            this.resultVerdict.textContent = '"You clipped the stadium architecture! Pull up harder next time."';
            this.btnResultNext.style.display = 'none';
        } else if (result.status === 'TOO_HIGH') {
            this.resultTitle.textContent = 'MISSION FAILED: TOO HIGH!';
            this.resultTitle.className = 'result-title too-high';
            this.resultVerdict.textContent = '"The crowd was bored! You must plunge below 25m into the stadium bowl to qualify!"';
            this.btnResultNext.style.display = 'none';
        } else {
            this.resultTitle.textContent = 'STADIUM CLEARED!';
            this.resultTitle.className = 'result-title';
            
            if (result.closestClearance < 3.5) {
                this.resultVerdict.textContent = '"LOW IS VERY, VERY GOOD! LEGENDARY FLYOVER!"';
            } else if (result.closestClearance < 8.0) {
                this.resultVerdict.textContent = '"INSANELY CLOSE PASS! THE STADIUM ROARED!"';
            } else {
                this.resultVerdict.textContent = '"SOLID FLYOVER! TRY DIVING LOWER FOR 3 STARS!"';
            }
            this.btnResultNext.style.display = 'inline-block';
        }

        // Stars
        const starIcons = this.resultStars.querySelectorAll('.star-icon');
        starIcons.forEach((icon, idx) => {
            if (idx < result.stars && result.status === 'CLEARED') {
                icon.classList.add('filled');
            } else {
                icon.classList.remove('filled');
            }
        });

        // Stats
        this.resClearance.textContent = `${result.closestClearance.toFixed(1)} m`;
        this.resGates.textContent = `${result.gatesHit} / 6`;
        this.resHype.textContent = `${Math.floor(result.peakHype)}% ${result.peakHype >= 100 ? '(VUVUZELA SURGE)' : ''}`;
        this.resScore.textContent = Math.floor(result.finalScore).toLocaleString();

        this.renderStadiumCards();
    }
}

window.UIController = UIController;
