/* ==========================================================================
   Procedural 16-Bit Pixel-Art Sprite & Environment Generator
   Generates rich, authentic arcade textures at runtime using Phaser Graphics.
   ========================================================================== */

class SpriteGenerator {
    // ── Primitive Helpers ──
    static px(g, x, y, color, size = 1) {
        g.fillStyle(color);
        g.fillRect(x, y, size, size);
    }

    static rect(g, x, y, w, h, color) {
        g.fillStyle(color);
        g.fillRect(x, y, w, h);
    }

    static pick(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    static lerpColor(c1, c2, t) {
        const r1 = (c1 >> 16) & 0xFF, g1 = (c1 >> 8) & 0xFF, b1 = c1 & 0xFF;
        const r2 = (c2 >> 16) & 0xFF, g2 = (c2 >> 8) & 0xFF, b2 = c2 & 0xFF;
        const r = Math.floor(r1 + (r2 - r1) * t);
        const g = Math.floor(g1 + (g2 - g1) * t);
        const b = Math.floor(b1 + (b2 - b1) * t);
        return (r << 16) | (g << 8) | b;
    }

    // ════════════════════════════════════════════════════════════════════════
    //  1. EMBRAER JET SPRITES (Normal, Thrusting, & Diving)
    // ════════════════════════════════════════════════════════════════════════
    static generateJet(scene) {
        const W = 96, H = 36;

        // Colors
        const BODY_TOP = 0xF5F7FA;
        const BODY_MID = 0xCFD8DC;
        const BELLY = 0x263238;
        const WINDOW = 0x00E5FF;
        const WINDOW_FRAME = 0x37474F;
        const GREEN = 0x007749;
        const GOLD = 0xFFB612;
        const RED = 0xD32F2F;
        const ENGINE_METAL = 0x78909C;
        const ENGINE_INTAKE = 0x1A2327;

        // Normal Cruise Jet
        {
            const g = scene.make.graphics({ add: false });
            // Fuselage
            g.fillStyle(BODY_TOP);
            g.fillRoundedRect(18, 12, 60, 11, 4);
            // Nose Cone
            g.beginPath();
            g.moveTo(76, 13);
            g.lineTo(92, 18);
            g.lineTo(76, 23);
            g.closePath();
            g.fill();
            g.fillStyle(BELLY);
            g.fillRect(86, 17, 6, 2); // Black radome tip

            // Belly Shadow
            g.fillStyle(BELLY);
            g.fillRect(24, 20, 50, 4);

            // Green & Gold Springbok Speedstripe
            g.fillStyle(GREEN);
            g.fillRect(20, 17, 56, 2);
            g.fillStyle(GOLD);
            g.fillRect(22, 19, 52, 1);

            // Cockpit Windows
            g.fillStyle(WINDOW_FRAME);
            g.fillRect(72, 13, 8, 4);
            g.fillStyle(WINDOW);
            g.fillRect(73, 14, 3, 2);
            g.fillRect(77, 14, 2, 2);

            // Cabin Windows
            g.fillStyle(WINDOW);
            for (let wx = 30; wx < 68; wx += 5) {
                g.fillRect(wx, 15, 2, 2);
            }

            // Tail Fin (Swept back with SA flag colors)
            g.fillStyle(BODY_TOP);
            g.beginPath();
            g.moveTo(12, 14);
            g.lineTo(4, 2);
            g.lineTo(16, 2);
            g.lineTo(24, 14);
            g.closePath();
            g.fill();
            // Tail Livery
            g.fillStyle(GREEN);
            g.fillRect(6, 4, 8, 3);
            g.fillStyle(GOLD);
            g.fillRect(8, 7, 7, 2);
            g.fillStyle(RED);
            g.fillRect(10, 9, 6, 2);

            // Main Wings (Swept back)
            g.fillStyle(BODY_MID);
            g.beginPath();
            g.moveTo(42, 18);
            g.lineTo(30, 29);
            g.lineTo(39, 29);
            g.lineTo(54, 18);
            g.closePath();
            g.fill();
            // Wingtip green nav light
            g.fillStyle(0x00E676);
            g.fillRect(29, 28, 2, 2);

            // Engine Pod
            g.fillStyle(ENGINE_METAL);
            g.fillRoundedRect(36, 21, 18, 6, 2);
            g.fillStyle(ENGINE_INTAKE);
            g.fillRect(52, 22, 2, 4);

            g.generateTexture('jet', W, H);
            g.destroy();
        }

        // Thrusting Jet (With Afterburner Flame)
        {
            const g = scene.make.graphics({ add: false });
            // Draw base jet identical to cruise
            g.fillStyle(BODY_TOP);
            g.fillRoundedRect(18, 12, 60, 11, 4);
            g.beginPath();
            g.moveTo(76, 13);
            g.lineTo(92, 18);
            g.lineTo(76, 23);
            g.closePath();
            g.fill();
            g.fillStyle(BELLY);
            g.fillRect(86, 17, 6, 2);
            g.fillRect(24, 20, 50, 4);
            g.fillStyle(GREEN);
            g.fillRect(20, 17, 56, 2);
            g.fillStyle(GOLD);
            g.fillRect(22, 19, 52, 1);
            g.fillStyle(WINDOW_FRAME);
            g.fillRect(72, 13, 8, 4);
            g.fillStyle(WINDOW);
            g.fillRect(73, 14, 3, 2);
            g.fillRect(77, 14, 2, 2);
            g.fillStyle(WINDOW);
            for (let wx = 30; wx < 68; wx += 5) {
                g.fillRect(wx, 15, 2, 2);
            }
            g.fillStyle(BODY_TOP);
            g.beginPath();
            g.moveTo(12, 14);
            g.lineTo(4, 2);
            g.lineTo(16, 2);
            g.lineTo(24, 14);
            g.closePath();
            g.fill();
            g.fillStyle(GREEN);
            g.fillRect(6, 4, 8, 3);
            g.fillStyle(GOLD);
            g.fillRect(8, 7, 7, 2);
            g.fillStyle(RED);
            g.fillRect(10, 9, 6, 2);
            g.fillStyle(BODY_MID);
            g.beginPath();
            g.moveTo(42, 18);
            g.lineTo(30, 29);
            g.lineTo(39, 29);
            g.lineTo(54, 18);
            g.closePath();
            g.fill();
            g.fillStyle(0x00E676);
            g.fillRect(29, 28, 2, 2);
            g.fillStyle(ENGINE_METAL);
            g.fillRoundedRect(36, 21, 18, 6, 2);
            g.fillStyle(ENGINE_INTAKE);
            g.fillRect(52, 22, 2, 4);

            // Powerful Afterburner Plume
            g.fillStyle(0xFFD600);
            g.beginPath();
            g.moveTo(36, 22);
            g.lineTo(14, 24);
            g.lineTo(36, 26);
            g.closePath();
            g.fill();
            g.fillStyle(0xFF3D00);
            g.beginPath();
            g.moveTo(36, 23);
            g.lineTo(20, 24);
            g.lineTo(36, 25);
            g.closePath();
            g.fill();
            g.fillStyle(0xFFFFFF);
            g.fillRect(32, 23, 4, 2);

            g.generateTexture('jet_thrust', W, H);
            g.destroy();
        }
    }

    // ════════════════════════════════════════════════════════════════════════
    //  2. GLOWING STUNT GATES (Approach, Glideslope, Dive, Low Pass, Climb)
    // ════════════════════════════════════════════════════════════════════════
    static generateGates(scene) {
        const gateTypes = [
            { key: 'gate_normal', color: 0x00E5FF, ringColor: 0x00B0FF, label: 'G A T E' },
            { key: 'gate_dive', color: 0xFFD600, ringColor: 0xFF9100, label: 'D I V E' },
            { key: 'gate_apex', color: 0x00E676, ringColor: 0x00C853, label: 'S K I M' }
        ];

        gateTypes.forEach(gt => {
            const W = 40, H = 140;
            const g = scene.make.graphics({ add: false });

            // Glowing vertical neon pylons
            g.fillStyle(gt.color, 0.4);
            g.fillRoundedRect(2, 4, 12, H - 8, 4);
            g.fillRoundedRect(W - 14, 4, 12, H - 8, 4);

            g.fillStyle(gt.color, 0.9);
            g.fillRoundedRect(5, 6, 6, H - 12, 3);
            g.fillRoundedRect(W - 11, 6, 6, H - 12, 3);

            // White neon core
            g.fillStyle(0xFFFFFF, 1.0);
            g.fillRect(7, 10, 2, H - 20);
            g.fillRect(W - 9, 10, 2, H - 20);

            // Top crossbar with chevron
            g.fillStyle(gt.ringColor);
            g.fillRect(8, 6, W - 16, 6);
            g.fillStyle(0xFFFFFF);
            g.fillRect(W / 2 - 2, 7, 4, 4);

            // Pulsing target indicator in center
            g.fillStyle(gt.color, 0.7);
            g.fillCircle(W / 2, H / 2, 10);
            g.fillStyle(0xFFFFFF, 0.9);
            g.fillCircle(W / 2, H / 2, 4);

            g.generateTexture(gt.key, W, H);
            g.destroy();
        });
    }

    // ════════════════════════════════════════════════════════════════════════
    //  3. PARTICLE TEXTURES
    // ════════════════════════════════════════════════════════════════════════
    static generateParticles(scene) {
        // White smoke
        let g = scene.make.graphics({ add: false });
        g.fillStyle(0xFFFFFF, 0.8);
        g.fillCircle(5, 5, 5);
        g.generateTexture('smoke_white', 10, 10);
        g.destroy();

        // Colored smoke for hype trails (Springbok colors)
        const smokeColors = [0x007749, 0xFFB612, 0xDE3831, 0x001489, 0xFFFFFF];
        smokeColors.forEach((col, i) => {
            g = scene.make.graphics({ add: false });
            g.fillStyle(col, 0.85);
            g.fillCircle(5, 5, 5);
            g.generateTexture('smoke_' + i, 10, 10);
            g.destroy();
        });

        // Exhaust spark
        g = scene.make.graphics({ add: false });
        g.fillStyle(0xFFD600);
        g.fillRect(0, 0, 4, 4);
        g.fillStyle(0xFF6D00);
        g.fillRect(1, 1, 2, 2);
        g.generateTexture('exhaust', 4, 4);
        g.destroy();

        // Gate chime flash star
        g = scene.make.graphics({ add: false });
        g.fillStyle(0xFFD600);
        g.fillRect(3, 0, 2, 8);
        g.fillRect(0, 3, 8, 2);
        g.fillStyle(0xFFFFFF);
        g.fillRect(3, 3, 2, 2);
        g.generateTexture('star', 8, 8);
        g.destroy();
    }

    // ════════════════════════════════════════════════════════════════════════
    //  4. CLOUD TEXTURES
    // ════════════════════════════════════════════════════════════════════════
    static generateClouds(scene) {
        for (let c = 0; c < 3; c++) {
            const W = 120 + c * 40;
            const H = 40 + c * 15;
            const g = scene.make.graphics({ add: false });

            g.fillStyle(0xFFFFFF, 0.9);
            g.fillCircle(W * 0.3, H * 0.55, H * 0.4);
            g.fillCircle(W * 0.5, H * 0.45, H * 0.45);
            g.fillCircle(W * 0.7, H * 0.55, H * 0.38);
            g.fillRoundedRect(W * 0.15, H * 0.5, W * 0.7, H * 0.45, 8);

            // Shading underside
            g.fillStyle(0xCFD8DC, 0.5);
            g.fillRoundedRect(W * 0.2, H * 0.75, W * 0.6, H * 0.2, 4);

            g.generateTexture('cloud_' + c, W, H);
            g.destroy();
        }
    }

    // ════════════════════════════════════════════════════════════════════════
    //  5. AUTHENTIC 16-BIT STADIUM BOWLS
    //     Sweeping curved stands, colored seats, waving crowd, floodlights!
    // ════════════════════════════════════════════════════════════════════════
    static generateStadium(scene, levelIndex) {
        const level = window.LEVELS[levelIndex];
        const id = level.id;
        const W = 1600; // Wide stadium width for a complete flyover experience
        const H = 420;  // Stadium height
        const g = scene.make.graphics({ add: false });

        // Stadium Colors
        const SEAT_COLORS = {
            dhl: [0x002F6C, 0xFFD100, 0x0055A5, 0xFFFFFF],    // Stormers Blue & Yellow
            moses: [0x000000, 0xFFD100, 0x007A3D, 0xFFFFFF],  // Sharks Black, Gold & Green
            ellis: [0xD32F2F, 0xB71C1C, 0xFFFFFF, 0x212121],  // Lions Red & White
            loftus: [0x1565C0, 0x0D47A1, 0x90CAF9, 0xFFFFFF]  // Bulls Sky Blue & Navy
        }[id] || [0x002F6C, 0xFFD100];

        const ROOF_COLOR = 0x263238;
        const ROOF_GIRDER = 0x455A64;
        const PITCH_TOP = 0x2E7D32;
        const PITCH_STRIPE = 0x388E3C;
        const CONCRETE_BASE = 0x546E7A;
        const CONCRETE_LIGHT = 0x78909C;

        // Ground Foundation
        g.fillStyle(0x1B2428);
        g.fillRect(0, H - 40, W, 40);

        // ── LEFT GRANDSTAND BOWL (Curved, stepped seating tiers) ──
        const bowlWidth = 340;
        const pitchLeft = bowlWidth + 60;
        const pitchRight = W - bowlWidth - 60;
        const pitchWidth = pitchRight - pitchLeft;

        // Outer concrete shell
        g.fillStyle(CONCRETE_BASE);
        g.beginPath();
        g.moveTo(0, H - 40);
        g.lineTo(bowlWidth + 30, H - 40);
        g.lineTo(0, H - 260);
        g.closePath();
        g.fill();

        // Left Tiers (3 distinct tiers)
        for (let tier = 0; tier < 3; tier++) {
            const ty = H - 70 - tier * 60;
            const tx = 20 + tier * 70;
            const tw = bowlWidth - tier * 60;
            const th = 48;

            g.fillStyle(CONCRETE_LIGHT);
            g.fillRect(tx, ty, tw, th);
            g.fillStyle(CONCRETE_BASE);
            g.fillRect(tx, ty + th - 4, tw, 4);

            // Crowd & Seats in rows
            for (let r = 0; r < 4; r++) {
                const sy = ty + 4 + r * 10;
                for (let sx = tx + 6; sx < tx + tw - 6; sx += 7) {
                    const seatCol = this.pick(SEAT_COLORS);
                    this.rect(g, sx, sy, 5, 4, seatCol);
                    // Cheering spectator face / hands
                    if (Math.random() > 0.3) {
                        this.px(g, sx + 2, sy - 2, 0xFFCC80, 2);
                        // Springbok green jersey
                        if (Math.random() > 0.4) this.px(g, sx + 1, sy, 0x007749, 3);
                    }
                }
            }
        }

        // ── RIGHT GRANDSTAND BOWL (Mirrored) ──
        g.fillStyle(CONCRETE_BASE);
        g.beginPath();
        g.moveTo(W, H - 40);
        g.lineTo(W - bowlWidth - 30, H - 40);
        g.lineTo(W, H - 260);
        g.closePath();
        g.fill();

        for (let tier = 0; tier < 3; tier++) {
            const ty = H - 70 - tier * 60;
            const tx = pitchRight + 30 + tier * 20;
            const tw = bowlWidth - tier * 60;
            const th = 48;

            g.fillStyle(CONCRETE_LIGHT);
            g.fillRect(tx, ty, tw, th);
            g.fillStyle(CONCRETE_BASE);
            g.fillRect(tx, ty + th - 4, tw, 4);

            for (let r = 0; r < 4; r++) {
                const sy = ty + 4 + r * 10;
                for (let sx = tx + 6; sx < tx + tw - 6; sx += 7) {
                    const seatCol = this.pick(SEAT_COLORS);
                    this.rect(g, sx, sy, 5, 4, seatCol);
                    if (Math.random() > 0.3) {
                        this.px(g, sx + 2, sy - 2, 0xFFCC80, 2);
                        if (Math.random() > 0.4) this.px(g, sx + 1, sy, 0x007749, 3);
                    }
                }
            }
        }

        // ── CENTER PITCH (Lush striped grass & field markings) ──
        const pitchY = H - 55;
        const pitchH = 26;
        g.fillStyle(PITCH_TOP);
        g.fillRect(pitchLeft, pitchY, pitchWidth, pitchH);

        // Alternating mow stripes
        for (let sx = pitchLeft; sx < pitchRight; sx += 40) {
            g.fillStyle(PITCH_STRIPE);
            g.fillRect(sx, pitchY, 20, pitchH);
        }

        // White boundary & pitch lines
        g.fillStyle(0xFFFFFF);
        g.fillRect(pitchLeft, pitchY, pitchWidth, 2); // Sideline
        g.fillRect(pitchLeft + pitchWidth / 2 - 1, pitchY, 2, pitchH); // Halfway line
        g.fillRect(pitchLeft + 60, pitchY, 2, pitchH); // 22m line left
        g.fillRect(pitchRight - 60, pitchY, 2, pitchH); // 22m line right

        // Rugby H-Posts
        // Left Goalposts
        g.fillStyle(0xFFFFFF);
        g.fillRect(pitchLeft + 80, pitchY - 70, 3, 70);
        g.fillRect(pitchLeft + 98, pitchY - 70, 3, 70);
        g.fillRect(pitchLeft + 80, pitchY - 35, 21, 3);
        // Post padding (Yellow protector pads)
        g.fillStyle(0xFFD600);
        g.fillRect(pitchLeft + 79, pitchY - 14, 5, 14);
        g.fillRect(pitchLeft + 97, pitchY - 14, 5, 14);

        // Right Goalposts
        g.fillStyle(0xFFFFFF);
        g.fillRect(pitchRight - 101, pitchY - 70, 3, 70);
        g.fillRect(pitchRight - 83, pitchY - 70, 3, 70);
        g.fillRect(pitchRight - 101, pitchY - 35, 21, 3);
        g.fillStyle(0xFFD600);
        g.fillRect(pitchRight - 102, pitchY - 14, 5, 14);
        g.fillRect(pitchRight - 84, pitchY - 14, 5, 14);

        // LED Pitch Perimeter Advertising Ribbon
        g.fillStyle(0x000000);
        g.fillRect(pitchLeft, pitchY - 6, pitchWidth, 6);
        g.fillStyle(0x00E676);
        for (let bx = pitchLeft + 10; bx < pitchRight - 10; bx += 80) {
            g.fillRect(bx, pitchY - 5, 60, 4);
        }

        // ── ROOF CANOPY & STEEL ARCHITECTURE ──
        // Left Canopy
        g.fillStyle(ROOF_COLOR);
        g.beginPath();
        g.moveTo(0, H - 280);
        g.lineTo(bowlWidth + 40, H - 240);
        g.lineTo(bowlWidth + 30, H - 225);
        g.lineTo(0, H - 265);
        g.closePath();
        g.fill();

        // Girders
        g.fillStyle(ROOF_GIRDER);
        for (let gx = 40; gx < bowlWidth + 30; gx += 50) {
            g.fillRect(gx, H - 275, 4, 35);
        }

        // Right Canopy
        g.fillStyle(ROOF_COLOR);
        g.beginPath();
        g.moveTo(W, H - 280);
        g.lineTo(W - bowlWidth - 40, H - 240);
        g.lineTo(W - bowlWidth - 30, H - 225);
        g.lineTo(W, H - 265);
        g.closePath();
        g.fill();

        for (let gx = W - bowlWidth - 20; gx < W - 20; gx += 50) {
            g.fillRect(gx, H - 275, 4, 35);
        }

        // ── FLOODLIGHT TOWERS & BEAMS ──
        [-20, W - 20].forEach(fx => {
            // Pylon
            g.fillStyle(0x37474F);
            g.fillRect(fx > 0 ? fx - 10 : 10, 20, 14, H - 60);
            // Light Grid
            g.fillStyle(0x263238);
            g.fillRect(fx > 0 ? fx - 25 : 0, 10, 44, 24);
            // Glowing Lamps
            g.fillStyle(0xFFF9C4);
            for (let lx = 0; lx < 4; lx++) {
                for (let ly = 0; ly < 2; ly++) {
                    g.fillRect((fx > 0 ? fx - 21 : 4) + lx * 10, 14 + ly * 8, 7, 5);
                }
            }
        });

        // ── VENUE SPECIAL FEATURES ──
        if (id === 'moses') {
            // Durban Iconic 106m White Steel Arch
            const cx = W / 2;
            const archY0 = H - 55;
            const archTopY = 30;
            const spanX = W * 0.44;

            // Thick Arch
            g.fillStyle(0xFFFFFF);
            for (let t = -1; t <= 1; t += 0.005) {
                const ax = cx + t * spanX;
                const ay = archTopY + (1 - (1 - t * t)) * (archY0 - archTopY);
                g.fillRect(ax - 5, ay, 10, 8);
                // Suspension cables down to pitch
                if (Math.abs(t) < 0.8 && Math.floor(t * 100) % 8 === 0) {
                    this.rect(g, ax, ay + 8, 1, archY0 - ay, 0xE0E0E0);
                }
            }
        }

        g.generateTexture(`stadium_${id}`, W, H);
        g.destroy();
    }

    // ════════════════════════════════════════════════════════════════════════
    //  6. HIGH-POLISH BACKGROUND PANORAMAS (Table Mountain, Skylines, etc.)
    // ════════════════════════════════════════════════════════════════════════
    static generateBackground(scene, levelIndex) {
        const level = window.LEVELS[levelIndex];
        const id = level.id;
        const W = 1600;
        const H = 720;
        const g = scene.make.graphics({ add: false });

        // Sky gradient
        const skyTop = level.colors.skyTop || 0x1E88E5;
        const skyBot = level.colors.skyBottom || 0x90CAF9;
        for (let y = 0; y < H; y++) {
            const t = y / H;
            g.fillStyle(this.lerpColor(skyTop, skyBot, t));
            g.fillRect(0, y, W, 1);
        }

        // Distant Mountains / Horizon
        const baseY = H * 0.76;

        if (id === 'dhl') {
            // Authentic Table Mountain Silhouette
            const mtnLeft = W * 0.15;
            const flatWidth = W * 0.55;
            const mtnRight = mtnLeft + flatWidth;
            const mtnTop = baseY - 240;

            // Mountain Body
            g.fillStyle(0x455A64);
            g.beginPath();
            g.moveTo(mtnLeft - 120, baseY);
            g.lineTo(mtnLeft - 20, mtnTop + 40); // Devil's Peak
            g.lineTo(mtnLeft + 20, mtnTop);
            g.lineTo(mtnRight - 40, mtnTop); // Flat Top
            g.lineTo(mtnRight + 60, mtnTop + 60); // Lion's Head
            g.lineTo(mtnRight + 160, baseY);
            g.closePath();
            g.fill();

            // Sandstone cliff face shading
            g.fillStyle(0x37474F);
            for (let x = mtnLeft; x < mtnRight - 40; x += 16) {
                const cliffH = 100 + Math.sin(x * 0.05) * 30;
                g.fillRect(x, mtnTop, 10, cliffH);
            }

            // The famous white Tablecloth cloud
            g.fillStyle(0xFFFFFF, 0.95);
            g.fillRoundedRect(mtnLeft - 20, mtnTop - 18, flatWidth + 20, 24, 10);
            for (let cx = mtnLeft; cx < mtnRight; cx += 50) {
                g.fillCircle(cx, mtnTop - 8, 16);
            }

            // Green mountain slopes
            g.fillStyle(0x2E7D32);
            for (let x = mtnLeft - 100; x < mtnRight + 120; x += 8) {
                const sh = 40 + Math.sin(x * 0.02) * 20;
                g.fillRect(x, baseY - sh, 8, sh);
            }

            // City Skyline & Cape Town Harbor
            for (let bx = 40; bx < W - 40; bx += 32) {
                const bw = 24;
                const bh = 50 + Math.sin(bx * 0.04) * 40;
                g.fillStyle(0x263238);
                g.fillRect(bx, baseY - bh, bw, bh);
                // Lit windows
                g.fillStyle(0xFFF59D);
                for (let wy = baseY - bh + 6; wy < baseY - 6; wy += 8) {
                    g.fillRect(bx + 4, wy, 4, 3);
                    g.fillRect(bx + 14, wy, 4, 3);
                }
            }

            // Atlantic Ocean Blue Strip
            g.fillStyle(0x0288D1);
            g.fillRect(0, baseY, W, 80);
            g.fillStyle(0x29B6F6);
            for (let ox = 0; ox < W; ox += 60) {
                g.fillRect(ox, baseY + 6, 30, 2);
            }

        } else if (id === 'moses') {
            // Durban Golden Mile Coastal Dunes & Palm Trees
            g.fillStyle(0x2E7D32);
            for (let x = 0; x < W; x += 6) {
                const duneH = 90 + Math.sin(x * 0.01) * 35 + Math.cos(x * 0.03) * 15;
                g.fillRect(x, baseY - duneH, 6, duneH);
            }
            // Ocean
            g.fillStyle(0x0277BD);
            g.fillRect(0, baseY, W, 80);

        } else if (id === 'ellis') {
            // Johannesburg Highveld Skyline with Hillbrow & Ponte Towers
            for (let bx = 60; bx < W - 60; bx += 36) {
                const bw = 26;
                const bh = 70 + Math.sin(bx * 0.03) * 60;
                g.fillStyle(0x37474F);
                g.fillRect(bx, baseY - bh, bw, bh);
                g.fillStyle(0xFFEE58);
                for (let wy = baseY - bh + 6; wy < baseY - 6; wy += 8) {
                    g.fillRect(bx + 5, wy, 4, 3);
                }
            }
            // Ponte City Tower (Tall cylindrical)
            g.fillStyle(0x263238);
            g.fillRect(W * 0.4, baseY - 200, 48, 200);
            g.fillStyle(0x00E5FF);
            for (let wy = baseY - 190; wy < baseY - 10; wy += 7) {
                g.fillRect(W * 0.4 + 4, wy, 40, 2);
            }

        } else if (id === 'loftus') {
            // Pretoria Rolling Hills with Jacaranda Blobs
            g.fillStyle(0x388E3C);
            for (let x = 0; x < W; x += 6) {
                const hillH = 80 + Math.sin(x * 0.008) * 30;
                g.fillRect(x, baseY - hillH, 6, hillH);
            }
            // Purple Jacarandas
            const purpleHues = [0x7E57C2, 0x9575CD, 0xB39DDB, 0xCE93D8];
            for (let i = 0; i < 45; i++) {
                const jx = (i * 37) % W;
                const jy = baseY - 50 - Math.random() * 40;
                g.fillStyle(this.pick(purpleHues));
                g.fillCircle(jx, jy, 12 + Math.random() * 8);
            }
        }

        g.generateTexture(`bg_sky_${id}`, W, H);
        g.destroy();
    }

    // Panorama compatibility
    static generatePanorama(scene, levelIndex) {
        this.generateBackground(scene, levelIndex);
        const level = window.LEVELS[levelIndex];
        const g = scene.make.graphics({ add: false });
        g.fillStyle(0x000000, 0);
        g.fillRect(0, 0, 10, 10);
        g.generateTexture(`panorama_${level.id}`, 2560, 720);
        g.destroy();
    }
}

window.SpriteGenerator = SpriteGenerator;
