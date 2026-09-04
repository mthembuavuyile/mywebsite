/* ========================================
   ResultScene — Post-Run Score Breakdown
   Shows score, clearance, star rating,
   and next stadium / retry options.
   ======================================== */

class ResultScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ResultScene' });
    }

    init(data) {
        this.levelIndex = data.levelIndex || 0;
        this.finalScore = data.score || 0;
        this.bestClearance = data.bestClearance || 99;
        this.hypeMax = data.hypeMax || 0;
        this.crashed = data.crashed || false;
        this.passed = data.passed || false;
    }

    create() {
        const level = window.LEVELS[this.levelIndex];
        const W = this.cameras.main.width;
        const H = this.cameras.main.height;
        const audio = window._audioManager;

        this.cameras.main.fadeIn(600, 0, 0, 0);

        // ── Background ──
        const bg = this.add.graphics();
        for (let y = 0; y < H; y++) {
            const t = y / H;
            const r = Math.floor(8 + t * 6);
            const g = Math.floor(8 + t * 10);
            const b = Math.floor(15 + t * 25);
            bg.fillStyle(Phaser.Display.Color.GetColor(r, g, b));
            bg.fillRect(0, y, W, 1);
        }

        // ── Calculate Stars ──
        let stars = 0;
        if (this.passed && !this.crashed) {
            if (this.finalScore >= level.scoreThresholds[2]) stars = 3;
            else if (this.finalScore >= level.scoreThresholds[1]) stars = 2;
            else if (this.finalScore >= level.scoreThresholds[0]) stars = 1;
        }

        // ── Result Header ──
        const headerY = 80;
        if (this.crashed) {
            this.add.text(W / 2, headerY, 'CRASHED!', {
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '36px',
                color: '#FF1744',
                shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 4, fill: true },
            }).setOrigin(0.5);

            this.add.text(W / 2, headerY + 50, 'Better luck next time, pilot.', {
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '10px',
                color: '#90A4AE',
            }).setOrigin(0.5);
        } else {
            this.add.text(W / 2, headerY, 'CLEARED!', {
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '36px',
                color: '#00E676',
                shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 4, fill: true },
            }).setOrigin(0.5);

            // Clearance message
            let clearMsg = '';
            if (this.bestClearance < 3) clearMsg = '"LOW IS VERY, VERY GOOD"';
            else if (this.bestClearance < 8) clearMsg = '"That was insanely close!"';
            else if (this.bestClearance < 15) clearMsg = '"Solid pass, pilot!"';
            else clearMsg = '"Safe pass. Try going lower!"';

            this.add.text(W / 2, headerY + 50, clearMsg, {
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '10px',
                color: '#FFD600',
            }).setOrigin(0.5);
        }

        // ── Score Breakdown ──
        const cardX = W / 2;
        const cardW = 480;
        const cardY = 200;
        const lineH = 42;

        // Card background
        const card = this.add.graphics();
        card.fillStyle(0x1A237E, 0.5);
        card.fillRoundedRect(cardX - cardW / 2, cardY - 10, cardW, lineH * 5 + 40, 12);
        card.lineStyle(2, 0x304FFE, 0.6);
        card.strokeRoundedRect(cardX - cardW / 2, cardY - 10, cardW, lineH * 5 + 40, 12);

        const stats = [
            { label: 'STADIUM', value: level.name, color: '#FFFFFF' },
            { label: 'BEST CLEARANCE', value: this.bestClearance.toFixed(1) + ' M', color: this.bestClearance < 5 ? '#FF1744' : this.bestClearance < 15 ? '#FF9800' : '#00E676' },
            { label: 'HYPE PEAK', value: Math.floor(this.hypeMax) + '%', color: this.hypeMax >= 100 ? '#FFD600' : '#90A4AE' },
            { label: 'TOTAL SCORE', value: this.finalScore.toLocaleString(), color: '#FFD600' },
        ];

        stats.forEach((stat, i) => {
            const sy = cardY + 10 + i * lineH;

            this.add.text(cardX - cardW / 2 + 20, sy, stat.label, {
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '9px',
                color: '#546E7A',
            });

            this.add.text(cardX + cardW / 2 - 20, sy, stat.value, {
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '14px',
                color: stat.color,
            }).setOrigin(1, 0);
        });

        // ── Stars ──
        const starY = cardY + lineH * 4 + 20;
        for (let i = 0; i < 3; i++) {
            const starX = cardX - 40 + i * 40;
            const filled = i < stars;

            const starText = this.add.text(starX, starY, '★', {
                fontFamily: 'monospace',
                fontSize: '32px',
                color: filled ? '#FFD600' : '#37474F',
                shadow: filled ? { offsetX: 1, offsetY: 1, color: '#FF6F00', blur: 3, fill: true } : {},
            }).setOrigin(0.5);

            if (filled) {
                starText.setScale(0);
                this.tweens.add({
                    targets: starText,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 400,
                    delay: 600 + i * 200,
                    ease: 'Back.easeOut',
                });
            }
        }

        // ── Save Progress ──
        if (this.passed && !this.crashed) {
            this._saveProgress(stars);
        }

        // ── Buttons ──
        const btnY = 560;
        const btnW = 200;
        const btnH = 50;

        // RETRY button
        this._createButton(
            cardX - 120, btnY, btnW, btnH,
            'RETRY', 0x263238, 0x00E676,
            () => {
                if (audio) audio.uiClick();
                this.cameras.main.fadeOut(400);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    this.scene.start('GameScene', { levelIndex: this.levelIndex });
                });
            }
        );

        // NEXT / MENU button
        const hasNext = this.levelIndex < window.LEVELS.length - 1;
        const nextLabel = (this.passed && !this.crashed && hasNext) ? 'NEXT ▸' : 'MENU';

        this._createButton(
            cardX + 120, btnY, btnW, btnH,
            nextLabel, 0x1A237E, 0xFFD600,
            () => {
                if (audio) audio.uiClick();
                this.cameras.main.fadeOut(400);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    if (this.passed && !this.crashed && hasNext) {
                        this.scene.start('GameScene', { levelIndex: this.levelIndex + 1 });
                    } else {
                        this.scene.start('MenuScene');
                    }
                });
            }
        );

        // ── SA Flag bar ──
        const flagColors = [0x007749, 0x000000, 0xFFB612, 0x001489, 0xDE3831, 0xFFFFFF];
        const flagW = W / 6;
        flagColors.forEach((col, i) => {
            this.add.rectangle(flagW * i + flagW / 2, H - 2, flagW + 2, 4, col).setAlpha(0.6);
        });

        // ── Keyboard shortcuts ──
        this.input.keyboard.on('keydown-R', () => {
            if (audio) audio.uiClick();
            this.cameras.main.fadeOut(400);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('GameScene', { levelIndex: this.levelIndex });
            });
        });
        this.input.keyboard.on('keydown-ENTER', () => {
            if (audio) audio.uiClick();
            this.cameras.main.fadeOut(400);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                if (this.passed && !this.crashed && hasNext) {
                    this.scene.start('GameScene', { levelIndex: this.levelIndex + 1 });
                } else {
                    this.scene.start('MenuScene');
                }
            });
        });
    }

    _createButton(x, y, w, h, label, bgColor, textColor, callback) {
        const btn = this.add.graphics();
        btn.fillStyle(bgColor, 0.8);
        btn.fillRoundedRect(x - w / 2, y - h / 2, w, h, 8);
        btn.lineStyle(2, textColor, 0.8);
        btn.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 8);

        const text = this.add.text(x, y, label, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '12px',
            color: Phaser.Display.Color.IntegerToColor(textColor).rgba,
        }).setOrigin(0.5);

        const zone = this.add.zone(x, y, w, h).setInteractive({ useHandCursor: true });

        zone.on('pointerover', () => {
            btn.clear();
            btn.fillStyle(Phaser.Display.Color.ValueToColor(bgColor).lighten(20).color, 0.9);
            btn.fillRoundedRect(x - w / 2, y - h / 2, w, h, 8);
            btn.lineStyle(2, textColor, 1);
            btn.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 8);
        });

        zone.on('pointerout', () => {
            btn.clear();
            btn.fillStyle(bgColor, 0.8);
            btn.fillRoundedRect(x - w / 2, y - h / 2, w, h, 8);
            btn.lineStyle(2, textColor, 0.8);
            btn.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 8);
        });

        zone.on('pointerdown', callback);
    }

    _saveProgress(stars) {
        try {
            const data = JSON.parse(localStorage.getItem('springbok_progress') || '{}');

            // Save stars (keep best)
            const prevStars = data[`level_${this.levelIndex}_stars`] || 0;
            data[`level_${this.levelIndex}_stars`] = Math.max(prevStars, stars);

            // Unlock next level
            if (this.levelIndex < window.LEVELS.length - 1) {
                data[`level_${this.levelIndex + 1}_unlocked`] = true;
                window.LEVELS[this.levelIndex + 1].unlocked = true;
            }

            // Save score
            const prevScore = data[`level_${this.levelIndex}_score`] || 0;
            data[`level_${this.levelIndex}_score`] = Math.max(prevScore, this.finalScore);

            localStorage.setItem('springbok_progress', JSON.stringify(data));
        } catch (e) {
            console.warn('Could not save progress:', e);
        }
    }
}

window.ResultScene = ResultScene;
