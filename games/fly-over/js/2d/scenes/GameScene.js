/* ==========================================================================
   GameScene — Static Left-to-Right 16-Bit Stadium Flyover
   Displays authentic 16-bit pixel-art stadium backdrops.
   The player controls the Springbok jet flying from left to right across
   the stadium bowl, navigating stunt gates, proximity low passes,
   stadium architecture, crowd hype, and victory flyout.
   ========================================================================== */

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
        this.levelIndex = data.levelIndex || 0;
    }

    create() {
        const level = window.LEVELS[this.levelIndex];
        const W = this.cameras.main.width;
        const H = this.cameras.main.height;
        const audio = window._audioManager;
        const id = level.id;

        this.cameras.main.fadeIn(500, 0, 0, 0);

        // ── 1. Core State ──
        this.gameState = 'FLYING'; // 'FLYING' | 'VICTORY' | 'CRASHED'
        this.score = 0;
        this.hype = 0;
        this.bestClearance = 99;
        this.gatesHit = 0;
        this.totalGates = 5;
        this.archThreaded = false;
        this.nearMissAwarded = false;
        this.vuvuzelaTriggered = false;
        this.lastWarningTime = 0;
        this.isThrusting = false;

        // Ground / Pitch level in 1280x720 coordinates
        this.groundY = 560;

        // ── 2. Stadium Art Backdrop ──
        this.bg = this.add.image(W / 2, H / 2, `stadium_art_${id}`)
            .setDisplaySize(W, H)
            .setDepth(0);

        // ── 3. Ambient Atmospheric Overlays ──
        // Drifting sky clouds
        this.clouds = [];
        for (let i = 0; i < 4; i++) {
            const cloud = this.add.image(
                Phaser.Math.Between(0, W),
                Phaser.Math.Between(20, 120),
                `cloud_${i % 3}`
            ).setScale(Phaser.Math.FloatBetween(2.0, 3.5)).setAlpha(0.65).setDepth(2);
            this.clouds.push(cloud);
        }

        // Live crowd camera flashes pool
        this.flashGroup = this.add.group();

        // ── 4. Stunt Gates (Placed across the flight path) ──
        this.stuntGates = [];
        const gateConfigs = [
            { x: 240, y: 270, key: 'gate_normal', pts: 1000, label: 'APPROACH' },
            { x: 440, y: 390, key: 'gate_dive',   pts: 1500, label: 'DIVE' },
            { x: 640, y: 490, key: 'gate_apex',   pts: 2500, label: 'PITCH SKIM' },
            { x: 840, y: 390, key: 'gate_dive',   pts: 1500, label: 'CLIMB' },
            { x: 1040, y: 270, key: 'gate_normal', pts: 1000, label: 'EXIT' }
        ];

        gateConfigs.forEach((gc, idx) => {
            const gate = this.add.image(gc.x, gc.y, gc.key)
                .setScale(1.1)
                .setDepth(5);

            // Subtle pulsing animation
            this.tweens.add({
                targets: gate,
                scaleX: 1.18,
                scaleY: 1.18,
                alpha: 0.85,
                duration: 600 + idx * 80,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            this.stuntGates.push({
                sprite: gate,
                x: gc.x,
                y: gc.y,
                pts: gc.pts,
                label: gc.label,
                cleared: false
            });
        });

        // ── 5. Player Springbok Jet ──
        this.jet = this.add.image(60, 260, 'jet')
            .setScale(2.4)
            .setDepth(12);

        this.jetVelocityX = 58; // Smooth left-to-right velocity (~19 seconds flight)
        this.jetVelocityY = 0;
        this.jetAngle = 0;

        // ── 6. Jet Particle Systems ──
        // Twin Springbok Green & Gold Aerobatic Smoke Trails
        this.smokeGreen = this.add.particles(0, 0, 'smoke_0', {
            follow: this.jet,
            followOffset: { x: -70, y: -8 },
            speed: { min: 10, max: 25 },
            angle: { min: 175, max: 185 },
            scale: { start: 1.6, end: 0 },
            alpha: { start: 0.7, end: 0 },
            tint: 0x00E676, // Springbok Green
            lifespan: 700,
            frequency: 45,
            blendMode: 'ADD'
        }).setDepth(10);

        this.smokeGold = this.add.particles(0, 0, 'smoke_1', {
            follow: this.jet,
            followOffset: { x: -70, y: 8 },
            speed: { min: 10, max: 25 },
            angle: { min: 175, max: 185 },
            scale: { start: 1.6, end: 0 },
            alpha: { start: 0.7, end: 0 },
            tint: 0xFFD600, // Springbok Gold
            lifespan: 700,
            frequency: 45,
            blendMode: 'ADD'
        }).setDepth(10);

        // Afterburner Engine Exhaust
        this.exhaustEmitter = this.add.particles(0, 0, 'exhaust', {
            follow: this.jet,
            followOffset: { x: -80, y: 0 },
            speed: { min: 30, max: 70 },
            angle: { min: 170, max: 190 },
            scale: { start: 2.0, end: 0 },
            alpha: { start: 0.9, end: 0 },
            lifespan: 250,
            frequency: 60,
            blendMode: 'ADD'
        }).setDepth(11);

        // ── 7. Input Controls ──
        this.input.on('pointerdown', () => { this.isThrusting = true; });
        this.input.on('pointerup', () => { this.isThrusting = false; });

        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);

        // ── 8. Audio Initialization ──
        if (audio) {
            audio.startEngine();
            audio.startWind(0.3);
        }

        // ── 9. Visual HUD Overlays ──
        this._buildHUD(level);

        // ── 10. Approach Intro Text ──
        this.introBanner = this.add.text(W / 2, 90, `APPROACHING ${level.name}`, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '14px',
            color: '#FFD600',
            shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 3, fill: true },
            backgroundColor: '#00000088',
            padding: { x: 12, y: 6 }
        }).setOrigin(0.5).setDepth(20);

        this.tweens.add({
            targets: this.introBanner,
            alpha: 0,
            duration: 1000,
            delay: 2000,
            onComplete: () => this.introBanner.destroy()
        });

        // ── 11. Danger Warning Overlay ──
        this.dangerOverlay = this.add.graphics().setDepth(30).setAlpha(0);
        this.warningText = this.add.text(W / 2, H / 2 - 50, '⚠ TERRAIN PULL UP ⚠', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '18px',
            color: '#FF1744',
            shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 4, fill: true },
            backgroundColor: '#000000cc',
            padding: { x: 16, y: 8 }
        }).setOrigin(0.5).setDepth(30).setAlpha(0);
    }

    update(time, delta) {
        if (this.gameState === 'CRASHED') return;

        const dt = delta / 1000;
        const W = this.cameras.main.width;
        const H = this.cameras.main.height;
        const audio = window._audioManager;
        const level = window.LEVELS[this.levelIndex];

        // ── Drifting Clouds ──
        this.clouds.forEach(cloud => {
            cloud.x -= 20 * dt;
            if (cloud.x < -100) {
                cloud.x = W + 100;
                cloud.y = Phaser.Math.Between(20, 120);
            }
        });

        // ── Crowd Flashbulbs (Packed Stadium Atmosphere) ──
        if (Math.random() < 0.35) {
            this._spawnCrowdFlash();
        }

        // ════════════════════════════════════════
        //  VICTORY STATE (Pulling up into clouds)
        // ════════════════════════════════════════
        if (this.gameState === 'VICTORY') {
            this.jet.x += 180 * dt;
            this.jet.y -= 260 * dt;
            this.jet.angle = Phaser.Math.Linear(this.jet.angle, -35, 0.08);
            return;
        }

        // ════════════════════════════════════════
        //  ACTIVE FLYING STATE
        // ════════════════════════════════════════
        const thrust = this.isThrusting ||
                       this.spaceKey.isDown ||
                       this.upKey.isDown ||
                       this.wKey.isDown ||
                       window._isRetroThrusting;

        // ── Aerodynamic Flight Physics (Glide & Lift) ──
        if (thrust) {
            // Apply upward lift
            this.jetVelocityY = Math.max(this.jetVelocityY - 580 * dt, -270);
            // Pitch up
            this.jet.angle = Phaser.Math.Linear(this.jet.angle, -15, 0.12);
            this.jet.setTexture('jet_thrust');
            this.exhaustEmitter.setFrequency(25);
            if (audio) audio.setEngineThrust(0.9);
        } else {
            // Natural aerodynamic glide descent
            this.jetVelocityY = Math.min(this.jetVelocityY + 280 * dt, 210);
            this.jetVelocityY *= 0.99; // Aerodynamic drag
            // Gentle nose-down angle
            this.jet.angle = Phaser.Math.Linear(this.jet.angle, 7, 0.06);
            this.jet.setTexture('jet');
            this.exhaustEmitter.setFrequency(90);
            if (audio) audio.setEngineThrust(0.3);
        }

        // Advance Jet Position
        this.jet.x += this.jetVelocityX * dt;
        this.jet.y += this.jetVelocityY * dt;

        // Subtle camera track to keep jet centered with dynamic feeling
        const targetCamX = (this.jet.x - W / 2) * 0.04;
        this.cameras.main.scrollX = Phaser.Math.Linear(this.cameras.main.scrollX, targetCamX, 0.05);

        // Ceiling Clamp
        if (this.jet.y < 45) {
            this.jet.y = 45;
            this.jetVelocityY = Math.max(0, this.jetVelocityY);
        }

        // ── Clearance & Proximity Calculation ──
        const effectiveGround = this.groundY;
        const clearanceM = Math.max(0, (effectiveGround - (this.jet.y + 20)) * 0.12);
        this.bestClearance = Math.min(this.bestClearance, clearanceM);

        this.clearanceVal.setText(clearanceM.toFixed(1) + ' M');
        if (clearanceM < 6) {
            this.clearanceVal.setColor('#FF1744');
        } else if (clearanceM < 16) {
            this.clearanceVal.setColor('#FFD600');
        } else {
            this.clearanceVal.setColor('#00E676');
        }

        // ── Proximity Scoring & Hype ──
        if (clearanceM < 22) {
            const proximityScore = Math.floor((22 - clearanceM) * 12 * dt);
            this.score += proximityScore;
            this.scoreVal.setText(this.score.toLocaleString());
            this.hype = Math.min(100, this.hype + (20 / (clearanceM + 1)) * dt * 15);
            this._updateHypeBar();
        } else {
            this.hype = Math.max(0, this.hype - dt * 8);
            this._updateHypeBar();
        }

        // ── Low Clearance Warning (< 6m) ──
        if (clearanceM < 6) {
            this.warningText.setAlpha(1);
            if (!this.warningActive) {
                this.warningActive = true;
                this._flashDanger();
            }
            if (audio && time - this.lastWarningTime > 800) {
                audio.terrainWarning();
                this.lastWarningTime = time;
            }
        } else {
            if (this.warningActive) {
                this.warningText.setAlpha(0);
                this.dangerOverlay.setAlpha(0);
                this.warningActive = false;
            }
        }

        // ── Near Miss Bonus (< 3.5m) ──
        if (clearanceM < 3.5 && !this.nearMissAwarded) {
            this.nearMissAwarded = true;
            if (audio) audio.nearMiss();
            this._floatingText(this.jet.x, this.jet.y - 40, '⚡ NEAR MISS! +3,000', '#FF1744');
            this.score += 3000;
            this.scoreVal.setText(this.score.toLocaleString());
            this.cameras.main.shake(200, 0.006);
        }

        // ── Check Stunt Gates ──
        this.stuntGates.forEach(g => {
            if (!g.cleared) {
                const dist = Phaser.Math.Distance.Between(this.jet.x, this.jet.y, g.x, g.y);
                if (dist < 46) {
                    g.cleared = true;
                    this.gatesHit++;
                    this.gatesVal.setText(`${this.gatesHit}/${this.totalGates}`);
                    this.score += g.pts;
                    this.scoreVal.setText(this.score.toLocaleString());
                    this.hype = Math.min(100, this.hype + 25);
                    this._updateHypeBar();

                    if (audio) audio.gateSuccess();

                    // Gate celebration
                    this.tweens.add({
                        targets: g.sprite,
                        scaleX: 2.2,
                        scaleY: 2.2,
                        alpha: 0,
                        duration: 350,
                        ease: 'Power2'
                    });

                    this._floatingText(g.x, g.y - 30, `+${g.pts} ${g.label}!`, '#00E676');
                }
            }
        });

        // ── Moses Mabhida Arch Feature ──
        if (level.id === 'moses' && !this.archThreaded) {
            if (this.jet.x > 500 && this.jet.x < 850 && this.jet.y > 170 && this.jet.y < 460) {
                this.archThreaded = true;
                this.score += 5000;
                this.scoreVal.setText(this.score.toLocaleString());
                if (audio) {
                    audio.fanfare();
                    audio.crowdRoar(0.9);
                }
                this._floatingText(this.jet.x, this.jet.y - 50, '⭐ ARCH THREADED! +5,000 ⭐', '#FFD600');
            }
        }

        // ── 100% Hype Effects ──
        if (this.hype >= 100 && !this.vuvuzelaTriggered) {
            this.vuvuzelaTriggered = true;
            if (audio) {
                audio.vuvuzela(2.5);
                audio.crowdRoar(1.0);
            }
            this._floatingText(W / 2, H * 0.35, '🎺 CROWD GOES WILD! 2x BONUS 🎺', '#FFD600');
            this.score += 4000;
            this.scoreVal.setText(this.score.toLocaleString());
        }

        // ── Terrain / Pitch Collision ──
        if (this.jet.y >= this.groundY - 10) {
            this._crash();
            return;
        }

        // ── Left & Right Stand / Floodlight Collisions ──
        if (this.jet.x < 110 && this.jet.y > 330) {
            this._crash();
            return;
        }
        if (this.jet.x > 1170 && this.jet.y > 330) {
            this._crash();
            return;
        }

        // ── Victory Check: Cleared the Stadium! ──
        if (this.jet.x >= 1180) {
            this._victory();
        }
    }

    // ════════════════════════════════════════
    //  VICTORY SEQUENCE
    // ════════════════════════════════════════
    _victory() {
        if (this.gameState !== 'FLYING') return;
        this.gameState = 'VICTORY';

        const audio = window._audioManager;
        const W = this.cameras.main.width;
        const H = this.cameras.main.height;

        if (audio) {
            audio.fanfare();
            audio.crowdRoar(1.0);
        }

        // Victory banner
        const banner = this.add.text(W / 2, H * 0.38, 'STADIUM CLEARED!', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '28px',
            color: '#00E676',
            shadow: { offsetX: 3, offsetY: 3, color: '#000000', blur: 6, fill: true },
            backgroundColor: '#000000cc',
            padding: { x: 24, y: 14 }
        }).setOrigin(0.5).setDepth(40);

        this.tweens.add({
            targets: banner,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 300,
            yoyo: true,
            repeat: 2
        });

        // Firework particle bursts
        for (let i = 0; i < 6; i++) {
            this.time.delayedCall(i * 300, () => {
                const fx = Phaser.Math.Between(200, W - 200);
                const fy = Phaser.Math.Between(100, 300);
                this._spawnFirework(fx, fy);
            });
        }

        // Bonus for cleared gates
        const gateBonus = this.gatesHit * 1000;
        this.score += gateBonus;

        // Transition to Results Scene after celebration
        this.time.delayedCall(2500, () => {
            if (audio) {
                audio.stopEngine();
                audio.stopWind();
            }
            this.cameras.main.fadeOut(600, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('ResultScene', {
                    levelIndex: this.levelIndex,
                    score: this.score,
                    bestClearance: this.bestClearance,
                    hypeMax: this.hype,
                    crashed: false,
                    passed: true,
                    gatesHit: this.gatesHit
                });
            });
        });
    }

    // ════════════════════════════════════════
    //  CRASH & INSTANT RETRY
    // ════════════════════════════════════════
    _crash() {
        if (this.gameState === 'CRASHED') return;
        this.gameState = 'CRASHED';

        const audio = window._audioManager;
        const W = this.cameras.main.width;
        const H = this.cameras.main.height;

        if (audio) {
            audio.crash();
            audio.stopEngine();
            audio.stopWind();
        }

        // Screen Shake & Red Flash
        this.cameras.main.shake(450, 0.025);
        this.cameras.main.flash(250, 255, 40, 40);

        // Explosion Particles
        this.add.particles(this.jet.x, this.jet.y, 'debris', {
            speed: { min: 80, max: 280 },
            angle: { min: 0, max: 360 },
            scale: { start: 3, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 1200,
            quantity: 35,
            maxParticles: 35
        }).setDepth(20);

        this.add.particles(this.jet.x, this.jet.y, 'spark', {
            speed: { min: 120, max: 350 },
            angle: { min: 0, max: 360 },
            scale: { start: 2.5, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 700,
            quantity: 25,
            blendMode: 'ADD'
        }).setDepth(21);

        // Hide Jet
        this.jet.setAlpha(0);
        this.exhaustEmitter.stop();
        this.smokeGreen.stop();
        this.smokeGold.stop();

        // "EISH!" Retro Arcade Banner
        this.add.text(W / 2, H / 2 - 30, 'EISH!', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '52px',
            color: '#FF1744',
            shadow: { offsetX: 3, offsetY: 3, color: '#000000', blur: 8, fill: true }
        }).setOrigin(0.5).setDepth(40);

        const retryPrompt = this.add.text(W / 2, H / 2 + 40, 'PRESS SPACE OR TAP TO RETRY', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '12px',
            color: '#FFD600',
            backgroundColor: '#000000bb',
            padding: { x: 16, y: 8 }
        }).setOrigin(0.5).setDepth(40);

        this.tweens.add({
            targets: retryPrompt,
            alpha: 0.3,
            duration: 400,
            yoyo: true,
            repeat: -1
        });

        // Instant Restart on key/tap
        const restart = () => {
            this.scene.restart({ levelIndex: this.levelIndex });
        };

        this.time.delayedCall(400, () => {
            this.input.once('pointerdown', restart);
            this.input.keyboard.once('keydown-SPACE', restart);
            this.input.keyboard.once('keydown-ENTER', restart);
        });

        // Auto transition to result after 2.5s if no press
        this.time.delayedCall(2800, () => {
            if (this.gameState === 'CRASHED') {
                this.scene.start('ResultScene', {
                    levelIndex: this.levelIndex,
                    score: this.score,
                    bestClearance: this.bestClearance,
                    hypeMax: this.hype,
                    crashed: true,
                    passed: false,
                    gatesHit: this.gatesHit
                });
            }
        });
    }

    // ════════════════════════════════════════
    //  HUD BUILDER
    // ════════════════════════════════════════
    _buildHUD(level) {
        const W = this.cameras.main.width;

        // Top HUD Bar Background
        const hudBg = this.add.graphics().setDepth(20).setScrollFactor(0);
        hudBg.fillStyle(0x000000, 0.65);
        hudBg.fillRect(0, 0, W, 64);
        hudBg.lineStyle(2, 0x00E676, 0.5);
        hudBg.lineBetween(0, 64, W, 64);

        // Stadium Title
        this.add.text(24, 14, level.name, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '13px',
            color: '#00E676'
        }).setDepth(21).setScrollFactor(0);

        this.add.text(24, 38, `${level.city}  •  FLYOVER`, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '8px',
            color: '#90A4AE'
        }).setDepth(21).setScrollFactor(0);

        // Clearance Center HUD
        this.add.text(W / 2, 12, 'ALTITUDE / CLEARANCE', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '7px',
            color: '#90A4AE'
        }).setOrigin(0.5, 0).setDepth(21).setScrollFactor(0);

        this.clearanceVal = this.add.text(W / 2, 28, '-- M', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '18px',
            color: '#00E676',
            shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 2, fill: true }
        }).setOrigin(0.5, 0).setDepth(21).setScrollFactor(0);

        // Score & Gates (Top Right)
        this.add.text(W - 24, 12, 'SCORE', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '7px',
            color: '#90A4AE'
        }).setOrigin(1, 0).setDepth(21).setScrollFactor(0);

        this.scoreVal = this.add.text(W - 24, 25, '0', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '16px',
            color: '#FFD600'
        }).setOrigin(1, 0).setDepth(21).setScrollFactor(0);

        this.gatesVal = this.add.text(W - 24, 46, `GATES: 0/${this.totalGates}`, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '8px',
            color: '#00E5FF'
        }).setOrigin(1, 0).setDepth(21).setScrollFactor(0);

        // Hype Meter (Bottom Center)
        const hypeW = 280;
        const hypeH = 10;
        const hypeX = W / 2 - hypeW / 2;
        const hypeY = 645;

        this.hypeBg = this.add.rectangle(W / 2, hypeY + hypeH / 2, hypeW + 4, hypeH + 4, 0x1A1A2E, 0.8)
            .setDepth(20).setScrollFactor(0);
        this.hypeBg.setStrokeStyle(1, 0x00E676, 0.7);

        this.hypeFill = this.add.rectangle(hypeX + 2, hypeY + 2, 0, hypeH, 0x00E676)
            .setOrigin(0, 0).setDepth(21).setScrollFactor(0);

        this.add.text(W / 2, hypeY - 10, 'CROWD HYPE METER', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '7px',
            color: '#FFD600'
        }).setOrigin(0.5, 0).setDepth(21).setScrollFactor(0);
    }

    _updateHypeBar() {
        const hypeW = 280;
        const fillW = (this.hype / 100) * hypeW;
        this.hypeFill.width = fillW;

        if (this.hype >= 80) {
            this.hypeFill.setFillStyle(0xFFD600);
        } else if (this.hype >= 50) {
            this.hypeFill.setFillStyle(0xFF9800);
        } else {
            this.hypeFill.setFillStyle(0x00E676);
        }
    }

    _flashDanger() {
        const W = this.cameras.main.width;
        const H = this.cameras.main.height;
        this.dangerOverlay.clear();
        this.dangerOverlay.fillStyle(0xFF0000, 0.2);
        this.dangerOverlay.fillRect(0, 0, W, H);
        this.tweens.add({
            targets: this.dangerOverlay,
            alpha: { from: 0.8, to: 0 },
            duration: 250,
            yoyo: true,
            repeat: 2
        });
    }

    _floatingText(x, y, msg, color) {
        const txt = this.add.text(x, y, msg, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '11px',
            color: color,
            shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 2, fill: true },
            backgroundColor: '#00000088',
            padding: { x: 8, y: 4 }
        }).setOrigin(0.5).setDepth(35);

        this.tweens.add({
            targets: txt,
            y: y - 45,
            alpha: 0,
            duration: 900,
            ease: 'Power2',
            onComplete: () => txt.destroy()
        });
    }

    _spawnCrowdFlash() {
        // Flash in the stadium stands
        const W = this.cameras.main.width;
        const fx = Phaser.Math.Between(80, W - 80);
        const fy = Phaser.Math.Between(420, 580);
        const flash = this.add.rectangle(fx, fy, 4, 3, 0xFFFFFF).setDepth(4);
        this.tweens.add({
            targets: flash,
            alpha: 0,
            scaleX: 2,
            scaleY: 2,
            duration: 120,
            onComplete: () => flash.destroy()
        });
    }

    _spawnFirework(x, y) {
        const colors = [0x00E676, 0xFFD600, 0xFF1744, 0x00E5FF, 0xFFFFFF];
        const color = Phaser.Utils.Array.GetRandom(colors);
        for (let i = 0; i < 20; i++) {
            const spark = this.add.rectangle(x, y, 4, 4, color).setDepth(30);
            const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
            const speed = Phaser.Math.Between(40, 140);
            this.tweens.add({
                targets: spark,
                x: x + Math.cos(angle) * speed,
                y: y + Math.sin(angle) * speed,
                alpha: 0,
                scaleX: 0,
                scaleY: 0,
                duration: 600,
                ease: 'Power2',
                onComplete: () => spark.destroy()
            });
        }
    }
}

window.GameScene = GameScene;
