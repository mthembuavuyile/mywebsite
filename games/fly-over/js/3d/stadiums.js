/* ==========================================================================
   Stadiums & Environments Module — Procedural High-Fidelity 3D Engine
   Shared between Low-Pass Flight Simulator & 360° Stadium Explorer
   ========================================================================== */

class StadiumBuilder {
    static getStadiumDefs() {
        if (window.VENUES) {
            return Object.values(window.VENUES).map(v => ({
                id: v.id,
                name: v.name.toUpperCase(),
                city: v.city.toUpperCase(),
                subtitle: v.subtitle,
                hazardText: v.hazardText,
                unlocked: v.unlocked,
                startPos: new THREE.Vector3(v.startPos.x, v.startPos.y, v.startPos.z),
                targetZ: v.targetZ,
                exitZ: v.exitZ,
                roofY: v.roofY,
                fieldY: v.fieldY,
                windFactor: v.windFactor,
                thresholds: v.thresholds,
                gates: v.gates.map(g => ({
                    id: g.id,
                    pos: new THREE.Vector3(g.pos.x, g.pos.y, g.pos.z),
                    label: g.label,
                    radius: g.radius,
                    required: g.required
                }))
            }));
        }

        // Fallback default definitions
        return [
            {
                id: 'dhl',
                name: 'DHL STADIUM',
                city: 'CAPE TOWN',
                subtitle: 'Table Mountain & Atlantic Ocean Approach',
                hazardText: 'DIVE REQUIRED! Plunge below 25m into the stadium bowl or fail.',
                unlocked: true,
                startPos: new THREE.Vector3(0, 180, 2200),
                targetZ: -100,
                exitZ: -1550,
                roofY: 38,
                fieldY: 4,
                windFactor: 1.4,
                thresholds: [15000, 35000, 65000],
                gates: [
                    { id: 1, pos: new THREE.Vector3(0, 170, 1800), label: 'ATLANTIC DESCENT', radius: 35, required: false },
                    { id: 2, pos: new THREE.Vector3(0, 125, 1200), label: 'GLIDESLOPE INTERCEPT', radius: 30, required: false },
                    { id: 3, pos: new THREE.Vector3(0, 75, 550), label: 'STADIUM LINE-UP', radius: 25, required: false },
                    { id: 4, pos: new THREE.Vector3(0, 34, 60), label: '⚡ BOWL DIVE ENTRY ⚡', radius: 22, required: true },
                    { id: 5, pos: new THREE.Vector3(0, 10, -100), label: '🔥 APEX LOW SKIM 🔥', radius: 18, required: true },
                    { id: 6, pos: new THREE.Vector3(0, 55, -360), label: '🚀 PULL UP & CLIMB 🚀', radius: 25, required: true },
                    { id: 7, pos: new THREE.Vector3(0, 75, -850), label: '🛫 AIRFIELD APPROACH 🛫', radius: 32, required: false }
                ]
            }
        ];
    }

    // ── Helper: 2D Rounded Stadium Outline with Semi-Circular Ends ──
    static _stadiumOutline(length, width, segments = 30) {
        const r = width / 2;
        const half = Math.max(length - width, 0) / 2;
        const pts = [];
        for (let i = 0; i <= segments; i++) {
            const a = -Math.PI / 2 + Math.PI * (i / segments);
            pts.push(new THREE.Vector2(half + r * Math.cos(a), r * Math.sin(a)));
        }
        for (let i = 0; i <= segments; i++) {
            const a = Math.PI / 2 + Math.PI * (i / segments);
            pts.push(new THREE.Vector2(-half + r * Math.cos(a), r * Math.sin(a)));
        }
        return pts;
    }

    // ── Helper: Procedural Mown Rugby Turf Canvas Texture ──
    static _createTurfTexture() {
        const c = document.createElement('canvas');
        c.width = 1024;
        c.height = 512;
        const ctx = c.getContext('2d');

        // Deep vibrant grass base
        ctx.fillStyle = '#1e6823';
        ctx.fillRect(0, 0, 1024, 512);

        // Alternating mown stripes
        const stripeW = 32;
        for (let i = 0; i < 1024; i += stripeW) {
            ctx.fillStyle = (i / stripeW) % 2 === 0 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';
            ctx.fillRect(i, 0, stripeW, 512);
        }

        // White rugby pitch markings
        ctx.strokeStyle = 'rgba(255,255,255,0.85)';
        ctx.lineWidth = 4;
        ctx.strokeRect(40, 30, 944, 452); // Touch & Dead-ball lines

        // Halfway line & center spot
        ctx.beginPath();
        ctx.moveTo(512, 30);
        ctx.lineTo(512, 482);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(512, 256, 45, 0, Math.PI * 2);
        ctx.stroke();

        // 22-meter lines
        [280, 744].forEach(x => {
            ctx.beginPath();
            ctx.moveTo(x, 30);
            ctx.lineTo(x, 482);
            ctx.stroke();
        });

        // 10-meter dashed lines
        ctx.setLineDash([12, 10]);
        [410, 614].forEach(x => {
            ctx.beginPath();
            ctx.moveTo(x, 30);
            ctx.lineTo(x, 482);
            ctx.stroke();
        });
        ctx.setLineDash([]);

        const texture = new THREE.CanvasTexture(c);
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        return texture;
    }

    // ── Master Procedural Stadium Bowl Generator ──
    static buildProceduralStadium(venueId = 'dhl') {
        const v = (window.VENUES && window.VENUES[venueId]) || {
            pitchLength: 210,
            pitchWidth: 130,
            bowlHeight: 38,
            roofHeight: 42,
            tiers: 20,
            growth: 0.55,
            palette: [0x002f6c, 0xffd100, 0xffffff, 0x0055a5]
        };

        const stadGroup = new THREE.Group();
        const colliders = [];

        const pitchLength = v.pitchLength || 210;
        const pitchWidth = v.pitchWidth || 130;
        const bowlHeight = v.bowlHeight || 38;
        const tiers = v.tiers || 20;
        const growth = v.growth || 0.55;

        // 1. Striped Rugby Pitch
        const turfTexture = this._createTurfTexture();
        const pitchGeo = new THREE.PlaneGeometry(pitchLength, pitchWidth);
        pitchGeo.rotateX(-Math.PI / 2);
        const pitchMat = new THREE.MeshStandardMaterial({
            map: turfTexture,
            roughness: 0.85,
            metalness: 0.05
        });
        const pitch = new THREE.Mesh(pitchGeo, pitchMat);
        pitch.position.set(0, 3.8, 0);
        pitch.receiveShadow = true;
        stadGroup.add(pitch);

        // 2. Concrete Tiered Stadium Bowl (Smooth curved grandstands with vertex color gradient)
        const baseOutline = this._stadiumOutline(pitchLength + 40, pitchWidth + 40, 32);
        const ringsPts = [];
        const ringsY = [];
        const ease = 0.85;

        for (let i = 0; i <= tiers; i++) {
            const t = i / tiers;
            const scale = 1 + t * growth;
            ringsPts.push(baseOutline.map(p => p.clone().multiplyScalar(scale)));
            ringsY.push(3.8 + Math.pow(t, ease) * bowlHeight);
        }

        const positions = [];
        const colors = [];
        const lowColor = new THREE.Color(0x21272e);
        const highColor = new THREE.Color(0x546e7a);
        const M = baseOutline.length;

        for (let i = 0; i < tiers; i++) {
            const y0 = ringsY[i], y1 = ringsY[i + 1];
            const c0 = lowColor.clone().lerp(highColor, i / tiers);
            const c1 = lowColor.clone().lerp(highColor, (i + 1) / tiers);

            for (let j = 0; j < M; j++) {
                const jn = (j + 1) % M;
                const a = ringsPts[i][j], b = ringsPts[i][jn];
                const c = ringsPts[i + 1][j], d = ringsPts[i + 1][jn];

                positions.push(a.x, y0, a.y, b.x, y0, b.y, d.x, y1, d.y);
                colors.push(c0.r, c0.g, c0.b, c0.r, c0.g, c0.b, c1.r, c1.g, c1.b);

                positions.push(a.x, y0, a.y, d.x, y1, d.y, c.x, y1, c.y);
                colors.push(c0.r, c0.g, c0.b, c1.r, c1.g, c1.b, c1.r, c1.g, c1.b);
            }
        }

        const bowlGeo = new THREE.BufferGeometry();
        bowlGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        bowlGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        bowlGeo.computeVertexNormals();

        const bowlMat = new THREE.MeshStandardMaterial({
            vertexColors: true,
            side: THREE.DoubleSide,
            roughness: 0.9
        });
        const bowlMesh = new THREE.Mesh(bowlGeo, bowlMat);
        bowlMesh.receiveShadow = true;
        stadGroup.add(bowlMesh);

        // 3. Instanced 3D Spectator Seats (Authentic Club Colorway)
        const palette = v.palette || [0x002f6c, 0xffd100, 0xffffff, 0x0055a5];
        const block = 6;
        const seatGroups = {};

        for (let i = 3; i < tiers; i += 2) {
            ringsPts[i].forEach((p, j) => {
                const colHex = palette[Math.floor(j / block) % palette.length];
                (seatGroups[colHex] = seatGroups[colHex] || []).push({
                    x: p.x,
                    y: ringsY[i] + 0.6,
                    z: p.y
                });
            });
        }

        const dummy = new THREE.Object3D();
        const seatGeo = new THREE.BoxGeometry(2.4, 1.4, 1.8);

        Object.entries(seatGroups).forEach(([hex, arr]) => {
            const seatMat = new THREE.MeshStandardMaterial({
                color: parseInt(hex),
                roughness: 0.7,
                metalness: 0.1
            });
            const instancedSeats = new THREE.InstancedMesh(seatGeo, seatMat, arr.length);
            instancedSeats.castShadow = false;

            arr.forEach((s, idx) => {
                dummy.position.set(s.x, s.y, s.z);
                dummy.lookAt(0, s.y, 0);
                dummy.updateMatrix();
                instancedSeats.setMatrixAt(idx, dummy.matrix);
            });

            instancedSeats.instanceMatrix.needsUpdate = true;
            stadGroup.add(instancedSeats);
        });

        // 4. Extruded 3D Roof Canopy with Oval Center Skylight
        const roofOuter = baseOutline.map(p => p.clone().multiplyScalar(1 + growth * 1.15));
        const roofInner = baseOutline.map(p => p.clone().multiplyScalar(1 + growth * 0.88));
        const roofShape = new THREE.Shape(roofOuter);
        roofShape.holes.push(new THREE.Path(roofInner));

        const roofGeo = new THREE.ExtrudeGeometry(roofShape, { depth: 3.2, bevelEnabled: false });
        roofGeo.rotateX(Math.PI / 2);
        roofGeo.translate(0, 3.8 + bowlHeight + 4.5, 0);

        const roofMat = new THREE.MeshStandardMaterial({
            color: 0x263238,
            roughness: 0.4,
            metalness: 0.35,
            side: THREE.DoubleSide
        });
        const roofMesh = new THREE.Mesh(roofGeo, roofMat);
        roofMesh.castShadow = true;
        roofMesh.receiveShadow = true;
        stadGroup.add(roofMesh);

        // 5. Rugby Goal Posts (Authentic White H-posts with Yellow Base Crash Pads)
        const postMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const padMat = new THREE.MeshBasicMaterial({ color: 0xffd600 });
        const fieldHalfZ = pitchLength * 0.42;

        [-fieldHalfZ, fieldHalfZ].forEach(zPos => {
            const postGroup = new THREE.Group();
            postGroup.position.set(0, 3.8, zPos);

            // Left & Right Uprights
            [-5.6, 5.6].forEach(xOffset => {
                const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 16), postMat);
                pole.position.set(xOffset, 8, 0);
                postGroup.add(pole);

                const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 2.2), padMat);
                pad.position.set(xOffset, 1.1, 0);
                postGroup.add(pad);
            });

            // Crossbar (3m above ground, 5.6m between posts)
            const crossbar = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 11.2), postMat);
            crossbar.rotateZ(Math.PI / 2);
            crossbar.position.set(0, 3.0, 0);
            postGroup.add(crossbar);

            stadGroup.add(postGroup);

            // Post Collider
            colliders.push({
                type: 'post',
                box: new THREE.Box3(
                    new THREE.Vector3(-6.5, 3.8, zPos - 102),
                    new THREE.Vector3(6.5, 20, zPos - 98)
                )
            });
        });

        // 6. Corner Floodlight Towers
        const fx = (pitchWidth + 40) * 0.95;
        const fz = (pitchLength + 40) * 0.65;
        const towerMat = new THREE.MeshStandardMaterial({ color: 0x37474f, metalness: 0.8 });
        const lightMat = new THREE.MeshBasicMaterial({ color: 0xfff9c4 });

        [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([sx, sz]) => {
            const tx = sx * fx;
            const tz = sz * fz;
            const mast = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 2.4, 85, 8), towerMat);
            mast.position.set(tx, 42.5, tz);
            stadGroup.add(mast);

            const head = new THREE.Mesh(new THREE.BoxGeometry(16, 6, 4), lightMat);
            head.position.set(tx, 83, tz);
            head.lookAt(0, 40, 0);
            stadGroup.add(head);

            colliders.push({
                type: 'tower',
                box: new THREE.Box3(new THREE.Vector3(tx - 8, 0, tz - 8 - 100), new THREE.Vector3(tx + 8, 88, tz + 8 - 100))
            });
        });

        // Roof Canopy Colliders (Left & Right Stand Overhangs)
        colliders.push({
            type: 'roof_left',
            box: new THREE.Box3(new THREE.Vector3(-145, 32, -260), new THREE.Vector3(-50, 52, 60))
        });
        colliders.push({
            type: 'roof_right',
            box: new THREE.Box3(new THREE.Vector3(50, 32, -260), new THREE.Vector3(145, 52, 60))
        });

        return {
            group: stadGroup,
            colliders: colliders
        };
    }

    // ── Build Full Flight Sim Environment ──
    static buildEnvironment(scene, stadiumId = 'dhl') {
        const envGroup = new THREE.Group();
        const colliders = [];
        const flightGates = [];

        // 1. Vast Realistic Open Terrain (10,000m x 12,000m)
        const grassMat = new THREE.MeshStandardMaterial({ color: 0x245a27, roughness: 0.88 });
        const groundGeo = new THREE.PlaneGeometry(10000, 12000, 48, 48);
        groundGeo.rotateX(-Math.PI / 2);
        const ground = new THREE.Mesh(groundGeo, grassMat);
        ground.position.set(0, 0, -800);
        ground.receiveShadow = true;
        envGroup.add(ground);

        colliders.push({
            type: 'ground',
            y: 0,
            box: new THREE.Box3(new THREE.Vector3(-5000, -10, -6800), new THREE.Vector3(5000, 0, 5200))
        });

        // 2. High-Detail Procedural Stadium Bowl
        const proceduralStadium = this.buildProceduralStadium(stadiumId);
        proceduralStadium.group.position.set(0, 0, -100);
        envGroup.add(proceduralStadium.group);
        colliders.push(...proceduralStadium.colliders);

        // 3. Realistic Airfield & International Runway (Z = -950 to -3350)
        this._buildAirfield(envGroup, colliders, 0, -950, 2400, 75);

        // 4. Distant Mountain Ranges Encircling the World (Zero dead-space / no void)
        this._buildDistantHills(envGroup, 0, -800, 36, 4800);

        // 5. Surrounding Geographic Environments
        const oceanMat = new THREE.MeshStandardMaterial({ color: 0x01579b, roughness: 0.1, metalness: 0.85, transparent: true, opacity: 0.92 });
        const beachSandMat = new THREE.MeshStandardMaterial({ color: 0xffe082, roughness: 0.9 });

        if (stadiumId === 'dhl') {
            // Table Mountain, Devil's Peak & Lion's Head positioned majestically on the West Flank
            const mtnGroup = new THREE.Group();
            mtnGroup.position.set(-850, 0, -800);
            const mtnMat = new THREE.MeshStandardMaterial({ color: 0x455a64, roughness: 0.95 });
            const topCapMat = new THREE.MeshStandardMaterial({ color: 0x546e7a, roughness: 0.9 });
            const slopesMat = new THREE.MeshStandardMaterial({ color: 0x388e3c, roughness: 0.85 });

            const plateau = new THREE.Mesh(new THREE.BoxGeometry(850, 340, 240), mtnMat);
            plateau.position.set(0, 170, 0);
            mtnGroup.add(plateau);

            const topCap = new THREE.Mesh(new THREE.BoxGeometry(860, 12, 250), topCapMat);
            topCap.position.set(0, 340, 0);
            mtnGroup.add(topCap);

            const devilsPeak = new THREE.Mesh(new THREE.ConeGeometry(210, 420, 16), mtnMat);
            devilsPeak.position.set(-520, 210, 30);
            mtnGroup.add(devilsPeak);

            const lionsHead = new THREE.Mesh(new THREE.ConeGeometry(150, 320, 16), mtnMat);
            lionsHead.position.set(520, 160, 80);
            mtnGroup.add(lionsHead);

            const foothills = new THREE.Mesh(new THREE.BoxGeometry(1100, 100, 180), slopesMat);
            foothills.position.set(0, 50, 90);
            mtnGroup.add(foothills);

            envGroup.add(mtnGroup);

            // Atlantic Ocean Shoreline on East / North Flank
            const ocean = new THREE.Mesh(new THREE.PlaneGeometry(3000, 12000), oceanMat);
            ocean.rotateX(-Math.PI / 2);
            ocean.position.set(1800, 0.6, -800);
            envGroup.add(ocean);

            const beach = new THREE.Mesh(new THREE.PlaneGeometry(160, 12000), beachSandMat);
            beach.rotateX(-Math.PI / 2);
            beach.position.set(380, 0.8, -800);
            envGroup.add(beach);

            this._buildCitySkyline(envGroup, colliders, -550, 0, -550, 24);

        } else if (stadiumId === 'moses') {
            // Moses Mabhida 106m Iconic Central Y-Arch
            const archGroup = new THREE.Group();
            archGroup.position.set(0, 0, -100);
            const curvePoints = [];
            const archSpan = 270;
            const archPeak = 92;

            for (let t = -1; t <= 1; t += 0.04) {
                const x = 0;
                const y = (1.0 - t * t) * archPeak + 12;
                const z = t * (archSpan * 0.5);
                curvePoints.push(new THREE.Vector3(x, y, z));
            }

            const archCurve = new THREE.CatmullRomCurve3(curvePoints);
            const archTube = new THREE.TubeGeometry(archCurve, 64, 4.0, 16, false);
            const archMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.6 });
            const archMesh = new THREE.Mesh(archTube, archMat);
            archMesh.castShadow = true;
            archGroup.add(archMesh);
            envGroup.add(archGroup);

            colliders.push({
                type: 'arch_spine',
                box: new THREE.Box3(new THREE.Vector3(-12, 85, -235), new THREE.Vector3(12, 105, 35))
            });

            // Durban Indian Ocean & Golden Mile Beachfront
            const ocean = new THREE.Mesh(new THREE.PlaneGeometry(3000, 12000), oceanMat);
            ocean.rotateX(-Math.PI / 2);
            ocean.position.set(1800, 0.6, -800);
            envGroup.add(ocean);

            const beach = new THREE.Mesh(new THREE.PlaneGeometry(160, 12000), beachSandMat);
            beach.rotateX(-Math.PI / 2);
            beach.position.set(380, 0.8, -800);
            envGroup.add(beach);

            this._buildCitySkyline(envGroup, colliders, -520, 0, -550, 26);

        } else if (stadiumId === 'ellis') {
            // Johannesburg Skyline & Highveld Ridge
            this._buildCitySkyline(envGroup, colliders, -550, 0, -600, 36);
            this._buildCitySkyline(envGroup, colliders, 450, 0, -700, 24);

        } else if (stadiumId === 'loftus') {
            // Pretoria Jacaranda Canopy & Valley Ridges
            this._buildCitySkyline(envGroup, colliders, -520, 0, -600, 24);

            const jacarandaMat = new THREE.MeshStandardMaterial({ color: 0x9575cd, roughness: 0.85 });
            const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4e342e, roughness: 0.9 });

            for (let i = 0; i < 90; i++) {
                const tree = new THREE.Group();
                const x = (Math.random() - 0.5) * 1400;
                const z = (Math.random() - 0.5) * 1400 + 400;
                if (Math.abs(x) < 220 && Math.abs(z + 100) < 220) continue;

                const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.2, 10, 6), trunkMat);
                trunk.position.set(0, 5, 0);
                tree.add(trunk);

                const foliage = new THREE.Mesh(new THREE.DodecahedronGeometry(7 + Math.random() * 3), jacarandaMat);
                foliage.position.set(0, 13, 0);
                tree.add(foliage);

                tree.position.set(x, 0, z);
                envGroup.add(tree);
            }
        }

        // 6. Extended Metropolitan Flanks (Urban sprawl lining the flight path)
        this._buildMetropolitanFlanks(envGroup, colliders);

        // 7. Holographic Stunt Flight Gates
        const def = this.getStadiumDefs().find(s => s.id === stadiumId) || this.getStadiumDefs()[0];
        def.gates.forEach(gateDef => {
            const gateMesh = this._createGateMesh(gateDef);
            envGroup.add(gateMesh);
            flightGates.push({
                id: gateDef.id,
                label: gateDef.label,
                pos: gateDef.pos.clone(),
                radius: gateDef.radius,
                required: gateDef.required,
                mesh: gateMesh,
                passed: false
            });
        });

        // 8. Flare Cannons on Canopy
        const flareCanons = [
            new THREE.Vector3(-95, 42, -190),
            new THREE.Vector3(95, 42, -190),
            new THREE.Vector3(-115, 44, -100),
            new THREE.Vector3(115, 44, -100),
            new THREE.Vector3(-95, 42, -10),
            new THREE.Vector3(95, 42, -10)
        ];

        scene.add(envGroup);

        return {
            group: envGroup,
            stadiumGroup: proceduralStadium.group,
            colliders: colliders,
            flarePositions: flareCanons,
            flightGates: flightGates
        };
    }

    // ── Build Full-Featured Procedural Airfield & Runway ──
    static _buildAirfield(parent, colliders, startX = 0, startZ = -950, length = 2400, width = 75) {
        const airfieldGroup = new THREE.Group();

        // ── 1. Materials ──
        const tarmacMat = new THREE.MeshStandardMaterial({ color: 0x1a1f26, roughness: 0.85, metalness: 0.1 });
        const shoulderMat = new THREE.MeshStandardMaterial({ color: 0x2b313a, roughness: 0.92 });
        const blastPadMat = new THREE.MeshStandardMaterial({ color: 0x222730, roughness: 0.9 });
        const apronMat = new THREE.MeshStandardMaterial({ color: 0x546e7a, roughness: 0.75 });
        const markWhiteMat = new THREE.MeshBasicMaterial({ color: 0xf5f7fa });
        const markYellowMat = new THREE.MeshBasicMaterial({ color: 0xffd600 });
        const lightGreenMat = new THREE.MeshBasicMaterial({ color: 0x00e676 });
        const lightWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const lightRedMat = new THREE.MeshBasicMaterial({ color: 0xff1744 });
        const lightBlueMat = new THREE.MeshBasicMaterial({ color: 0x2979ff });
        const lightAmberMat = new THREE.MeshBasicMaterial({ color: 0xffea00 });
        const steelMat = new THREE.MeshStandardMaterial({ color: 0x37474f, roughness: 0.5, metalness: 0.7 });
        const glassMat = new THREE.MeshStandardMaterial({ color: 0x80deea, roughness: 0.1, metalness: 0.9, transparent: true, opacity: 0.85 });

        // ── 2. Runway Surface & Shoulders ──
        const runwayMesh = new THREE.Mesh(new THREE.BoxGeometry(width, 0.4, length), tarmacMat);
        runwayMesh.position.set(startX, 0.2, startZ - length / 2);
        runwayMesh.receiveShadow = true;
        airfieldGroup.add(runwayMesh);

        // Left & Right Paved Shoulders (16m wide each)
        const shoulderL = new THREE.Mesh(new THREE.BoxGeometry(16, 0.35, length), shoulderMat);
        shoulderL.position.set(startX - width / 2 - 8, 0.18, startZ - length / 2);
        airfieldGroup.add(shoulderL);

        const shoulderR = new THREE.Mesh(new THREE.BoxGeometry(16, 0.35, length), shoulderMat);
        shoulderR.position.set(startX + width / 2 + 8, 0.18, startZ - length / 2);
        airfieldGroup.add(shoulderR);

        // Blast Pads / Overruns (120m long each end)
        const blastPadNear = new THREE.Mesh(new THREE.BoxGeometry(width + 32, 0.35, 120), blastPadMat);
        blastPadNear.position.set(startX, 0.18, startZ + 60);
        airfieldGroup.add(blastPadNear);

        const blastPadFar = new THREE.Mesh(new THREE.BoxGeometry(width + 32, 0.35, 120), blastPadMat);
        blastPadFar.position.set(startX, 0.18, startZ - length - 60);
        airfieldGroup.add(blastPadFar);

        // ── 3. High-Precision Runway Markings ──
        // A) Threshold Piano Keys (12 bars at near and far thresholds)
        const keyGeo = new THREE.BoxGeometry(2.4, 0.08, 38);
        const keyCount = 12;
        for (let i = 0; i < keyCount; i++) {
            const kx = startX - 28 + (i / (keyCount - 1)) * 56;
            // Near threshold
            const nearKey = new THREE.Mesh(keyGeo, markWhiteMat);
            nearKey.position.set(kx, 0.45, startZ - 22);
            airfieldGroup.add(nearKey);
            // Far threshold
            const farKey = new THREE.Mesh(keyGeo, markWhiteMat);
            farKey.position.set(kx, 0.45, startZ - length + 22);
            airfieldGroup.add(farKey);
        }

        // B) Aiming Point (Captain's Target Markers at 380m)
        const aimGeo = new THREE.BoxGeometry(7.5, 0.08, 45);
        const aimL = new THREE.Mesh(aimGeo, markWhiteMat);
        aimL.position.set(startX - 18, 0.45, startZ - 380);
        airfieldGroup.add(aimL);
        const aimR = new THREE.Mesh(aimGeo, markWhiteMat);
        aimR.position.set(startX + 18, 0.45, startZ - 380);
        airfieldGroup.add(aimR);

        // C) Touchdown Zone Markers (Pairs at 150m, 260m, 500m, 620m)
        const tdzGeo = new THREE.BoxGeometry(3.5, 0.08, 22);
        [150, 260, 500, 620].forEach(dist => {
            const tdzL = new THREE.Mesh(tdzGeo, markWhiteMat);
            tdzL.position.set(startX - 18, 0.45, startZ - dist);
            airfieldGroup.add(tdzL);
            const tdzR = new THREE.Mesh(tdzGeo, markWhiteMat);
            tdzR.position.set(startX + 18, 0.45, startZ - dist);
            airfieldGroup.add(tdzR);
        });

        // D) Runway Centerline Dashes (30m dash, 20m gap down entire runway)
        const dashGeo = new THREE.BoxGeometry(2.4, 0.08, 30);
        for (let z = startZ - 70; z >= startZ - length + 70; z -= 50) {
            const dash = new THREE.Mesh(dashGeo, markWhiteMat);
            dash.position.set(startX, 0.45, z);
            airfieldGroup.add(dash);
        }

        // ── 4. Approach Lighting System (ALS) ──
        // 11 crossbars leading into the runway along glideslope (Z = startZ + 385 to startZ + 35)
        const mastMat = new THREE.MeshStandardMaterial({ color: 0x455a64 });
        const alsLightGeo = new THREE.SphereGeometry(0.8, 8, 8);
        for (let i = 0; i < 11; i++) {
            const az = startZ + 385 - i * 35;
            const progress = (10 - i) / 10;
            const mastH = 4.0 + progress * 14.0;
            
            // Vertical Mast
            const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, mastH, 6), mastMat);
            mast.position.set(startX, mastH / 2, az);
            airfieldGroup.add(mast);

            // Crossbar
            const barW = 16;
            const crossbar = new THREE.Mesh(new THREE.BoxGeometry(barW, 0.4, 0.4), mastMat);
            crossbar.position.set(startX, mastH, az);
            airfieldGroup.add(crossbar);

            // 5 Light Pods along crossbar
            for (let b = 0; b < 5; b++) {
                const lx = startX - 6 + b * 3;
                const light = new THREE.Mesh(alsLightGeo, lightAmberMat);
                light.position.set(lx, mastH + 0.5, az);
                airfieldGroup.add(light);
            }

            // Centerline Flash Strobe
            const strobe = new THREE.Mesh(new THREE.SphereGeometry(1.0, 8, 8), lightWhiteMat);
            strobe.position.set(startX, mastH + 0.8, az);
            airfieldGroup.add(strobe);
        }

        // ── 5. Runway Edge, Threshold & End Lights ──
        // Threshold Green Bar (14 lights)
        const threshLightGeo = new THREE.SphereGeometry(0.7, 8, 8);
        for (let i = 0; i < 14; i++) {
            const tx = startX - 35 + (i / 13) * 70;
            const tLight = new THREE.Mesh(threshLightGeo, lightGreenMat);
            tLight.position.set(tx, 0.6, startZ);
            airfieldGroup.add(tLight);
        }

        // Runway Edge Lights (white spheres spaced every 60m along runway edges)
        const edgeLightGeo = new THREE.SphereGeometry(0.65, 8, 8);
        for (let z = startZ; z >= startZ - length; z -= 60) {
            const lLeft = new THREE.Mesh(edgeLightGeo, lightWhiteMat);
            lLeft.position.set(startX - width / 2 - 1.2, 0.6, z);
            airfieldGroup.add(lLeft);

            const lRight = new THREE.Mesh(edgeLightGeo, lightWhiteMat);
            lRight.position.set(startX + width / 2 + 1.2, 0.6, z);
            airfieldGroup.add(lRight);
        }

        // Runway End Red Lights
        for (let i = 0; i < 14; i++) {
            const ex = startX - 35 + (i / 13) * 70;
            const endLight = new THREE.Mesh(threshLightGeo, lightRedMat);
            endLight.position.set(ex, 0.6, startZ - length);
            airfieldGroup.add(endLight);
        }

        // PAPI Light System (4 precision glide lights at X = startX - 46, Z = startZ - 380)
        for (let p = 0; p < 4; p++) {
            const px = startX - 46 - p * 3.5;
            const papiBox = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 2.0), steelMat);
            papiBox.position.set(px, 0.6, startZ - 380);
            airfieldGroup.add(papiBox);

            const papiLens = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), p < 2 ? lightWhiteMat : lightRedMat);
            papiLens.position.set(px, 0.6, startZ - 379);
            airfieldGroup.add(papiLens);
        }

        // ── 6. Parallel Taxiway & Connectors ──
        const taxiwayW = 28;
        const taxiwayX = startX + 96;
        const taxiwayMesh = new THREE.Mesh(new THREE.BoxGeometry(taxiwayW, 0.35, length * 0.9), tarmacMat);
        taxiwayMesh.position.set(taxiwayX, 0.17, startZ - length * 0.45);
        airfieldGroup.add(taxiwayMesh);

        // Taxiway Yellow Centerline
        const taxiLine = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.05, length * 0.9), markYellowMat);
        taxiLine.position.set(taxiwayX, 0.36, startZ - length * 0.45);
        airfieldGroup.add(taxiLine);

        // Connector Taxiways linking runway to taxiway
        [-400, -1050, -1700].forEach(cz => {
            const conn = new THREE.Mesh(new THREE.BoxGeometry(taxiwayX - startX - width / 2, 0.35, 24), tarmacMat);
            conn.position.set(startX + width / 2 + (taxiwayX - startX - width / 2) / 2, 0.17, startZ + cz);
            airfieldGroup.add(conn);

            const connLine = new THREE.Mesh(new THREE.BoxGeometry(taxiwayX - startX - width / 2, 0.05, 0.8), markYellowMat);
            connLine.position.set(startX + width / 2 + (taxiwayX - startX - width / 2) / 2, 0.36, startZ + cz);
            airfieldGroup.add(connLine);
        });

        // Blue Taxiway Edge Lights
        const blueLightGeo = new THREE.SphereGeometry(0.5, 6, 6);
        for (let z = startZ - 50; z >= startZ - length * 0.9; z -= 50) {
            const bL = new THREE.Mesh(blueLightGeo, lightBlueMat);
            bL.position.set(taxiwayX - taxiwayW / 2 - 1.0, 0.5, z);
            airfieldGroup.add(bL);

            const bR = new THREE.Mesh(blueLightGeo, lightBlueMat);
            bR.position.set(taxiwayX + taxiwayW / 2 + 1.0, 0.5, z);
            airfieldGroup.add(bR);
        }

        // ── 7. Airport Apron & Aircraft Hangars ──
        const apronW = 160;
        const apronL = 1300;
        const apronX = taxiwayX + taxiwayW / 2 + apronW / 2;
        const apronZ = startZ - 1000;
        const apronMesh = new THREE.Mesh(new THREE.BoxGeometry(apronW, 0.3, apronL), apronMat);
        apronMesh.position.set(apronX, 0.15, apronZ);
        airfieldGroup.add(apronMesh);

        // 3 Large Arched Aircraft Hangars
        const hangarZOffsets = [-350, 0, 350];
        hangarZOffsets.forEach((hz, idx) => {
            const hx = apronX + 45;
            const hy = 18;
            const hDepth = 85;
            const hWidth = 65;

            const hangar = new THREE.Group();
            hangar.position.set(hx, 0, apronZ + hz);

            // Barrel Arch Roof
            const archGeo = new THREE.CylinderGeometry(hWidth / 2, hWidth / 2, hDepth, 16, 1, false, 0, Math.PI);
            archGeo.rotateZ(Math.PI / 2);
            archGeo.rotateY(Math.PI / 2);
            const archMesh = new THREE.Mesh(archGeo, steelMat);
            archMesh.position.set(0, hy, 0);
            archMesh.castShadow = true;
            hangar.add(archMesh);

            // Lower Walls
            const wallMesh = new THREE.Mesh(new THREE.BoxGeometry(hWidth, hy, hDepth), steelMat);
            wallMesh.position.set(0, hy / 2, 0);
            wallMesh.castShadow = true;
            hangar.add(wallMesh);

            // Open Hangar Bay Door (warm yellow interior glow)
            const bayGlow = new THREE.Mesh(new THREE.PlaneGeometry(hWidth * 0.75, hy * 0.85), new THREE.MeshBasicMaterial({ color: 0xffe082 }));
            bayGlow.position.set(-hWidth / 2 - 0.2, hy * 0.45, 0);
            bayGlow.rotateY(-Math.PI / 2);
            hangar.add(bayGlow);

            // Roof Obstacle Beacon
            const rBeacon = new THREE.Mesh(new THREE.SphereGeometry(1.2, 8, 8), lightRedMat);
            rBeacon.position.set(0, hy + hWidth / 2 + 1.0, 0);
            hangar.add(rBeacon);

            airfieldGroup.add(hangar);

            if (colliders) {
                colliders.push({
                    type: `hangar_${idx}`,
                    box: new THREE.Box3(
                        new THREE.Vector3(hx - hWidth / 2, 0, apronZ + hz - hDepth / 2),
                        new THREE.Vector3(hx + hWidth / 2, hy + hWidth / 2, apronZ + hz + hDepth / 2)
                    )
                });
            }
        });

        // ── 8. Parked Airliners on Apron ──
        [-180, 180].forEach(pz => {
            const airliner = new THREE.Group();
            airliner.position.set(apronX - 25, 0, apronZ + pz);
            airliner.rotateY(Math.PI / 2);

            const whitePlaneMat = new THREE.MeshStandardMaterial({ color: 0xf0f4f8, roughness: 0.35, metalness: 0.3 });
            const blueTailMat = new THREE.MeshStandardMaterial({ color: 0x0288d1, roughness: 0.4 });

            // Fuselage
            const fuse = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 38, 12), whitePlaneMat);
            fuse.rotateX(Math.PI / 2);
            fuse.position.set(0, 4.5, 0);
            airliner.add(fuse);

            // Wings
            const wings = new THREE.Mesh(new THREE.BoxGeometry(34, 0.4, 5.5), whitePlaneMat);
            wings.position.set(0, 4.0, 0);
            airliner.add(wings);

            // Tailfin
            const fin = new THREE.Mesh(new THREE.BoxGeometry(0.5, 6.5, 4.5), blueTailMat);
            fin.position.set(0, 8.5, 16);
            airliner.add(fin);

            airfieldGroup.add(airliner);
        });

        // ── 9. Airport Control Tower ──
        const towerX = taxiwayX + 38;
        const towerZ = startZ - 380;
        const towerH = 56;
        const towerGroup = new THREE.Group();
        towerGroup.position.set(towerX, 0, towerZ);

        // Concrete Shaft
        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 6.5, towerH - 10, 12), new THREE.MeshStandardMaterial({ color: 0xb0bec5, roughness: 0.7 }));
        shaft.position.set(0, (towerH - 10) / 2, 0);
        shaft.castShadow = true;
        towerGroup.add(shaft);

        // Glass Observation Cab
        const cab = new THREE.Mesh(new THREE.CylinderGeometry(9.0, 7.0, 6.5, 8), glassMat);
        cab.position.set(0, towerH - 6.5, 0);
        towerGroup.add(cab);

        // Cab Roof & Radar Dome
        const cabRoof = new THREE.Mesh(new THREE.CylinderGeometry(9.5, 9.5, 1.2, 8), steelMat);
        cabRoof.position.set(0, towerH - 2.6, 0);
        towerGroup.add(cabRoof);

        const radarDome = new THREE.Mesh(new THREE.SphereGeometry(2.8, 12, 12), markWhiteMat);
        radarDome.position.set(0, towerH + 1.2, 0);
        towerGroup.add(radarDome);

        // Rotating Tower Beacon
        const beaconMast = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 3.5, 6), steelMat);
        beaconMast.position.set(0, towerH + 4.5, 0);
        towerGroup.add(beaconMast);

        const beaconLightW = new THREE.Mesh(new THREE.SphereGeometry(1.2, 8, 8), lightWhiteMat);
        beaconLightW.position.set(-1.0, towerH + 5.5, 0);
        towerGroup.add(beaconLightW);

        const beaconLightG = new THREE.Mesh(new THREE.SphereGeometry(1.2, 8, 8), lightGreenMat);
        beaconLightG.position.set(1.0, towerH + 5.5, 0);
        towerGroup.add(beaconLightG);

        airfieldGroup.add(towerGroup);

        if (colliders) {
            colliders.push({
                type: 'airport_control_tower',
                box: new THREE.Box3(
                    new THREE.Vector3(towerX - 10, 0, towerZ - 10),
                    new THREE.Vector3(towerX + 10, towerH + 6, towerZ + 10)
                )
            });
        }

        // ── 10. Lighted Wind Sock ──
        const sockX = startX - width / 2 - 18;
        const sockZ = startZ - 90;
        const sockPole = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 9, 6), steelMat);
        sockPole.position.set(sockX, 4.5, sockZ);
        airfieldGroup.add(sockPole);

        const sockCone = new THREE.Mesh(new THREE.ConeGeometry(1.2, 4.5, 8), new THREE.MeshStandardMaterial({ color: 0xff3d00, roughness: 0.6 }));
        sockCone.rotateZ(Math.PI / 2);
        sockCone.rotateY(0.4);
        sockCone.position.set(sockX + 1.8, 8.5, sockZ);
        airfieldGroup.add(sockCone);

        parent.add(airfieldGroup);
    }

    // ── Distant Encircling Mountain Ranges (Organic Horizon) ──
    static _buildDistantHills(parent, centerX = 0, centerZ = -800, count = 36, radius = 4800) {
        const hillsGroup = new THREE.Group();
        const hillMat1 = new THREE.MeshStandardMaterial({ color: 0x1e3023, roughness: 0.95 }); // dark atmospheric green
        const hillMat2 = new THREE.MeshStandardMaterial({ color: 0x25352c, roughness: 0.95 }); // misty ridge
        const hillMat3 = new THREE.MeshStandardMaterial({ color: 0x2d3a3f, roughness: 0.9 });  // rocky bluff
        const materials = [hillMat1, hillMat2, hillMat3];

        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const r = radius + (Math.sin(i * 3.7) * 450);
            const x = centerX + Math.cos(angle) * r;
            const z = centerZ + Math.sin(angle) * r;

            const h = 180 + Math.abs(Math.sin(i * 2.3)) * 260;
            const w = 450 + Math.abs(Math.cos(i * 1.7)) * 400;

            const mat = materials[i % materials.length];
            const hillGeo = new THREE.ConeGeometry(w / 2, h, 7);
            const hill = new THREE.Mesh(hillGeo, mat);
            hill.position.set(x, h / 2 - 20, z);
            hillsGroup.add(hill);
        }

        parent.add(hillsGroup);
    }

    // ── Extended Metropolitan Flanks & Highways ──
    static _buildMetropolitanFlanks(parent, colliders) {
        const metroGroup = new THREE.Group();
        const bldgMat1 = new THREE.MeshStandardMaterial({ color: 0x37474f, roughness: 0.6, metalness: 0.3 });
        const bldgMat2 = new THREE.MeshStandardMaterial({ color: 0x455a64, roughness: 0.5, metalness: 0.4 });
        const bldgMat3 = new THREE.MeshStandardMaterial({ color: 0x263238, roughness: 0.7, metalness: 0.2 });
        const mats = [bldgMat1, bldgMat2, bldgMat3];
        const beaconMat = new THREE.MeshBasicMaterial({ color: 0xff1744 });
        const beaconGeo = new THREE.SphereGeometry(1.2, 6, 6);

        // West Flank Buildings (X = -750 to -240, Z = -400 to -2600)
        for (let i = 0; i < 35; i++) {
            const w = 24 + Math.random() * 26;
            const h = 25 + Math.random() * 65;
            const d = 24 + Math.random() * 26;
            const bx = -280 - (i % 5) * 85 - (Math.random() * 40);
            const bz = -450 - Math.floor(i / 5) * 280 - (Math.random() * 60);

            const bldg = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mats[i % mats.length]);
            bldg.position.set(bx, h / 2, bz);
            bldg.castShadow = true;
            metroGroup.add(bldg);

            if (h > 45) {
                const beacon = new THREE.Mesh(beaconGeo, beaconMat);
                beacon.position.set(bx, h + 1.2, bz);
                metroGroup.add(beacon);
            }

            if (colliders) {
                colliders.push({
                    type: 'city_bldg_west',
                    box: new THREE.Box3(
                        new THREE.Vector3(bx - w / 2, 0, bz - d / 2),
                        new THREE.Vector3(bx + w / 2, h, bz + d / 2)
                    )
                });
            }
        }

        // East Flank Commercial & Freight Logistics (X = 420 to 820, Z = -400 to -2600)
        for (let i = 0; i < 28; i++) {
            const w = 32 + Math.random() * 32;
            const h = 18 + Math.random() * 35;
            const d = 32 + Math.random() * 32;
            const bx = 450 + (i % 4) * 90 + (Math.random() * 40);
            const bz = -450 - Math.floor(i / 4) * 290 - (Math.random() * 60);

            const bldg = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mats[(i + 1) % mats.length]);
            bldg.position.set(bx, h / 2, bz);
            bldg.castShadow = true;
            metroGroup.add(bldg);

            if (colliders) {
                colliders.push({
                    type: 'city_bldg_east',
                    box: new THREE.Box3(
                        new THREE.Vector3(bx - w / 2, 0, bz - d / 2),
                        new THREE.Vector3(bx + w / 2, h, bz + d / 2)
                    )
                });
            }
        }

        parent.add(metroGroup);
    }

    static _createGateMesh(gateDef) {
        const group = new THREE.Group();
        group.position.copy(gateDef.pos);

        const ringGeo = new THREE.TorusGeometry(gateDef.radius, 0.8, 12, 32);
        const ringMat = new THREE.MeshBasicMaterial({
            color: gateDef.required ? 0xffd600 : 0x00e676,
            transparent: true,
            opacity: 0.85
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        group.add(ring);

        const discGeo = new THREE.CircleGeometry(gateDef.radius * 0.95, 24);
        const discMat = new THREE.MeshBasicMaterial({
            color: gateDef.required ? 0xffd600 : 0x00e676,
            transparent: true,
            opacity: 0.15,
            side: THREE.DoubleSide
        });
        const disc = new THREE.Mesh(discGeo, discMat);
        group.add(disc);

        return group;
    }

    static _buildCitySkyline(parent, colliders, startX, startY, startZ, count) {
        const bldgMat = new THREE.MeshStandardMaterial({ color: 0x546e7a, roughness: 0.6, metalness: 0.3 });
        const beaconGeo = new THREE.SphereGeometry(1.2, 8, 8);
        const beaconMat = new THREE.MeshBasicMaterial({ color: 0xff1744 });

        for (let i = 0; i < count; i++) {
            const w = 20 + Math.random() * 30;
            const h = 25 + Math.random() * 70;
            const d = 20 + Math.random() * 30;

            const bldg = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), bldgMat);
            const bx = startX + (i % 6) * 70 + (Math.random() - 0.5) * 30;
            const bz = startZ + Math.floor(i / 6) * 70 + (Math.random() - 0.5) * 30;
            bldg.position.set(bx, h / 2, bz);
            bldg.castShadow = true;
            parent.add(bldg);

            const beacon = new THREE.Mesh(beaconGeo, beaconMat);
            beacon.position.set(bx, h + 1.5, bz);
            parent.add(beacon);

            if (colliders) {
                colliders.push({
                    type: 'skyline_bldg',
                    box: new THREE.Box3(
                        new THREE.Vector3(bx - w / 2, 0, bz - d / 2),
                        new THREE.Vector3(bx + w / 2, h, bz + d / 2)
                    )
                });
            }
        }
    }
}

window.StadiumBuilder = StadiumBuilder;
