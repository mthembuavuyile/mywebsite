/* ========================================
   BootScene — Asset Loading & Generation
   ======================================== */

class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        this.load.image('stadium_art_dhl', 'assets/stadiums/dhl.jpg');
        this.load.image('stadium_art_moses', 'assets/stadiums/moses.jpg');
        this.load.image('stadium_art_ellis', 'assets/stadiums/ellis.jpg');
        this.load.image('stadium_art_loftus', 'assets/stadiums/loftus.jpg');
    }

    create() {
        const W = this.cameras.main.width;
        const H = this.cameras.main.height;

        this.cameras.main.setBackgroundColor('#0a0a12');

        const titleText = this.add.text(W / 2, H / 2 - 60, 'SPRINGBOK FLYOVER', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '24px',
            color: '#00E676',
            align: 'center'
        }).setOrigin(0.5);

        const loadText = this.add.text(W / 2, H / 2, 'PREPARING SQUADRON...', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '12px',
            color: '#90A4AE',
            align: 'center'
        }).setOrigin(0.5);

        const barW = 400;
        const barH = 16;
        const barX = W / 2 - barW / 2;
        const barY = H / 2 + 40;
        this.add.rectangle(W / 2, barY + barH / 2, barW + 4, barH + 4, 0x263238);
        const progressBar = this.add.rectangle(barX + 2, barY + 2, 0, barH, 0x00E676).setOrigin(0, 0);

        const tasks = [
            { label: 'JET SQUADRON', fn: () => SpriteGenerator.generateJet(this) },
            { label: 'STUNT GATES', fn: () => SpriteGenerator.generateGates(this) },
            { label: 'CLOUDS & ATMOSPHERE', fn: () => SpriteGenerator.generateClouds(this) },
            { label: 'AEROBATIC PARTICLES', fn: () => SpriteGenerator.generateParticles(this) },
            { label: 'RUNWAY & TERRAIN', fn: () => SpriteGenerator.generateGroundAssets(this) },
        ];

        // Generate procedural pixel stadium and panorama for each venue
        const levels = window.LEVELS || [];
        for (let i = 0; i < levels.length; i++) {
            const lvl = levels[i];
            tasks.push({
                label: `STADIUM: ${lvl.name}`,
                fn: () => SpriteGenerator.generateStadium(this, i)
            });
            tasks.push({
                label: `PANORAMA: ${lvl.city}`,
                fn: () => SpriteGenerator.generateBackground(this, i)
            });
        }

        let currentTask = 0;
        const totalTasks = tasks.length;

        const processNext = () => {
            if (currentTask < totalTasks) {
                const task = tasks[currentTask];
                loadText.setText(task.label);
                try {
                    task.fn();
                } catch (e) {
                    console.warn(`Failed: ${task.label}`, e);
                }
                currentTask++;
                progressBar.width = barW * (currentTask / totalTasks);

                if (currentTask < totalTasks) {
                    this.time.delayedCall(40, processNext);
                } else {
                    loadText.setText('READY TO FLY!');
                    this.time.delayedCall(300, () => {
                        this.scene.start('MenuScene');
                    });
                }
            }
        };

        this.time.delayedCall(150, processNext);
    }
}

window.BootScene = BootScene;
