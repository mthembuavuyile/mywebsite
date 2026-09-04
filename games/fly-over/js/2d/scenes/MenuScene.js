/* ========================================
   MenuScene — Title Screen & Level Select
   Animated title with jet flyby,
   stadium selection cards with lock states.
   ======================================== */

class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const W = this.cameras.main.width;
        const H = this.cameras.main.height;

        // ── Background ──
        // Dark gradient background
        const bg = this.add.graphics();
        for (let y = 0; y < H; y++) {
            const t = y / H;
            const r = Math.floor(10 + t * 5);
            const g = Math.floor(10 + t * 8);
            const b = Math.floor(18 + t * 20);
            bg.fillStyle(Phaser.Display.Color.GetColor(r, g, b));
            bg.fillRect(0, y, W, 1);
        }

        // Subtle grid pattern
        const gridGfx = this.add.graphics();
        gridGfx.lineStyle(1, 0x1A237E, 0.15);
        for (let x = 0; x < W; x += 40) {
            gridGfx.lineBetween(x, 0, x, H);
        }
        for (let y = 0; y < H; y += 40) {
            gridGfx.lineBetween(0, y, W, y);
        }

        // ── SA Flag Stripe Accent ──
        const flagColors = [0x007749, 0x000000, 0xFFB612, 0x001489, 0xDE3831, 0xFFFFFF];
        flagColors.forEach((col, i) => {
            this.add.rectangle(W / 2, 2 + i * 3, W, 3, col).setAlpha(0.6);
        });

        // ── Title ──
        const titleY = 120;
        this.add.text(W / 2, titleY, 'SPRINGBOK', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '42px',
            color: '#00E676',
            shadow: { offsetX: 3, offsetY: 3, color: '#004D40', blur: 0, fill: true }
        }).setOrigin(0.5);

        this.add.text(W / 2, titleY + 55, 'FLYOVER', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '42px',
            color: '#FFD600',
            shadow: { offsetX: 3, offsetY: 3, color: '#FF6F00', blur: 0, fill: true }
        }).setOrigin(0.5);

        // Subtitle
        this.add.text(W / 2, titleY + 105, 'STADIUM ARCADE', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '12px',
            color: '#B0BEC5',
            letterSpacing: 6
        }).setOrigin(0.5);

        // ── Animated Jet ──
        this.menuJet = this.add.image(-100, titleY + 40, 'jet').setScale(3);
        this.tweens.add({
            targets: this.menuJet,
            x: W + 100,
            duration: 4000,
            ease: 'Linear',
            repeat: -1,
            delay: 1000,
            onRepeat: () => {
                this.menuJet.x = -100;
                this.menuJet.y = titleY + 30 + Math.random() * 30;
            }
        });

        // Exhaust trail particles
        this.jetTrail = this.add.particles(0, 0, 'smoke_white', {
            follow: this.menuJet,
            followOffset: { x: -40, y: 0 },
            speed: { min: 5, max: 20 },
            scale: { start: 1.5, end: 0 },
            alpha: { start: 0.4, end: 0 },
            lifespan: 800,
            frequency: 50,
            blendMode: 'ADD',
        });

        // ── Level Select Cards ──
        const cardStartY = 330;
        const cardH = 70;
        const cardGap = 12;
        const cardW = 500;

        // Load unlock state from localStorage
        this._loadProgress();

        this.levelCards = [];
        window.LEVELS.forEach((level, i) => {
            const cy = cardStartY + i * (cardH + cardGap);
            const isUnlocked = level.unlocked;

            // Card background
            const card = this.add.graphics();
            const cardColor = isUnlocked ? 0x1A237E : 0x1A1A2E;
            const borderColor = isUnlocked ? 0x00E676 : 0x37474F;
            card.fillStyle(cardColor, 0.8);
            card.fillRoundedRect(W / 2 - cardW / 2, cy, cardW, cardH, 8);
            card.lineStyle(2, borderColor, 0.9);
            card.strokeRoundedRect(W / 2 - cardW / 2, cy, cardW, cardH, 8);

            // Level number
            const numColor = isUnlocked ? '#00E676' : '#37474F';
            this.add.text(W / 2 - cardW / 2 + 20, cy + 12, `0${i + 1}`, {
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '20px',
                color: numColor,
            });

            // Stadium name
            const nameColor = isUnlocked ? '#FFFFFF' : '#546E7A';
            this.add.text(W / 2 - cardW / 2 + 80, cy + 10, level.name, {
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '14px',
                color: nameColor,
            });

            // City
            const cityColor = isUnlocked ? '#90A4AE' : '#37474F';
            this.add.text(W / 2 - cardW / 2 + 80, cy + 34, level.city, {
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '9px',
                color: cityColor,
            });

            // Hazard text
            if (isUnlocked) {
                this.add.text(W / 2 - cardW / 2 + 80, cy + 50, level.hazardText, {
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: '7px',
                    color: '#FF9800',
                });
            }

            // Lock icon or arrow
            if (isUnlocked) {
                this.add.text(W / 2 + cardW / 2 - 40, cy + cardH / 2 - 10, '▶', {
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: '16px',
                    color: '#00E676',
                }).setOrigin(0.5);

                // Stars (if completed)
                const stars = this._getStars(i);
                for (let s = 0; s < 3; s++) {
                    const starX = W / 2 + cardW / 2 - 90 + s * 16;
                    const starCol = s < stars ? '#FFD600' : '#37474F';
                    this.add.text(starX, cy + 8, '★', {
                        fontFamily: 'monospace',
                        fontSize: '14px',
                        color: starCol,
                    });
                }
            } else {
                this.add.text(W / 2 + cardW / 2 - 40, cy + cardH / 2 - 8, '🔒', {
                    fontSize: '16px',
                }).setOrigin(0.5);
            }

            // Interactive zone
            if (isUnlocked) {
                const hitZone = this.add.zone(W / 2, cy + cardH / 2, cardW, cardH)
                    .setInteractive({ useHandCursor: true });

                hitZone.on('pointerover', () => {
                    card.clear();
                    card.fillStyle(0x283593, 0.9);
                    card.fillRoundedRect(W / 2 - cardW / 2, cy, cardW, cardH, 8);
                    card.lineStyle(2, 0x69F0AE, 1);
                    card.strokeRoundedRect(W / 2 - cardW / 2, cy, cardW, cardH, 8);
                });

                hitZone.on('pointerout', () => {
                    card.clear();
                    card.fillStyle(cardColor, 0.8);
                    card.fillRoundedRect(W / 2 - cardW / 2, cy, cardW, cardH, 8);
                    card.lineStyle(2, borderColor, 0.9);
                    card.strokeRoundedRect(W / 2 - cardW / 2, cy, cardW, cardH, 8);
                });

                hitZone.on('pointerdown', () => {
                    this._startLevel(i);
                });
            }

            this.levelCards.push({ card, isUnlocked });
        });

        // ── Instructions ──
        this.add.text(W / 2, H - 40, 'TAP / SPACE / CLICK TO FLY  •  DIVE LOW FOR MAXIMUM POINTS', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '8px',
            color: '#546E7A',
        }).setOrigin(0.5);

        // ── Blinking "SELECT A STADIUM" ──
        const selectText = this.add.text(W / 2, cardStartY - 30, '▼ SELECT A STADIUM ▼', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '10px',
            color: '#FFD600',
        }).setOrigin(0.5);

        this.tweens.add({
            targets: selectText,
            alpha: 0.3,
            duration: 600,
            yoyo: true,
            repeat: -1,
        });

        // ── Keyboard shortcuts ──
        this.input.keyboard.on('keydown-ONE', () => this._startLevel(0));
        this.input.keyboard.on('keydown-TWO', () => {
            if (window.LEVELS[1].unlocked) this._startLevel(1);
        });
        this.input.keyboard.on('keydown-THREE', () => {
            if (window.LEVELS[2].unlocked) this._startLevel(2);
        });
        this.input.keyboard.on('keydown-FOUR', () => {
            if (window.LEVELS[3].unlocked) this._startLevel(3);
        });
    }

    _startLevel(index) {
        // Initialize audio on first user interaction
        if (!window._audioManager) {
            window._audioManager = new AudioManager();
        }
        window._audioManager.init();
        window._audioManager.resume();
        window._audioManager.uiClick();

        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('CinematicScene', { levelIndex: index });
        });
    }

    _loadProgress() {
        try {
            const data = JSON.parse(localStorage.getItem('springbok_progress') || '{}');
            window.LEVELS.forEach((level, i) => {
                level.unlocked = true;
            });
            this._savedScores = data.scores || {};
        } catch (e) {
            this._savedScores = {};
        }
    }

    _getStars(levelIndex) {
        try {
            const data = JSON.parse(localStorage.getItem('springbok_progress') || '{}');
            return data[`level_${levelIndex}_stars`] || 0;
        } catch (e) {
            return 0;
        }
    }
}

window.MenuScene = MenuScene;
