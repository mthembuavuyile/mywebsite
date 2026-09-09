// Global Game State
export const state = {
    score: 0,
    wave: 1,
    health: 100,
    maxHealth: 100,
    gameActive: false,
    isPaused: false,
    isThirdPerson: false,
    
    currentWeaponIdx: 0,
    weaponState: [], // Initialized in main.js
    
    // Entity arrays
    bullets: [],
    enemies: [],
    spitProjectiles: [],
    particles: [],
    powerUps: [],
    obstacles: [],
    
    // Player movement state
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    isShooting: false,
    lastShootTime: 0,
    
    touchMoveActive: false,
    touchMoveDir: { x: 0, y: 0 },
    
    // Global ThreeJS references
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
    
    // Contexts
    minimapCtx: null,
    audioCtx: null
};

// Helper methods to modify state safely
export function setGameState(key, value) {
    state[key] = value;
}

export function resetGameStats() {
    state.score = 0;
    state.wave = 1;
    state.health = 100;
    state.bullets = [];
    state.enemies = [];
    state.spitProjectiles = [];
    state.particles = [];
    state.powerUps = [];
}
