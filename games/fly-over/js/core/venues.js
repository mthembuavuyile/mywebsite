/* ==========================================================================
   VENUES — Single Source of Truth for Stadium Metadata & Flight Corridors
   Shared across 3D Flight Sim, 3D Stadium Explorer, and 2D Retro Arcade
   ========================================================================== */

(function () {
    const VENUES = {
        dhl: {
            id: 'dhl',
            name: 'DHL Stadium',
            city: 'Cape Town',
            province: 'Western Cape',
            capacity: '55,000',
            subtitle: 'Table Mountain & Atlantic Ocean Approach',
            hazardText: 'DIVE REQUIRED! Plunge below 25m into the stadium bowl or fail.',
            unlocked: true,
            
            // Architectural Dimensions (Meters in 3D WebGL space)
            pitchLength: 210,
            pitchWidth: 130,
            bowlHeight: 38,
            roofHeight: 42,
            tiers: 20,
            growth: 0.55,
            
            // Team & Lighting Palettes
            palette: [0x002f6c, 0xffd100, 0xffffff, 0x0055a5], // Stormers / WP Blue & Gold
            paletteHex: ['#002f6c', '#ffd100', '#ffffff', '#0055a5'],
            skyColor: 0x0b1424,
            fogColor: 0x0b1424,
            sunColor: 0xfff2df,
            windFactor: 1.4,
            
            // Flight Coordinates
            startPos: { x: 0, y: 180, z: 2200 },
            targetZ: -100,
            exitZ: -1550,
            roofY: 38,
            fieldY: 4,
            thresholds: [15000, 35000, 65000],
            
            // Flight Stunt Gates
            gates: [
                { id: 1, pos: { x: 0, y: 170, z: 1800 }, label: 'ATLANTIC DESCENT', radius: 35, required: false },
                { id: 2, pos: { x: 0, y: 125, z: 1200 }, label: 'GLIDESLOPE INTERCEPT', radius: 30, required: false },
                { id: 3, pos: { x: 0, y: 75, z: 550 },   label: 'STADIUM LINE-UP', radius: 25, required: false },
                { id: 4, pos: { x: 0, y: 34, z: 60 },    label: '⚡ BOWL DIVE ENTRY ⚡', radius: 22, required: true },
                { id: 5, pos: { x: 0, y: 10, z: -100 },  label: '🔥 APEX LOW SKIM 🔥', radius: 18, required: true },
                { id: 6, pos: { x: 0, y: 55, z: -360 },  label: '🚀 PULL UP & CLIMB 🚀', radius: 25, required: true },
                { id: 7, pos: { x: 0, y: 75, z: -850 },  label: '🛫 AIRFIELD APPROACH 🛫', radius: 32, required: false }
            ],

            // 2D Retro Scrolling Journey Specifics
            retro: {
                gravity: 420,
                thrustPower: -320,
                scrollSpeed: 240,
                journeyDistance: 4500, // Total horizontal world width
                runwayLength: 1200,    // Takeoff phase
                approachStart: 1200,   // Outside city/mountain approach
                stadiumEntry: 2800,    // Entering the bowl
                stadiumExit: 3900,     // Clearing far grandstand
                climboutExit: 4500,    // Victory
                skyGradient: ['#0f2027', '#203a43', '#2c5364'],
                landmark: 'Table Mountain'
            }
        },

        moses: {
            id: 'moses',
            name: 'Moses Mabhida Stadium',
            city: 'Durban',
            province: 'KwaZulu-Natal',
            capacity: '56,000',
            subtitle: 'Beachfront 106m Iconic Arch Fly-Through',
            hazardText: 'Fly UNDER the grand arch and skim the pitch for 3-star rating!',
            unlocked: true,

            pitchLength: 215,
            pitchWidth: 132,
            bowlHeight: 36,
            roofHeight: 40,
            archY: 78,
            tiers: 20,
            growth: 0.58,

            palette: [0x000000, 0xffd100, 0xffffff, 0x007a3d], // Sharks / Coastal Black, Gold & Green
            paletteHex: ['#000000', '#ffd100', '#ffffff', '#007a3d'],
            skyColor: 0x071526,
            fogColor: 0x071526,
            sunColor: 0xfff6eb,
            windFactor: 1.1,

            startPos: { x: 0, y: 180, z: 2200 },
            targetZ: -100,
            exitZ: -1550,
            roofY: 36,
            fieldY: 4,
            thresholds: [18000, 40000, 75000],

            gates: [
                { id: 1, pos: { x: 0, y: 170, z: 1800 }, label: 'COASTAL DESCENT', radius: 35, required: false },
                { id: 2, pos: { x: 0, y: 120, z: 1200 }, label: 'BEACH GLIDE', radius: 30, required: false },
                { id: 3, pos: { x: 0, y: 70, z: 550 },   label: 'ARCH ALIGNMENT', radius: 25, required: false },
                { id: 4, pos: { x: 0, y: 32, z: 60 },    label: '⚡ UNDER-ARCH DIVE ⚡', radius: 20, required: true },
                { id: 5, pos: { x: 0, y: 10, z: -100 },  label: '🔥 APEX LOW PASS 🔥', radius: 18, required: true },
                { id: 6, pos: { x: 0, y: 55, z: -360 },  label: '🚀 EXIT CLIMB 🚀', radius: 25, required: true },
                { id: 7, pos: { x: 0, y: 75, z: -850 },  label: '🛫 AIRFIELD GLIDESLOPE 🛫', radius: 32, required: false }
            ],

            retro: {
                gravity: 400,
                thrustPower: -310,
                scrollSpeed: 230,
                journeyDistance: 4500,
                runwayLength: 1200,
                approachStart: 1200,
                stadiumEntry: 2800,
                stadiumExit: 3900,
                climboutExit: 4500,
                hasArch: true,
                skyGradient: ['#051923', '#003554', '#006494'],
                landmark: 'Golden Mile Oceanfront'
            }
        },

        ellis: {
            id: 'ellis',
            name: 'Emirates Airline Park (Ellis Park)',
            city: 'Johannesburg',
            province: 'Gauteng',
            capacity: '62,567',
            subtitle: 'Highveld Thin Air & Light Masts Corridor',
            hazardText: 'Thin air requires higher throttle. Dodge vertical floodlight towers.',
            unlocked: true,

            pitchLength: 210,
            pitchWidth: 135,
            bowlHeight: 44,
            roofHeight: 48,
            tiers: 20,
            growth: 0.52,

            palette: [0xd32f2f, 0xffffff, 0xb71c1c, 0x212121], // Lions Red, White & Charcoal
            paletteHex: ['#d32f2f', '#ffffff', '#b71c1c', '#212121'],
            skyColor: 0x16131c,
            fogColor: 0x16131c,
            sunColor: 0xffedd5,
            windFactor: 0.9,

            startPos: { x: 0, y: 180, z: 2200 },
            targetZ: -100,
            exitZ: -1550,
            roofY: 44,
            fieldY: 4,
            thresholds: [20000, 45000, 80000],

            gates: [
                { id: 1, pos: { x: 0, y: 170, z: 1800 }, label: 'HIGHVELD APPROACH', radius: 35, required: false },
                { id: 2, pos: { x: 0, y: 125, z: 1200 }, label: 'CITY DESCENT', radius: 30, required: false },
                { id: 3, pos: { x: 0, y: 80, z: 550 },   label: 'TOWER CORRIDOR', radius: 25, required: false },
                { id: 4, pos: { x: 0, y: 38, z: 60 },    label: '⚡ BOWL PLUNGE ⚡', radius: 22, required: true },
                { id: 5, pos: { x: 0, y: 12, z: -100 },  label: '🔥 PITCH APEX 🔥', radius: 18, required: true },
                { id: 6, pos: { x: 0, y: 60, z: -360 },  label: '🚀 FULL POWER CLIMB 🚀', radius: 25, required: true },
                { id: 7, pos: { x: 0, y: 75, z: -850 },  label: '🛫 METRO AIRPORT 🛫', radius: 32, required: false }
            ],

            retro: {
                gravity: 430,
                thrustPower: -330,
                scrollSpeed: 250,
                journeyDistance: 4500,
                runwayLength: 1200,
                approachStart: 1200,
                stadiumEntry: 2800,
                stadiumExit: 3900,
                climboutExit: 4500,
                skyGradient: ['#1a0f1e', '#2e1c3b', '#482d5a'],
                landmark: 'Johannesburg Skyline & Mine Dumps'
            }
        },

        loftus: {
            id: 'loftus',
            name: 'Loftus Versfeld Stadium',
            city: 'Pretoria',
            province: 'Gauteng',
            capacity: '51,762',
            subtitle: 'Jacaranda Valley Canyon Run',
            hazardText: 'Narrow airspace between towering steep grandstands.',
            unlocked: true,

            pitchLength: 205,
            pitchWidth: 128,
            bowlHeight: 46,
            roofHeight: 50,
            tiers: 20,
            growth: 0.50,

            palette: [0x1565c0, 0x90caf9, 0xffffff, 0x0d47a1], // Bulls Blue & White
            paletteHex: ['#1565c0', '#90caf9', '#ffffff', '#0d47a1'],
            skyColor: 0x0a1420,
            fogColor: 0x0a1420,
            sunColor: 0xfff3e0,
            windFactor: 0.8,

            startPos: { x: 0, y: 180, z: 2200 },
            targetZ: -100,
            exitZ: -1550,
            roofY: 46,
            fieldY: 4,
            thresholds: [22000, 50000, 85000],

            gates: [
                { id: 1, pos: { x: 0, y: 170, z: 1800 }, label: 'VALLEY ENTRY', radius: 35, required: false },
                { id: 2, pos: { x: 0, y: 125, z: 1200 }, label: 'JACARANDA GLIDE', radius: 30, required: false },
                { id: 3, pos: { x: 0, y: 80, z: 550 },   label: 'CANYON LINE-UP', radius: 25, required: false },
                { id: 4, pos: { x: 0, y: 38, z: 60 },    label: '⚡ GRANDSTAND DIVE ⚡', radius: 20, required: true },
                { id: 5, pos: { x: 0, y: 12, z: -100 },  label: '🔥 APEX PASS 🔥', radius: 18, required: true },
                { id: 6, pos: { x: 0, y: 60, z: -360 },  label: '🚀 SKY CLIMB 🚀', radius: 25, required: true },
                { id: 7, pos: { x: 0, y: 75, z: -850 },  label: '🛫 AIR BASE RUNWAY 🛫', radius: 32, required: false }
            ],

            retro: {
                gravity: 410,
                thrustPower: -320,
                scrollSpeed: 235,
                journeyDistance: 4500,
                runwayLength: 1200,
                approachStart: 1200,
                stadiumEntry: 2800,
                stadiumExit: 3900,
                climboutExit: 4500,
                skyGradient: ['#0f172a', '#1e293b', '#334155'],
                landmark: 'Union Buildings & Jacaranda Trees'
            }
        }
    };

    window.VENUES = VENUES;
    window.VENUE_KEYS = Object.keys(VENUES);
})();
