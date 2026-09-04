/* ========================================
   Main — Phaser Game Configuration
   Entry point that creates and configures
   the Phaser.Game instance.
   ======================================== */

window.addEventListener('load', () => {
    const config = {
        type: Phaser.AUTO,
        width: 1280,
        height: 720,
        parent: 'game-container',

        // Pixel art rendering
        pixelArt: true,
        roundPixels: true,
        antialias: false,

        // Scale to fit viewport
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
        },

        // Physics
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 }, // Gravity is per-object, set in GameScene
                debug: false,
            },
        },

        // Scenes in order
        scene: [
            window.BootScene,
            window.MenuScene,
            window.CinematicScene,
            window.GameScene,
            window.ResultScene,
        ],

        // Background color
        backgroundColor: '#0a0a12',

        // Input
        input: {
            keyboard: true,
            mouse: true,
            touch: true,
        },

        // Rendering
        render: {
            pixelArt: true,
            transparent: false,
        },
    };

    const game = new Phaser.Game(config);

    // Handle visibility change (pause/resume)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            game.scene.scenes.forEach(scene => {
                if (scene.scene.isActive()) {
                    scene.scene.pause();
                }
            });
        } else {
            game.scene.scenes.forEach(scene => {
                if (scene.scene.isPaused()) {
                    scene.scene.resume();
                }
            });
        }
    });
});
