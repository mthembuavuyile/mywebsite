/* ========================================
   CinematicScene — Stadium Flyover Preview
   Showcases authentic 16-bit stadium art
   with jet flyby before launching gameplay.
   ======================================== */

class CinematicScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CinematicScene' });
    }

    init(data) {
        this.levelIndex = data.levelIndex || 0;
        this.canStart = true;
    }

    create() {
        const level = window.LEVELS[this.levelIndex];
        const W = this.cameras.main.width;
        const H = this.cameras.main.height;
        const audio = window._audioManager;
        const id = level.id;

        this.cameras.main.fadeIn(500, 0, 0, 0);

        // ── Authentic 16-bit Stadium Art Backdrop ──
        const bg = this.add.image(W / 2, H / 2, `stadium_art_${id}`);
        bg.setDisplaySize(W, H);

        // Slight dramatic camera zoom-in
        this.cameras.main.setZoom(1.05);
        this.tweens.add({
            targets: this.cameras.main,
            zoom: 1.0,
            duration: 3500,
            ease: 'Sine.easeOut'
        });

        // ── Flyby Jet ──
        const cinJet = this.add.image(-80, H * 0.32, 'jet_thrust').setScale(2.5).setDepth(10);
        this.tweens.add({
            targets: cinJet,
            x: W + 100,
            y: H * 0.28,
            duration: 3500,
            ease: 'Linear'
        });

        // Dual Springbok Smoke Trail
        this.add.particles(0, 0, 'smoke_white', {
            follow: cinJet,
            followOffset: { x: -60, y: -4 },
            speed: { min: 10, max: 25 },
            scale: { start: 1.5, end: 0 },
            alpha: { start: 0.6, end: 0 },
            tint: [0x00E676, 0xFFD600],
            lifespan: 800,
            frequency: 40,
            blendMode: 'ADD'
        }).setDepth(9);

        // ── Top & Bottom Cinematic Letterbox ──
        const vignette = this.add.graphics().setDepth(15);
        vignette.fillStyle(0x000000, 0.75);
        vignette.fillRect(0, 0, W, 70);
        vignette.fillRect(0, H - 70, W, 70);

        // ── Stadium Title Banner ──
        this.add.text(W / 2, 28, level.name, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '22px',
            color: '#FFFFFF',
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 4, fill: true },
            align: 'center'
        }).setOrigin(0.5).setDepth(20);

        this.add.text(W / 2, 52, `${level.city}  •  ${level.subtitle || ''}`, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '9px',
            color: '#00E676',
            shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 2, fill: true }
        }).setOrigin(0.5).setDepth(20);

        // ── Hazard Advisory ──
        this.add.text(W / 2, H - 45, `⚠ MISSION INTEL: ${level.hazardText}`, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '9px',
            color: '#FFD600',
            backgroundColor: '#000000aa',
            padding: { x: 12, y: 6 }
        }).setOrigin(0.5).setDepth(20);

        // ── Pulsing "CLICK / SPACE TO FLY" prompt ──
        const flyPrompt = this.add.text(W / 2, H / 2, '▶ PRESS SPACE OR CLICK TO FLY ◀', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '16px',
            color: '#FFD600',
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 4, fill: true },
            backgroundColor: '#000000bb',
            padding: { x: 20, y: 12 }
        }).setOrigin(0.5).setDepth(25);

        this.tweens.add({
            targets: flyPrompt,
            scaleX: 1.08,
            scaleY: 1.08,
            alpha: 0.8,
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        // ── Sounds ──
        if (audio) {
            audio.startWind(0.3);
        }

        // ── Quick Start Controls ──
        const startGame = () => {
            if (!this.canStart) return;
            this.canStart = false;
            if (audio) {
                audio.uiClick();
                audio.stopWind();
            }
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('GameScene', { levelIndex: this.levelIndex });
            });
        };

        this.input.on('pointerdown', startGame);
        this.input.keyboard.on('keydown-SPACE', startGame);
        this.input.keyboard.on('keydown-ENTER', startGame);

        // Auto start after 3 seconds if player just watches
        this.autoStartTimer = this.time.delayedCall(3000, startGame);
    }
}

window.CinematicScene = CinematicScene;
