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
                exitZ: -700,
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
                    { id: 6, pos: new THREE.Vector3(0, 70, -360), label: '🚀 PULL UP & CLIMB 🚀', radius: 25, required: true }
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

        // 1. Vast Terrain (3500m x 4500m)
        const grassMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.85 });
        const groundGeo = new THREE.PlaneGeometry(3500, 4500, 48, 48);
        groundGeo.rotateX(-Math.PI / 2);
        const ground = new THREE.Mesh(groundGeo, grassMat);
        ground.position.set(0, 0, 500);
        ground.receiveShadow = true;
        envGroup.add(ground);

        colliders.push({
            type: 'ground',
            y: 0,
            box: new THREE.Box3(new THREE.Vector3(-2000, -10, -2500), new THREE.Vector3(2000, 0, 3000))
        });

        // 2. High-Detail Procedural Stadium Bowl
        const proceduralStadium = this.buildProceduralStadium(stadiumId);
        proceduralStadium.group.position.set(0, 0, -100);
        envGroup.add(proceduralStadium.group);
        colliders.push(...proceduralStadium.colliders);

        // 3. Surrounding Geographic Environments
        const oceanMat = new THREE.MeshStandardMaterial({ color: 0x01579b, roughness: 0.1, metalness: 0.85, transparent: true, opacity: 0.92 });
        const beachSandMat = new THREE.MeshStandardMaterial({ color: 0xffe082, roughness: 0.9 });

        if (stadiumId === 'dhl') {
            // Table Mountain, Devil's Peak, Lion's Head & Atlantic Coast
            const mtnGroup = new THREE.Group();
            mtnGroup.position.set(0, 0, -850);
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

            // Atlantic Ocean Shoreline
            const ocean = new THREE.Mesh(new THREE.PlaneGeometry(1600, 4500), oceanMat);
            ocean.rotateX(-Math.PI / 2);
            ocean.position.set(950, 0.6, 500);
            envGroup.add(ocean);

            const beach = new THREE.Mesh(new THREE.PlaneGeometry(80, 4500), beachSandMat);
            beach.rotateX(-Math.PI / 2);
            beach.position.set(130, 0.8, 500);
            envGroup.add(beach);

            this._buildCitySkyline(envGroup, -500, 0, -550, 24);

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

            // Durban Indian Ocean & Beachfront
            const ocean = new THREE.Mesh(new THREE.PlaneGeometry(1600, 4500), oceanMat);
            ocean.rotateX(-Math.PI / 2);
            ocean.position.set(900, 0.6, 500);
            envGroup.add(ocean);

        } else if (stadiumId === 'ellis') {
            // Johannesburg Skyline & Highveld Ridge
            this._buildCitySkyline(envGroup, -550, 0, -600, 32);

        } else if (stadiumId === 'loftus') {
            // Pretoria Jacaranda Canopy
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

        // 4. Holographic Stunt Flight Gates
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

        // 5. Flare Cannons on Canopy
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

    static _buildCitySkyline(parent, startX, startY, startZ, count) {
        const bldgMat = new THREE.MeshStandardMaterial({ color: 0x546e7a, roughness: 0.6, metalness: 0.3 });

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

            const beacon = new THREE.Mesh(new THREE.SphereGeometry(1.2, 8, 8), new THREE.MeshBasicMaterial({ color: 0xff1744 }));
            beacon.position.set(bx, h + 1.5, bz);
            parent.add(beacon);
        }
    }
}

window.StadiumBuilder = StadiumBuilder;
