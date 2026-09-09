export const CONFIG = {
    groundSize: 150,
    playerSpeed: 9.5,
    mouseSens: 0.0022,
    minPitch: -Math.PI / 2.2,
    maxPitch: Math.PI / 2.2
};

export const WEAPONS = [
    { name: 'Pistol', damage: 35, cooldown: 220, magSize: 12, reloadTime: 1200, speed: 2.2, color: 0xffff44, spread: 0.01, pellets: 1, recoil: 0.03 },
    { name: 'Assault Rifle', damage: 24, cooldown: 110, magSize: 30, reloadTime: 1600, speed: 2.6, color: 0xffaa00, spread: 0.03, pellets: 1, recoil: 0.04 },
    { name: 'Shotgun', damage: 18, cooldown: 650, magSize: 6, reloadTime: 2000, speed: 2.0, color: 0xff4400, spread: 0.12, pellets: 8, recoil: 0.12 },
    { name: 'Plasma Cannon', damage: 90, cooldown: 550, magSize: 8, reloadTime: 1800, speed: 1.5, color: 0x00f0ff, spread: 0.005, pellets: 1, recoil: 0.08, isPlasma: true, splashRadius: 4.5 }
];

export const ENEMY_TYPES = [
    { type: 'walker', name: 'Walker', health: 100, speed: 0.04, damage: 8, color: 0x3d703d, size: 1.0, attackCd: 900 },
    { type: 'runner', name: 'Runner', health: 65, speed: 0.08, damage: 5, color: 0x992222, size: 0.9, attackCd: 600 },
    { type: 'tank', name: 'Tank', health: 260, speed: 0.025, damage: 18, color: 0x334466, size: 1.45, attackCd: 1300 },
    { type: 'spitter', name: 'Toxic Spitter', health: 90, speed: 0.045, damage: 12, color: 0x22aa44, size: 1.05, attackCd: 1800, isRanged: true }
];
