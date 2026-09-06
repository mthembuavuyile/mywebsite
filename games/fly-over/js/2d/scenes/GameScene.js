/* ==========================================================================
   GameScene — Continuous Parallax-Scrolling Flight Journey (16-Bit Retro)
   The player pilots the Springbok jet along a multi-kilometer continuous
   corridor from airfield takeoff, through coastal / mountain terrain,
   diving into the authentic 16-bit procedural stadium bowl, and rocketing
   into the clouds for victory.
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

        // ── 1. Core State & World Parameters ──
        this.gameState = 'FLYING'; // 'FLYING' | 'VICTORY' | 'CRASHED'
        this.score = 0;
        this.hype = 0;
        this.bestClearance = 99;
        this.gatesHit = 0;
        this.nearMissAwarded = false;
        this.archThreaded = false;
        this.vuvuzelaTriggered = false;
        this.lastWarningTime = 0;
        this.warningActive = false;
        this.isThrusting = false;

        // Continuous Journey Parameters
        this.worldX = 0;
        this.totalDistance = 5400; // 5.4km flight corridor
        this.scrollSpeed = 240;    // Pixels per second (~22s complete journey)
        this.jetBaseX = 220;       // Anchored horizontally at ~17% of screen width

        // Ground coordinates
        this.baseGroundY = 630;
        this.currentGroundY = 630;

        // ── 2. Sky & Parallax Panorama Background ──
        this.skyBg = this.add.image(W / 2, H / 2, `bg_sky_${id}`)
            .setDisplaySize(W * 1.5, H)
            .setDepth(0)
            .setScrollFactor(0);

        // Drifting Clouds
        this.clouds = [];
        for (let i = 0; i < 5; i++) {
            const cloud = this.add.image(
                Phaser.Math.Between(0, W),
                Phaser.Math.Between(30, 160),
                `cloud_${i % 3}`
            ).setScale(Phaser.Math.FloatBetween(1.8, 3.2)).setAlpha(0.7).setDepth(2).setScrollFactor(0);
            this.clouds.push(cloud);
        }

        // ── 3. Tileable Scrolling Ground Layers ──
        // Runway ground (0m to 1400m)
        this.runwayTile = this.add.tileSprite(W / 2, this.baseGroundY + 45, W, 90, 'runway_tarmac')
            .setDepth(6)
            .setScrollFactor(0);

        // Natural terrain ground (1400m to 2800m and 4400m+)
        this.terrainTile = this.add.tileSprite(W / 2, this.baseGroundY + 45, W, 90, 'terrain_ground')
            .setDepth(6)
            .setScrollFactor(0)
            .setAlpha(0);

        // ── 4. Procedural 16-Bit Stadium World Sprite ──
        // The stadium bowl is 1600px wide, placed between worldX = 2700 and 4300
        this.stadiumWorldX = 2700;
        this.stadiumSprite = this.add.image(-2000, this.baseGroundY - 170, `stadium_${id}`)
            .setOrigin(0, 0.5)
            .setDepth(7)
            .setScrollFactor(0);

        // ── 5. Obstacles in World Space ──
        this.worldObstacles = [
            { worldX: 1650, y: 550, key: 'radio_mast', w: 24, h: 140, hit: false },
            { worldX: 2350, y: 540, key: 'radio_mast', w: 24, h: 140, hit: false },
            { worldX: 2680, y: 520, key: 'stadium_pylon', w: 42, h: 220, hit: false },
            { worldX: 4320, y: 520, key: 'stadium_pylon', w: 42, h: 220, hit: false }
        ];

        this.obstacleSprites = this.worldObstacles.map(obs => {
            const spr = this.add.image(-500, obs.y, obs.key)
                .setOrigin(0.5, 1)
                .setDepth(8)
                .setScrollFactor(0);
            obs.sprite = spr;
            return obs;
        });

        // ── 6. Flight Stunt Gates in World Space ──
        this.worldGates = [
            { worldX: 650,  y: 380, key: 'gate_normal', pts: 1000, label: 'TAKEOFF GLIDE', cleared: false },
            { worldX: 1300, y: 300, key: 'gate_normal', pts: 1000, label: 'COASTAL INTERCEPT', cleared: false },
            { worldX: 2050, y: 390, key: 'gate_dive',   pts: 1500, label: 'APPROACH DIVE', cleared: false },
            { worldX: 2650, y: 320, key: 'gate_dive',   pts: 2000, label: 'BOWL ENTRY', cleared: false },
            { worldX: 3450, y: 510, key: 'gate_apex',   pts: 3500, label: '⚡ PITCH SKIM ⚡', cleared: false },
            { worldX: 4200, y: 330, key: 'gate_dive',   pts: 2000, label: '🚀 CLIMBOUT GATE 🚀', cleared: false }
        ];

        this.totalGates = this.worldGates.length;

        this.worldGates.forEach(g => {
            g.sprite = this.add.image(-500, g.y, g.key)
                .setScale(1.1)
                .setDepth(9)
                .setScrollFactor(0);

            this.tweens.add({
                targets: g.sprite,
                scaleX: 1.18,
                scaleY: 1.18,
                alpha: 0.85,
                duration: 700,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        });

        // ── 7. Player Springbok Jet ──
        this.jet = this.add.image(this.jetBaseX, 480, 'jet')
            .setScale(2.2)
            .setDepth(15)
            .setScrollFactor(0);

        this.jetVelocityY = -60; // Initial gentle takeoff climb
        this.jetAngle = -10;

        // ── 8. Jet Aerobatic Particle Emitters ──
        this.smokeGreen = this.add.particles(0, 0, 'smoke_0', {
            follow: this.jet,
            followOffset: { x: -65, y: -6 },
            speed: { min: 10, max: 30 },
            angle: { min: 175, max: 185 },
            scale: { start: 1.5, end: 0 },
            alpha: { start: 0.7, end: 0 },
            tint: 0x00E676,
            lifespan: 700,
            frequency: 45,
            blendMode: 'ADD'
        }).setDepth(12);

        this.smokeGold = this.add.particles(0, 0, 'smoke_1', {
            follow: this.jet,
            followOffset: { x: -65, y: 6 },
            speed: { min: 10, max: 30 },
            angle: { min: 175, max: 185 },
            scale: { start: 1.5, end: 0 },
            alpha: { start: 0.7, end: 0 },
            tint: 0xFFD600,
            lifespan: 700,
            frequency: 45,
            blendMode: 'ADD'
        }).setDepth(12);

        this.exhaustEmitter = this.add.particles(0, 0, 'exhaust', {
            follow: this.jet,
            followOffset: { x: -75, y: 0 },
            speed: { min: 40, max: 90 },
            angle: { min: 170, max: 190 },
            scale: { start: 2.0, end: 0 },
            alpha: { start: 0.9, end: 0 },
            lifespan: 220,
            frequency: 60,
            blendMode: 'ADD'
        }).setDepth(13);

        // ── 9. Controls & Input ──
        this.input.on('pointerdown', () => { this.isThrusting = true; });
        this.input.on('pointerup', () => { this.isThrusting = false; });

        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);

        // ── 10. Audio ──
        if (audio) {
            audio.startEngine();
            audio.startWind(0.3);
        }

        // ── 11. HUD & Warning Overlays ──
        this._buildHUD(level);

        this.dangerOverlay = this.add.graphics().setDepth(30).setAlpha(0);
        this.warningText = this.add.text(W / 2, 85, '⚠ TERRAIN PULL UP ⚠', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '14px',
            color: '#FF1744',
            shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 4, fill: true },
            backgroundColor: '#000000cc',
            padding: { x: 14, y: 6 }
        }).setOrigin(0.5).setDepth(30).setAlpha(0);

        // Approach Announcement
        this._showBanner(`TAKEOFF CLEARED • INBOUND TO ${level.name}`);
    }

    update(time, delta) {
        if (this.gameState === 'CRASHED') return;

        const dt = delta / 1000;
        const W = this.cameras.main.width;
        const H = this.cameras.main.height;
        const audio = window._audioManager;
        const level = window.LEVELS[this.levelIndex];

        // ── Advance Continuous World Progress ──
        this.worldX += this.scrollSpeed * dt;
        const journeyProgress = Math.min(1.0, this.worldX / this.totalDistance);

        // Update HUD Progress Bar & Counter
        if (this.progressFill) {
            this.progressFill.width = (W * 0.28) * journeyProgress;
        }
        if (this.progressText) {
            this.progressText.setText(`${Math.floor(this.worldX)}m / ${this.totalDistance}m (${Math.floor(journeyProgress * 100)}%)`);
        }

        // ── Parallax Background Drifts ──
        this.skyBg.x = (W / 2) - (this.worldX * 0.04) % (W * 0.4);

        this.clouds.forEach(cloud => {
            cloud.x -= (this.scrollSpeed * 0.2) * dt;
            if (cloud.x < -120) {
                cloud.x = W + 120;
                cloud.y = Phaser.Math.Between(30, 160);
            }
        });

        // ── Ground Transitions ──
        if (this.worldX < 1400) {
            // Zone 1: Runway tarmac
            this.runwayTile.tilePositionX += (this.scrollSpeed * 1.5) * dt;
            this.runwayTile.setAlpha(1.0);
            this.terrainTile.setAlpha(0);
            this.currentGroundY = this.baseGroundY;
        } else if (this.worldX < 2600) {
            // Zone 2: Natural terrain transition
            const fade = Math.min(1.0, (this.worldX - 1400) / 400);
            this.runwayTile.tilePositionX += (this.scrollSpeed * 1.5) * dt;
            this.terrainTile.tilePositionX += (this.scrollSpeed * 1.5) * dt;
            this.runwayTile.setAlpha(1.0 - fade);
            this.terrainTile.setAlpha(fade);
            this.currentGroundY = this.baseGroundY;
        } else if (this.worldX >= 2600 && this.worldX < 4400) {
            // Zone 3: Inside the Stadium Bowl!
            this.runwayTile.setAlpha(0);
            this.terrainTile.setAlpha(0.3);
            this.terrainTile.tilePositionX += (this.scrollSpeed * 1.5) * dt;

            // Stadium bowl pitch is sunken by 35px
            this.currentGroundY = this.baseGroundY + 30;

            // Live spectator camera flashes
            if (Math.random() < 0.4) {
                this._spawnCrowdFlash();
            }
        } else {
            // Zone 4: Climbout
            this.runwayTile.setAlpha(0);
            this.terrainTile.setAlpha(1.0);
            this.terrainTile.tilePositionX += (this.scrollSpeed * 1.5) * dt;
            this.currentGroundY = this.baseGroundY;
        }

        // ── Position Stadium World Sprite ──
        const stadiumScreenX = this.stadiumWorldX - this.worldX + this.jetBaseX;
        this.stadiumSprite.x = stadiumScreenX;

        // Zone Entrance Announcements
        if (this.worldX > 2400 && this.worldX < 2450 && !this.stadiumAnnounced) {
            this.stadiumAnnounced = true;
            this._showBanner('🏟️ ENTERING STADIUM BOWL • DIVE FOR LOW PASS 🏟️', '#FFD600');
        }

        // ── Update World Obstacles (Radio Masts & Pylons) ──
        this.worldObstacles.forEach(obs => {
            const obsScreenX = obs.worldX - this.worldX + this.jetBaseX;
            obs.sprite.x = obsScreenX;

            // Collision check with jet
            if (!obs.hit && Math.abs(obsScreenX - this.jet.x) < 28) {
                if (this.jet.y > obs.y - obs.h + 10) {
                    obs.hit = true;
                    this._crash();
                    return;
                }
            }
        });

        // ── Update Stunt Gates in World Space ──
        this.worldGates.forEach(g => {
            const gateScreenX = g.worldX - this.worldX + this.jetBaseX;
            g.sprite.x = gateScreenX;

            if (!g.cleared && Math.abs(gateScreenX - this.jet.x) < 36) {
                if (Math.abs(this.jet.y - g.y) < 55) {
                    g.cleared = true;
                    this.gatesHit++;
                    this.gatesVal.setText(`GATES: ${this.gatesHit}/${this.totalGates}`);
                    this.score += g.pts;
                    this.scoreVal.setText(this.score.toLocaleString());
                    this.hype = Math.min(100, this.hype + 25);
                    this._updateHypeBar();

                    if (audio) audio.gateSuccess();

                    // Gate celebration animation
                    this.tweens.add({
                        targets: g.sprite,
                        scaleX: 2.2,
                        scaleY: 2.2,
                        alpha: 0,
                        duration: 350,
                        ease: 'Power2'
                    });

                    this._floatingText(this.jet.x + 30, this.jet.y - 30, `+${g.pts} ${g.label}!`, '#00E676');
                }
            }
        });

        // ════════════════════════════════════════
        //  VICTORY STATE (Rocketing into sky)
        // ════════════════════════════════════════
        if (this.gameState === 'VICTORY') {
            this.jet.y -= 260 * dt;
            this.jet.angle = Phaser.Math.Linear(this.jet.angle, -35, 0.08);
            return;
        }

        // ════════════════════════════════════════
        //  ACTIVE FLIGHT CONTROLS & PHYSICS
        // ════════════════════════════════════════
        const thrust = this.isThrusting ||
                       this.spaceKey.isDown ||
                       this.upKey.isDown ||
                       this.wKey.isDown ||
                       window._isRetroThrusting;

        if (thrust) {
            // Upward lift
            this.jetVelocityY = Math.max(this.jetVelocityY - 560 * dt, -270);
            this.jet.angle = Phaser.Math.Linear(this.jet.angle, -16, 0.12);
            this.jet.setTexture('jet_thrust');
            this.exhaustEmitter.setFrequency(25);
            if (audio) audio.setEngineThrust(0.9);
        } else {
            // Natural aerodynamic glide descent
            this.jetVelocityY = Math.min(this.jetVelocityY + 280 * dt, 220);
            this.jetVelocityY *= 0.99;
            this.jet.angle = Phaser.Math.Linear(this.jet.angle, 7, 0.06);
            this.jet.setTexture('jet');
            this.exhaustEmitter.setFrequency(90);
            if (audio) audio.setEngineThrust(0.3);
        }

        this.jet.y += this.jetVelocityY * dt;

        // Ceiling Clamp
        if (this.jet.y < 50) {
            this.jet.y = 50;
            this.jetVelocityY = Math.max(0, this.jetVelocityY);
        }

        // ── Clearance & Proximity Calculation ──
        const clearanceM = Math.max(0, (this.currentGroundY - (this.jet.y + 18)) * 0.12);
        this.bestClearance = Math.min(this.bestClearance, clearanceM);

        this.clearanceVal.setText(clearanceM.toFixed(1) + ' M');
        if (clearanceM < 6) {
            this.clearanceVal.setColor('#FF1744');
        } else if (clearanceM < 16) {
            this.clearanceVal.setColor('#FFD600');
        } else {
            this.clearanceVal.setColor('#00E676');
        }

        // Proximity scoring & crowd hype
        if (clearanceM < 20) {
            const proximityScore = Math.floor((20 - clearanceM) * 14 * dt);
            this.score += proximityScore;
            this.scoreVal.setText(this.score.toLocaleString());
            this.hype = Math.min(100, this.hype + (24 / (clearanceM + 1)) * dt * 15);
            this._updateHypeBar();
        } else {
            this.hype = Math.max(0, this.hype - dt * 6);
            this._updateHypeBar();
        }

        // Low Clearance Warning (< 6m)
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

        // Near Miss Bonus (< 3.5m)
        if (clearanceM < 3.5 && !this.nearMissAwarded && this.worldX > 2700) {
            this.nearMissAwarded = true;
            if (audio) audio.nearMiss();
            this._floatingText(this.jet.x, this.jet.y - 40, '⚡ PITCH SKIM! +3,000', '#FF1744');
            this.score += 3000;
            this.scoreVal.setText(this.score.toLocaleString());
            this.cameras.main.shake(200, 0.006);
        }

        // Moses Mabhida Arch Fly-Through Feature
        if (level.id === 'moses' && !this.archThreaded && this.worldX > 3300 && this.worldX < 3700) {
            if (this.jet.y > 180 && this.jet.y < 460) {
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

        // 100% Hype Effects
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

        // ── Ground Crash Collision ──
        if (this.jet.y >= this.currentGroundY - 8) {
            this._crash();
            return;
        }

        // ── Stadium Canopy Overhang Collision ──
        if (this.worldX > 2700 && this.worldX < 4300) {
            // Entry canopy and exit canopy (roof girders at top of bowl)
            if (this.jet.y < 160 && (this.worldX < 2950 || this.worldX > 4050)) {
                this._crash();
                return;
            }
        }

        // ── Victory Check: Cleared Full Journey! ──
        if (this.worldX >= this.totalDistance - 400) {
            this._victory();
        }
    }

    _showBanner(text, color = '#00E676') {
        const W = this.cameras.main.width;
        const banner = this.add.text(W / 2, 95, text, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '11px',
            color: color,
            shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 3, fill: true },
            backgroundColor: '#000000bb',
            padding: { x: 14, y: 7 }
        }).setOrigin(0.5).setDepth(25).setScrollFactor(0);

        this.tweens.add({
            targets: banner,
            alpha: 0,
            duration: 900,
            delay: 2400,
            onComplete: () => banner.destroy()
        });
    }

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
        const banner = this.add.text(W / 2, H * 0.38, 'JOURNEY CLEARED!', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '26px',
            color: '#00E676',
            shadow: { offsetX: 3, offsetY: 3, color: '#000000', blur: 6, fill: true },
            backgroundColor: '#000000cc',
            padding: { x: 24, y: 14 }
        }).setOrigin(0.5).setDepth(40).setScrollFactor(0);

        this.tweens.add({
            targets: banner,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 300,
            yoyo: true,
            repeat: 2
        });

        // Firework bursts
        for (let i = 0; i < 6; i++) {
            this.time.delayedCall(i * 300, () => {
                const fx = Phaser.Math.Between(180, W - 180);
                const fy = Phaser.Math.Between(100, 300);
                this._spawnFirework(fx, fy);
            });
        }

        const gateBonus = this.gatesHit * 1500;
        this.score += gateBonus;

        // Save progress to shared storage
        if (window.FlyoverStorage) {
            const stars = this.bestClearance < 5 && this.gatesHit >= 5 ? 3 : this.gatesHit >= 3 ? 2 : 1;
            window.FlyoverStorage.saveRecord('2d', window.LEVELS[this.levelIndex].id, this.score, this.bestClearance, stars);
        }

        this.time.delayedCall(2400, () => {
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

        this.cameras.main.shake(450, 0.025);
        this.cameras.main.flash(250, 255, 40, 40);

        this.add.particles(this.jet.x, this.jet.y, 'smoke_white', {
            speed: { min: 80, max: 280 },
            angle: { min: 0, max: 360 },
            scale: { start: 2.5, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 1100,
            quantity: 30
        }).setDepth(20);

        this.jet.setAlpha(0);
        this.exhaustEmitter.stop();
        this.smokeGreen.stop();
        this.smokeGold.stop();

        this.add.text(W / 2, H / 2 - 30, 'EISH!', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '52px',
            color: '#FF1744',
            shadow: { offsetX: 3, offsetY: 3, color: '#000000', blur: 8, fill: true }
        }).setOrigin(0.5).setDepth(40).setScrollFactor(0);

        const retryPrompt = this.add.text(W / 2, H / 2 + 40, 'PRESS SPACE OR TAP TO RETRY', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '11px',
            color: '#FFD600',
            backgroundColor: '#000000bb',
            padding: { x: 14, y: 8 }
        }).setOrigin(0.5).setDepth(40).setScrollFactor(0);

        this.tweens.add({
            targets: retryPrompt,
            alpha: 0.3,
            duration: 400,
            yoyo: true,
            repeat: -1
        });

        const restart = () => {
            this.scene.restart({ levelIndex: this.levelIndex });
        };

        this.time.delayedCall(400, () => {
            this.input.once('pointerdown', restart);
            this.input.keyboard.once('keydown-SPACE', restart);
            this.input.keyboard.once('keydown-ENTER', restart);
        });
    }

    _buildHUD(level) {
        const W = this.cameras.main.width;

        // Top HUD Bar Background
        const hudBg = this.add.graphics().setDepth(20).setScrollFactor(0);
        hudBg.fillStyle(0x000000, 0.7);
        hudBg.fillRect(0, 0, W, 64);
        hudBg.lineStyle(2, 0x00E676, 0.5);
        hudBg.lineBetween(0, 64, W, 64);

        // Stadium Title & City (Top Left)
        this.add.text(24, 14, level.name, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '12px',
            color: '#00E676'
        }).setDepth(21).setScrollFactor(0);

        this.add.text(24, 38, `${level.city}  •  JOURNEY RUNNER`, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '8px',
            color: '#90A4AE'
        }).setDepth(21).setScrollFactor(0);

        // Center: Continuous Journey Progress Bar (Like Chrome Dino Distance Runner)
        const progW = W * 0.28;
        const progH = 8;
        const progX = W / 2 - progW / 2;
        const progY = 28;

        this.add.text(W / 2, 12, 'FLIGHT JOURNEY PROGRESS', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '7px',
            color: '#90A4AE'
        }).setOrigin(0.5, 0).setDepth(21).setScrollFactor(0);

        this.add.rectangle(W / 2, progY + progH / 2, progW + 4, progH + 4, 0x1A2327)
            .setDepth(21).setScrollFactor(0);
        this.progressFill = this.add.rectangle(progX + 2, progY + 2, 0, progH, 0x00E676)
            .setOrigin(0, 0).setDepth(22).setScrollFactor(0);

        this.progressText = this.add.text(W / 2, 44, '0m / 5400m (0%)', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '7px',
            color: '#FFD600'
        }).setOrigin(0.5, 0).setDepth(22).setScrollFactor(0);

        // Clearance HUD (Side position so it does NOT block the flight path!)
        this.add.text(W * 0.72, 12, 'CLEARANCE', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '7px',
            color: '#90A4AE'
        }).setOrigin(0.5, 0).setDepth(21).setScrollFactor(0);

        this.clearanceVal = this.add.text(W * 0.72, 28, '-- M', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '15px',
            color: '#00E676',
            shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 2, fill: true }
        }).setOrigin(0.5, 0).setDepth(21).setScrollFactor(0);

        // Score & Gates (Top Right)
        this.add.text(W - 24, 12, 'SCORE', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '7px',
            color: '#90A4AE'
        }).setOrigin(1, 0).setDepth(21).setScrollFactor(0);

        this.scoreVal = this.add.text(W - 24, 24, '0', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '15px',
            color: '#FFD600'
        }).setOrigin(1, 0).setDepth(21).setScrollFactor(0);

        this.gatesVal = this.add.text(W - 24, 46, `GATES: 0/${this.totalGates}`, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '8px',
            color: '#00E5FF'
        }).setOrigin(1, 0).setDepth(21).setScrollFactor(0);

        // Crowd Hype Meter (Bottom Center)
        const hypeW = 280;
        const hypeH = 10;
        const hypeX = W / 2 - hypeW / 2;
        const hypeY = 650;

        this.hypeBg = this.add.rectangle(W / 2, hypeY + hypeH / 2, hypeW + 4, hypeH + 4, 0x1A1A2E, 0.8)
            .setDepth(20).setScrollFactor(0);
        this.hypeBg.setStrokeStyle(1, 0x00E676, 0.7);

        this.hypeFill = this.add.rectangle(hypeX + 2, hypeY + 2, 0, hypeH, 0x00E676)
            .setOrigin(0, 0).setDepth(21).setScrollFactor(0);

        this.add.text(W / 2, hypeY - 10, 'CROWD HYPE', {
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
        }).setOrigin(0.5).setDepth(35).setScrollFactor(0);

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
        const W = this.cameras.main.width;
        const fx = Phaser.Math.Between(100, W - 100);
        const fy = Phaser.Math.Between(440, 610);
        const flash = this.add.rectangle(fx, fy, 4, 3, 0xFFFFFF).setDepth(8).setScrollFactor(0);
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
            const spark = this.add.rectangle(x, y, 4, 4, color).setDepth(30).setScrollFactor(0);
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
