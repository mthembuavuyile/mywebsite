// Global Game State for Outbreak Protocol
export const state = {
    score: 0,
    wave: 1,
    health: 100,
    maxHealth: 100,
    stamina: 100,
    maxStamina: 100,
    isSprinting: false,
    kills: 0,
    shotsFired: 0,
    shotsHit: 0,

    gameActive: false,
    isPaused: false,
    isThirdPerson: false,

    currentWeaponIdx: 0,
    weaponState: [], // Initialized per weapon

    // Entity arrays
    bullets: [],
    enemies: [],
    spitProjectiles: [],
    particles: [],
    powerUps: [],
    obstacles: [],
    obstacleBoxes: [], // Precomputed Box3 bounds for zero-allocation collision

    // Movement & Input
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    isShooting: false,
    lastShootTime: 0,

    touchMoveActive: false,
    touchMoveDir: { x: 0, y: 0 },

    // Three.js References
    scene: null,
    camera: null,
    renderer: null,
    clock: null,
    player: null,
    playerBody: null,
    weaponHolder: null,
    laserSight: null,
    playerGltfModel: null,
    zombieGltfModel: null,

    // Audio & Minimap Contexts
    minimapCtx: null,
    audioCtx: null,
    audioBuffers: {}
};

export function resetGameStats() {
    state.score = 0;
    state.wave = 1;
    state.health = 100;
    state.stamina = 100;
    state.isSprinting = false;
    state.kills = 0;
    state.shotsFired = 0;
    state.shotsHit = 0;
    state.isPaused = false;
    state.moveForward = false;
    state.moveBackward = false;
    state.moveLeft = false;
    state.moveRight = false;
    state.isShooting = false;

    // Clean up entities from scene
    if (state.scene) {
        state.bullets.forEach(b => state.scene.remove(b));
        state.enemies.forEach(e => state.scene.remove(e));
        state.spitProjectiles.forEach(s => state.scene.remove(s));
        state.particles.forEach(p => state.scene.remove(p));
        state.powerUps.forEach(pu => state.scene.remove(pu));
    }

    state.bullets = [];
    state.enemies = [];
    state.spitProjectiles = [];
    state.particles = [];
    state.powerUps = [];
}
