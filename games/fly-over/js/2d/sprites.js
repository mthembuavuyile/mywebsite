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
    //  5. REALISTIC 2.5D STADIUM (Side-Profile Exterior Bowl & Open Interior)
    //     Matches the 3D Architect Inspector: Angled concrete hull, open oval rim,
    //     tiered seating bowl visible inside, green pitch, and floodlight pylons.
    // ════════════════════════════════════════════════════════════════════════
    static generateStadium(scene, levelIndex) {
        const level = window.LEVELS[levelIndex];
        const id = level.id;
        const W = 1500; // Wide realistic stadium
        const H = 340;  // 340px tall (roof rim is at Y=85, base at Y=340)
        const g = scene.make.graphics({ add: false });

        // Team Seat Colors (matching official club palettes)
        const SEAT_COLORS = {
            dhl: [0x002F6C, 0xFFD100, 0x0055A5, 0xFFFFFF],    // Stormers Blue & Gold
            moses: [0x000000, 0xFFD100, 0x007A3D, 0xFFFFFF],  // Sharks Black, Gold & Green
            ellis: [0xD32F2F, 0xB71C1C, 0xFFFFFF, 0x212121],  // Lions Red & White
            loftus: [0x1565C0, 0x0D47A1, 0x90CAF9, 0xFFFFFF]  // Bulls Sky Blue & Navy
        }[id] || [0x002F6C, 0xFFD100];

        const cx = W / 2;
        const rimY = 85;       // Top rim center Y
        const rimRx = 660;     // Outer rim half-width
        const rimRy = 75;      // Outer rim vertical perspective compression
        const baseY = H;       // Base on ground
        const baseRx = 440;    // Narrower base width

        // ── 1. EXTERIOR CONCRETE BOWL HULL (Sweeping curved outer facade) ──
        // Drawn from the top rim down to the base
        g.fillStyle(0x14181F);
        g.beginPath();
        g.moveTo(cx - rimRx, rimY);
        // Curve along bottom of outer rim ellipse
        for (let a = Math.PI; a >= 0; a -= 0.05) {
            g.lineTo(cx + Math.cos(a) * rimRx, rimY + Math.sin(a) * rimRy);
        }
        // Down to right base
        g.lineTo(cx + baseRx, baseY);
        // Base line to left base
        g.lineTo(cx - baseRx, baseY);
        g.closePath();
        g.fill();

        // Architectural shadow & gradient lines along the outer hull
        g.fillStyle(0x1C232B);
        g.beginPath();
        g.moveTo(cx - rimRx + 30, rimY + 10);
        for (let a = Math.PI * 0.95; a >= Math.PI * 0.05; a -= 0.05) {
            g.lineTo(cx + Math.cos(a) * (rimRx - 20), rimY + Math.sin(a) * (rimRy - 5));
        }
        g.lineTo(cx + baseRx - 30, baseY);
        g.lineTo(cx - baseRx + 30, baseY);
        g.closePath();
        g.fill();

        // Radiating structural vertical ribs / facade waves (signature DHL styling)
        for (let i = -12; i <= 12; i++) {
            const t = i / 12;
            const rx0 = cx + t * (rimRx - 40);
            const ry0 = rimY + Math.sqrt(Math.max(0, 1 - t * t)) * (rimRy - 8);
            const bx0 = cx + t * (baseRx - 30);
            const by0 = baseY;

            g.lineStyle(2, i % 2 === 0 ? 0x2A3440 : 0x0F1318, 0.7);
            g.lineBetween(rx0, ry0, bx0, by0);
        }

        // ── 2. INTERIOR BOWL & TIERED SEATING (Looking inside the open bowl) ──
        // Inner bowl concrete background
        const innerRx = rimRx - 24;
        const innerRy = rimRy - 16;
        g.fillStyle(0x222B35);
        g.fillEllipse(cx, rimY, innerRx * 2, innerRy * 2);

        // Sunken rugby pitch in the center of the bowl
        const pitchRx = innerRx * 0.58;
        const pitchRy = innerRy * 0.48;
        const pitchY = rimY + 8;
        g.fillStyle(0x1B5E20);
        g.fillEllipse(cx, pitchY, pitchRx * 2, pitchRy * 2);

        // Mown grass stripes on the pitch
        for (let sx = cx - pitchRx + 30; sx < cx + pitchRx - 30; sx += 32) {
            g.fillStyle(0x2E7D32);
            g.fillRect(sx, pitchY - pitchRy * 0.75, 16, pitchRy * 1.5);
        }

        // White rugby pitch markings inside the bowl
        g.lineStyle(1.5, 0xFFFFFF, 0.75);
        g.strokeEllipse(cx, pitchY, pitchRx * 1.6, pitchRy * 1.5); // Touchline
        g.lineBetween(cx, pitchY - pitchRy * 0.75, cx, pitchY + pitchRy * 0.75); // Halfway line

        // Rugby goal posts (H-posts visible on the pitch inside)
        [-pitchRx * 0.5, pitchRx * 0.5].forEach(gx => {
            g.lineStyle(2, 0xFFFFFF, 0.9);
            g.lineBetween(cx + gx - 6, pitchY - 22, cx + gx - 6, pitchY + 6);
            g.lineBetween(cx + gx + 6, pitchY - 22, cx + gx + 6, pitchY + 6);
            g.lineBetween(cx + gx - 6, pitchY - 8, cx + gx + 6, pitchY - 8);
            // Yellow base pads
            g.fillStyle(0xFFD600);
            g.fillRect(cx + gx - 8, pitchY - 2, 4, 8);
            g.fillRect(cx + gx + 4, pitchY - 2, 4, 8);
        });

        // Visible Tiered Grandstand Seating Rows around the bowl (Club Colors)
        for (let ring = 0; ring < 6; ring++) {
            const ringScale = 0.65 + ring * 0.055;
            const rx = innerRx * ringScale;
            const ry = innerRy * ringScale;
            const count = 38 + ring * 8;

            for (let s = 0; s < count; s++) {
                const angle = (s / count) * Math.PI * 2;
                // Only draw seats in the upper/rear half and flanks where visible
                if (Math.sin(angle) < 0.35) {
                    const sx = cx + Math.cos(angle) * rx;
                    const sy = rimY + Math.sin(angle) * ry;
                    const col = SEAT_COLORS[s % SEAT_COLORS.length];
                    this.rect(g, sx - 2, sy - 2, 4, 3, col);

                    // Cheering spectator flashes / Springbok green jerseys
                    if (Math.random() > 0.4) {
                        this.px(g, sx, sy - 3, 0xFFCC80, 2);
                    }
                }
            }
        }

        // ── 3. OUTER CANOPY ROOF RIM (The sleek lip the jet skims over) ──
        g.lineStyle(8, 0x1C232B, 1.0);
        g.strokeEllipse(cx, rimY, rimRx * 2, rimRy * 2);
        g.lineStyle(2, 0x455A64, 0.9);
        g.strokeEllipse(cx, rimY - 3, rimRx * 2, rimRy * 2);

        // ── 4. CORNER FLOODLIGHT MASTS (Rising above the rim) ──
        const pylonOffsets = [-0.85, -0.35, 0.35, 0.85];
        pylonOffsets.forEach(t => {
            const px = cx + t * rimRx;
            const py = rimY + Math.sin(Math.acos(Math.min(1, Math.abs(t)))) * rimRy * (t < 0 ? -0.3 : -0.3);
            const pylonH = 70;

            // Steel mast
            g.lineStyle(4, 0x37474F, 0.9);
            g.lineBetween(px, py, px, py - pylonH);
            g.lineStyle(2, 0x607D8B, 1.0);
            g.lineBetween(px - 1, py, px - 1, py - pylonH);

            // Light Grid Head
            g.fillStyle(0x21272A);
            g.fillRect(px - 14, py - pylonH - 12, 28, 14);
            // Glowing Lamps
            g.fillStyle(0xFFF9C4);
            for (let lx = -10; lx <= 10; lx += 7) {
                g.fillRect(px + lx, py - pylonH - 9, 5, 4);
                g.fillRect(px + lx, py - pylonH - 4, 5, 4);
            }
            // Lens flare glow
            g.fillStyle(0xFFF9C4, 0.35);
            g.fillCircle(px, py - pylonH - 5, 16);
        });

        // ── 5. VENUE SPECIFIC ARCHITECTURE ──
        if (id === 'moses') {
            // Durban 106m Central Arch soaring above the stadium
            const archPeakY = rimY - 140;
            const spanX = rimRx * 0.8;

            g.lineStyle(6, 0xFFFFFF, 1.0);
            g.beginPath();
            for (let t = -1; t <= 1; t += 0.02) {
                const ax = cx + t * spanX;
                const ay = archPeakY + (t * t) * (rimY - archPeakY + 10);
                if (t === -1) g.moveTo(ax, ay);
                else g.lineTo(ax, ay);
            }
            g.stroke();

            // Arch suspension cables
            for (let t = -0.7; t <= 0.7; t += 0.15) {
                const ax = cx + t * spanX;
                const ay = archPeakY + (t * t) * (rimY - archPeakY + 10);
                g.lineStyle(1, 0xE0E0E0, 0.5);
                g.lineBetween(ax, ay, ax, rimY - 10);
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

    // ════════════════════════════════════════════════════════════════════════
    //  7. GROUND & OBSTACLE TEXTURES (Runway, Terrain, Radio Towers)
    // ════════════════════════════════════════════════════════════════════════
    static generateGroundAssets(scene) {
        // 1. Tarmac Runway (512x90 tileable)
        let g = scene.make.graphics({ add: false });
        g.fillStyle(0x21272A);
        g.fillRect(0, 0, 512, 90);
        g.fillStyle(0x161A1D);
        g.fillRect(0, 70, 512, 20); // Dark bedrock

        // White Runway Centerline Dashes
        g.fillStyle(0xFFFFFF);
        for (let x = 16; x < 512; x += 64) {
            g.fillRect(x, 26, 36, 6);
        }
        // White Continuous Edge Stripes
        g.fillRect(0, 6, 512, 3);
        g.fillRect(0, 60, 512, 3);

        // Green Threshold Taxiway Lights
        g.fillStyle(0x00E676);
        for (let x = 12; x < 512; x += 32) {
            g.fillRect(x, 2, 6, 3);
        }
        g.generateTexture('runway_tarmac', 512, 90);
        g.destroy();

        // 2. Rolling Terrain Ground (512x90 tileable)
        g = scene.make.graphics({ add: false });
        g.fillStyle(0x2E7D32);
        g.fillRect(0, 0, 512, 90);
        g.fillStyle(0x1B5E20);
        for (let x = 0; x < 512; x += 16) {
            g.fillRect(x, 0, 8, 4);
        }
        g.fillStyle(0x3E2723);
        g.fillRect(0, 65, 512, 25); // Rich African loam soil
        g.fillStyle(0x4E342E);
        g.fillRect(0, 45, 512, 20);
        g.generateTexture('terrain_ground', 512, 90);
        g.destroy();

        // 3. Aviation Radio Mast / Antenna (28x150)
        g = scene.make.graphics({ add: false });
        // Red & white alternating aviation warning segments
        const segH = 22;
        for (let i = 0; i < 6; i++) {
            g.fillStyle(i % 2 === 0 ? 0xD32F2F : 0xFFFFFF);
            g.fillRect(10, 10 + i * segH, 8, segH);
            // Cross girders
            g.fillRect(4, 10 + i * segH, 20, 3);
        }
        // Red Flashing Obstacle Beacon Top
        g.fillStyle(0xFF1744);
        g.fillCircle(14, 6, 5);
        g.fillStyle(0xFFFFFF);
        g.fillCircle(14, 6, 2);
        g.generateTexture('radio_mast', 28, 150);
        g.destroy();

        // 4. Stadium Concrete Entrance Arch / Pylon
        g = scene.make.graphics({ add: false });
        g.fillStyle(0x455A64);
        g.fillRect(0, 0, 46, 220);
        g.fillStyle(0x607D8B);
        g.fillRect(4, 4, 38, 212);
        g.fillStyle(0x263238);
        for (let y = 16; y < 210; y += 30) {
            g.fillRect(8, y, 30, 4);
        }
        g.generateTexture('stadium_pylon', 46, 220);
        g.destroy();
    }
}

window.SpriteGenerator = SpriteGenerator;
