export const CONFIG = {
    groundSize: 160,
    playerSpeed: 9.5,
    playerSprintSpeed: 14.5,
    maxStamina: 100,
    staminaDrain: 30, // per second
    staminaRegen: 25, // per second
    mouseSens: 0.0022,
    minPitch: -Math.PI / 2.2,
    maxPitch: Math.PI / 2.2,
    fogDensity: 0.014,
    storageScoreKey: 'outbreak_protocol_high_score',
    storageWaveKey: 'outbreak_protocol_best_wave'
};

export const WEAPONS = [
    {
        id: 'pistol',
        name: 'Tactical 9mm',
        damage: 36,
        cooldown: 190,
        magSize: 15,
        reloadTime: 1100,
        speed: 2.5,
        color: 0xffea00,
        spread: 0.012,
        pellets: 1,
        recoil: 0.032,
        sound: 'shoot'
    },
    {
        id: 'rifle',
        name: 'AR-7 Outbreak',
        damage: 26,
        cooldown: 110,
        magSize: 32,
        reloadTime: 1500,
        speed: 2.8,
        color: 0xff9500,
        spread: 0.026,
        pellets: 1,
        recoil: 0.04,
        sound: 'shoot'
    },
    {
        id: 'shotgun',
        name: 'Combat Breacher',
        damage: 20,
        cooldown: 650,
        magSize: 8,
        reloadTime: 1900,
        speed: 2.2,
        color: 0xff3b30,
        spread: 0.11,
        pellets: 8,
        recoil: 0.12,
        sound: 'shoot'
    },
    {
        id: 'plasma',
        name: 'Plasma Disruptor',
        damage: 115,
        cooldown: 550,
        magSize: 8,
        reloadTime: 1800,
        speed: 1.6,
        color: 0x00f0ff,
        spread: 0.005,
        pellets: 1,
        recoil: 0.08,
        isPlasma: true,
        splashRadius: 5.2,
        sound: 'plasma'
    }
];

export const ENEMY_TYPES = [
    {
        type: 'walker',
        name: 'Infected Walker',
        health: 100,
        speed: 0.042,
        damage: 10,
        color: 0x3d703d,
        size: 1.0,
        attackCd: 850
    },
    {
        type: 'runner',
        name: 'Feral Runner',
        health: 65,
        speed: 0.082,
        damage: 6,
        color: 0xb91c1c,
        size: 0.9,
        attackCd: 550
    },
    {
        type: 'tank',
        name: 'Goliath Tank',
        health: 320,
        speed: 0.026,
        damage: 22,
        color: 0x334155,
        size: 1.5,
        attackCd: 1200
    },
    {
        type: 'spitter',
        name: 'Toxic Spitter',
        health: 95,
        speed: 0.046,
        damage: 14,
        color: 0x16a34a,
        size: 1.05,
        attackCd: 1800,
        isRanged: true
    }
];
