/* ========================================
   Level Configurations
   Data-only file defining all 4 stadium levels.
   ======================================== */

window.LEVELS = [
    // ── Level 1: DHL Stadium, Cape Town ──
    {
        id: 'dhl',
        name: 'DHL STADIUM',
        city: 'CAPE TOWN',
        subtitle: 'Table Mountain & Atlantic Ocean',
        hazardText: 'Low roofline • Ocean approach • Strong crosswinds',
        unlocked: true,

        // Physics
        gravity: 420,
        thrustPower: -320,
        windStrength: 2.8,
        windFrequency: 0.6,
        scrollSpeed: 220,
        airDensity: 1.0, // sea level = full lift

        // Stadium geometry (y measured from bottom of game world)
        stadium: {
            approachX: 3200,       // when stadium first visible
            centerX: 4000,         // center of scoring zone
            width: 900,
            leftWall:  { x: -450, y: 0, w: 80, h: 260 },
            rightWall: { x: 370,  y: 0, w: 80, h: 260 },
            roof:      { x: -450, y: 220, w: 180, h: 40 },  // left canopy
            roofRight: { x: 270,  y: 220, w: 180, h: 40 },  // right canopy
            groundY: 580,          // ground level in game coords
            roofTopY: 300,         // y position of the highest obstacle
        },

        // Visuals
        colors: {
            skyTop: 0x2196F3,
            skyBottom: 0x81D4FA,
            mountain: [0x6D7B8D, 0x7E8D9A, 0x556B7A, 0x8B9BA7],
            mountainSnow: 0xE0E0E0,
            city: [0x78909C, 0xB0BEC5, 0x90A4AE, 0x607D8B],
            vegetation: [0x2E7D32, 0x43A047, 0x388E3C, 0x66BB6A],
            water: [0x0277BD, 0x0288D1, 0x039BE5],
            ground: [0x4CAF50, 0x388E3C],
            sand: [0xFFE0B2, 0xFFCC80],
            stadiumOuter: 0xCFD8DC,
            stadiumInner: 0xECEFF1,
            stadiumShadow: 0x90A4AE,
            field: [0x1B5E20, 0x2E7D32, 0x388E3C],
            crowd: [0xE53935, 0x1E88E5, 0xFDD835, 0x43A047, 0xFFFFFF],
            track: 0xBF360C,
        },

        // Parallax layer configs (back to front)
        parallax: [
            { type: 'sky',        speed: 0.0 },
            { type: 'clouds',     speed: 0.3 },
            { type: 'mountain',   speed: 0.5 },
            { type: 'city',       speed: 1.0 },
            { type: 'vegetation', speed: 1.5 },
            { type: 'ground',     speed: 2.0 },
        ],

        scoreThresholds: [5000, 15000, 30000],
    },

    // ── Level 2: Moses Mabhida, Durban ──
    {
        id: 'moses',
        name: 'MOSES MABHIDA',
        city: 'DURBAN',
        subtitle: 'Indian Ocean & Beachfront',
        hazardText: 'Central arch structure • Fly UNDER or OVER the arch',
        unlocked: true,

        gravity: 400,
        thrustPower: -310,
        windStrength: 2.0,
        windFrequency: 0.4,
        scrollSpeed: 210,
        airDensity: 1.0,

        stadium: {
            approachX: 3200,
            centerX: 4000,
            width: 1000,
            leftWall:  { x: -500, y: 0, w: 80, h: 240 },
            rightWall: { x: 420,  y: 0, w: 80, h: 240 },
            roof:      { x: -500, y: 200, w: 160, h: 40 },
            roofRight: { x: 340,  y: 200, w: 160, h: 40 },
            // The arch! A special obstacle
            arch: {
                leftBaseX: -200,
                rightBaseX: 200,
                peakY: 400,     // how high the arch goes above the stadium
                thickness: 30,
            },
            groundY: 580,
            roofTopY: 280,
        },

        colors: {
            skyTop: 0x00BCD4,
            skyBottom: 0x4DD0E1,
            mountain: [0x66BB6A, 0x4CAF50, 0x388E3C],
            city: [0x607D8B, 0x78909C, 0xB0BEC5, 0x455A64],
            vegetation: [0x388E3C, 0x4CAF50, 0x2E7D32, 0x81C784],
            water: [0x00838F, 0x00ACC1, 0x26C6DA],
            ground: [0x4CAF50, 0x66BB6A],
            sand: [0xFFD54F, 0xFFECB3, 0xFFC107],
            stadiumOuter: 0xE0E0E0,
            stadiumInner: 0xF5F5F5,
            stadiumShadow: 0x9E9E9E,
            field: [0x1B5E20, 0x2E7D32, 0x388E3C],
            crowd: [0xFDD835, 0x43A047, 0x1E88E5, 0xE53935, 0xFFFFFF],
            track: 0xBF360C,
            arch: 0xBDBDBD,
            archHighlight: 0xE0E0E0,
        },

        parallax: [
            { type: 'sky',        speed: 0.0 },
            { type: 'clouds',     speed: 0.3 },
            { type: 'mountain',   speed: 0.5 },
            { type: 'city',       speed: 1.0 },
            { type: 'vegetation', speed: 1.5 },
            { type: 'ground',     speed: 2.0 },
        ],

        scoreThresholds: [6000, 18000, 35000],
    },

    // ── Level 3: Ellis Park, Johannesburg ──
    {
        id: 'ellis',
        name: 'ELLIS PARK',
        city: 'JOHANNESBURG',
        subtitle: 'Highveld Skyline',
        hazardText: 'Thin Highveld air • Reduced lift • Tall light towers',
        unlocked: true,

        gravity: 450,           // Higher gravity to simulate thin air
        thrustPower: -280,      // Less thrust in thin air
        windStrength: 1.5,
        windFrequency: 0.3,
        scrollSpeed: 230,
        airDensity: 0.8,        // Highveld = less lift

        stadium: {
            approachX: 3000,
            centerX: 3800,
            width: 950,
            leftWall:  { x: -475, y: 0, w: 90, h: 280 },
            rightWall: { x: 385,  y: 0, w: 90, h: 280 },
            roof:      { x: -475, y: 240, w: 200, h: 40 },
            roofRight: { x: 275,  y: 240, w: 200, h: 40 },
            // Tall light towers
            towers: [
                { x: -500, y: 0, w: 20, h: 350 },
                { x: 480,  y: 0, w: 20, h: 350 },
            ],
            groundY: 580,
            roofTopY: 260,
        },

        colors: {
            skyTop: 0x64B5F6,
            skyBottom: 0xBBDEFB,
            mountain: [0xBCAAA4, 0xD7CCC8, 0xA1887F],  // mine dumps
            city: [0x455A64, 0x546E7A, 0x78909C, 0x37474F],
            vegetation: [0x689F38, 0x558B2F, 0x7CB342],
            water: [],
            ground: [0x8D6E63, 0x795548],  // dry highveld
            sand: [0xD7CCC8, 0xBCAAA4],
            stadiumOuter: 0xBDBDBD,
            stadiumInner: 0xE0E0E0,
            stadiumShadow: 0x757575,
            field: [0x1B5E20, 0x2E7D32, 0x33691E],
            crowd: [0xFDD835, 0x000000, 0xE53935, 0x1E88E5, 0xFFFFFF],
            track: 0x795548,
        },

        parallax: [
            { type: 'sky',        speed: 0.0 },
            { type: 'clouds',     speed: 0.2 },
            { type: 'mountain',   speed: 0.4 },
            { type: 'city',       speed: 0.9 },
            { type: 'vegetation', speed: 1.4 },
            { type: 'ground',     speed: 2.0 },
        ],

        scoreThresholds: [7000, 20000, 40000],
    },

    // ── Level 4: Loftus Versfeld, Pretoria ──
    {
        id: 'loftus',
        name: 'LOFTUS VERSFELD',
        city: 'PRETORIA',
        subtitle: 'Jacaranda City',
        hazardText: 'High grandstands • Tight entry & exit corridors',
        unlocked: true,

        gravity: 430,
        thrustPower: -300,
        windStrength: 1.2,
        windFrequency: 0.3,
        scrollSpeed: 240,
        airDensity: 0.85,

        stadium: {
            approachX: 3000,
            centerX: 3700,
            width: 850,
            // Tall, enclosed grandstands = tighter gap
            leftWall:  { x: -425, y: 0, w: 100, h: 310 },
            rightWall: { x: 325,  y: 0, w: 100, h: 310 },
            roof:      { x: -425, y: 260, w: 250, h: 50 },
            roofRight: { x: 175,  y: 260, w: 250, h: 50 },
            groundY: 580,
            roofTopY: 240,
        },

        colors: {
            skyTop: 0x42A5F5,
            skyBottom: 0x90CAF9,
            mountain: [0x7E57C2, 0x9575CD, 0xB39DDB], // Jacaranda trees
            city: [0x8D6E63, 0xA1887F, 0x6D4C41, 0x795548],
            vegetation: [0x7E57C2, 0x9575CD, 0x4CAF50, 0x66BB6A], // Purple jacarandas + green
            water: [],
            ground: [0x689F38, 0x558B2F],
            sand: [],
            stadiumOuter: 0xA1887F,
            stadiumInner: 0xD7CCC8,
            stadiumShadow: 0x6D4C41,
            field: [0x1B5E20, 0x2E7D32, 0x388E3C],
            crowd: [0x1565C0, 0xFFFFFF, 0xE53935, 0xFDD835],
            track: 0x6D4C41,
        },

        parallax: [
            { type: 'sky',        speed: 0.0 },
            { type: 'clouds',     speed: 0.2 },
            { type: 'mountain',   speed: 0.5 },
            { type: 'city',       speed: 1.0 },
            { type: 'vegetation', speed: 1.5 },
            { type: 'ground',     speed: 2.0 },
        ],

        scoreThresholds: [8000, 22000, 45000],
    },
];
