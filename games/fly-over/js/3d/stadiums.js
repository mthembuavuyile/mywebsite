/* ==========================================================================
   Stadiums & Environments Module — Authentic DHL Stadium & Flight Corridors
   ========================================================================== */

class StadiumBuilder {
    static getStadiumDefs() {
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
                    { id: 1, pos: new THREE.Vector3(0, 170, 1800), label: 'APPROACH GATE', radius: 35, required: false },
                    { id: 2, pos: new THREE.Vector3(0, 125, 1200), label: 'DESCENT GLIDESLOPE', radius: 30, required: false },
                    { id: 3, pos: new THREE.Vector3(0, 75, 550), label: 'STADIUM LINE-UP', radius: 25, required: false },
                    { id: 4, pos: new THREE.Vector3(0, 34, 60), label: '⚡ BOWL DIVE ENTRY ⚡', radius: 22, required: true },
                    { id: 5, pos: new THREE.Vector3(0, 10, -100), label: '🔥 APEX LOW SKIM 🔥', radius: 18, required: true },
                    { id: 6, pos: new THREE.Vector3(0, 70, -360), label: '🚀 PULL UP & CLIMB 🚀', radius: 25, required: true }
                ]
            },
            {
                id: 'moses',
                name: 'MOSES MABHIDA',
                city: 'DURBAN',
                subtitle: 'Beachfront 106m Arch Fly-Through',
                hazardText: 'Fly UNDER the central arch and skim the pitch for 3-star rating!',
                unlocked: true,
                startPos: new THREE.Vector3(0, 180, 2200),
                targetZ: -100,
                exitZ: -700,
                roofY: 36,
                fieldY: 4,
                archY: 72,
                windFactor: 1.1,
                thresholds: [18000, 40000, 75000],
                gates: [
                    { id: 1, pos: new THREE.Vector3(0, 170, 1800), label: 'COASTAL DESCENT', radius: 35, required: false },
                    { id: 2, pos: new THREE.Vector3(0, 120, 1200), label: 'BEACH APPROACH', radius: 30, required: false },
                    { id: 3, pos: new THREE.Vector3(0, 70, 550), label: 'ARCH ALIGNMENT', radius: 25, required: false },
                    { id: 4, pos: new THREE.Vector3(0, 32, 60), label: '⚡ UNDER-ARCH DIVE ⚡', radius: 20, required: true },
                    { id: 5, pos: new THREE.Vector3(0, 10, -100), label: '🔥 APEX LOW PASS 🔥', radius: 18, required: true },
                    { id: 6, pos: new THREE.Vector3(0, 65, -360), label: '🚀 EXIT CLIMB 🚀', radius: 25, required: true }
                ]
            },
            {
                id: 'ellis',
                name: 'ELLIS PARK',
                city: 'JOHANNESBURG',
                subtitle: 'Highveld Skyline & Light Masts',
                hazardText: 'Thin air requires higher throttle. Dodge floodlights.',
                unlocked: true,
                startPos: new THREE.Vector3(0, 180, 2200),
                targetZ: -100,
                exitZ: -700,
                roofY: 44,
                fieldY: 4,
                windFactor: 0.9,
                thresholds: [20000, 45000, 80000],
                gates: [
                    { id: 1, pos: new THREE.Vector3(0, 170, 1800), label: 'HIGHVELD APPROACH', radius: 35, required: false },
                    { id: 2, pos: new THREE.Vector3(0, 125, 1200), label: 'CITY DESCENT', radius: 30, required: false },
                    { id: 3, pos: new THREE.Vector3(0, 80, 550), label: 'TOWER CORRIDOR', radius: 25, required: false },
                    { id: 4, pos: new THREE.Vector3(0, 38, 60), label: '⚡ BOWL PLUNGE ⚡', radius: 22, required: true },
                    { id: 5, pos: new THREE.Vector3(0, 12, -100), label: '🔥 PITCH APEX 🔥', radius: 18, required: true },
                    { id: 6, pos: new THREE.Vector3(0, 75, -360), label: '🚀 FULL POWER CLIMB 🚀', radius: 25, required: true }
                ]
            },
            {
                id: 'loftus',
                name: 'LOFTUS VERSFELD',
                city: 'PRETORIA',
                subtitle: 'Jacaranda Valley Canyon Run',
                hazardText: 'Narrow airspace between towering vertical grandstands.',
                unlocked: true,
                startPos: new THREE.Vector3(0, 180, 2200),
                targetZ: -100,
                exitZ: -700,
                roofY: 46,
                fieldY: 4,
                windFactor: 0.8,
                thresholds: [22000, 50000, 85000],
                gates: [
                    { id: 1, pos: new THREE.Vector3(0, 170, 1800), label: 'VALLEY ENTRY', radius: 35, required: false },
                    { id: 2, pos: new THREE.Vector3(0, 125, 1200), label: 'JACARANDA GLIDE', radius: 30, required: false },
                    { id: 3, pos: new THREE.Vector3(0, 80, 550), label: 'CANYON LINE-UP', radius: 25, required: false },
                    { id: 4, pos: new THREE.Vector3(0, 38, 60), label: '⚡ GRANDSTAND DIVE ⚡', radius: 20, required: true },
                    { id: 5, pos: new THREE.Vector3(0, 12, -100), label: '🔥 APEX PASS 🔥', radius: 18, required: true },
                    { id: 6, pos: new THREE.Vector3(0, 75, -360), label: '🚀 SKY CLIMB 🚀', radius: 25, required: true }
                ]
            }
        ];
    }

    static buildEnvironment(scene, stadiumId) {
        const envGroup = new THREE.Group();
        const colliders = [];
        const flightGates = [];

        // ── Shared Materials ──
        const greenGrassMat = new THREE.MeshStandardMaterial({ color: 0x43a047, roughness: 0.85 });
        const fairwayGrassMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.8 });
        const pitchMat = new THREE.MeshStandardMaterial({ color: 0x1b5e20, roughness: 0.7 });
        const stadiumWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf0f4f8, roughness: 0.35, metalness: 0.25 });
        const stadiumRoofMat = new THREE.MeshStandardMaterial({ color: 0xdde6ed, roughness: 0.2, metalness: 0.35, transparent: true, opacity: 0.95 });
        const darkStandMat = new THREE.MeshStandardMaterial({ color: 0x263238, roughness: 0.8 });
        const postMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const yellowPadMat = new THREE.MeshBasicMaterial({ color: 0xffd600 });
        const oceanMat = new THREE.MeshStandardMaterial({ color: 0x01579b, roughness: 0.1, metalness: 0.85, transparent: true, opacity: 0.92 });
        const beachSandMat = new THREE.MeshStandardMaterial({ color: 0xffe082, roughness: 0.9 });

        // ── 1. Vast Terrain (3000m x 4000m) ──
        const groundGeo = new THREE.PlaneGeometry(3500, 4500, 48, 48);
        groundGeo.rotateX(-Math.PI / 2);
        const ground = new THREE.Mesh(groundGeo, greenGrassMat);
        ground.position.set(0, 0, 500);
        ground.receiveShadow = true;
        envGroup.add(ground);

        // Ground collider
        colliders.push({ type: 'ground', y: 0, box: new THREE.Box3(new THREE.Vector3(-2000, -10, -2500), new THREE.Vector3(2000, 0, 3000)) });

        // ── 2. DHL Stadium (Cape Town Stadium Bowl) ──
        const stadGroup = new THREE.Group();
        stadGroup.position.set(0, 0, -100);

        // Oval Dimensions (Length: 260m, Width: 210m, Height: 38m)
        // Exterior Wavy Saddle-Shaped Facade
        const facadeGeo = new THREE.CylinderGeometry(130, 115, 38, 64, 8, true);
        // Deform top vertices to create signature saddle wave (higher on sides, lower on ends)
        const posAttr = facadeGeo.attributes.position;
        for (let i = 0; i < posAttr.count; i++) {
            const y = posAttr.getY(i);
            if (y > 0) {
                const angle = Math.atan2(posAttr.getZ(i), posAttr.getX(i));
                const wave = Math.cos(angle * 2) * 5.5; // Saddle curve
                posAttr.setY(i, y + wave);
            }
        }
        facadeGeo.computeVertexNormals();

        const facadeMesh = new THREE.Mesh(facadeGeo, stadiumWhiteMat);
        facadeMesh.position.set(0, 19, 0);
        facadeMesh.scale.set(1.0, 1.0, 1.25); // Elliptical stretch
        facadeMesh.castShadow = true;
        facadeMesh.receiveShadow = true;
        stadGroup.add(facadeMesh);

        // Glass-Fabric Roof Canopy with Oval Center Hole
        const roofGeo = new THREE.RingGeometry(62, 132, 64, 4, 0, Math.PI * 2);
        roofGeo.rotateX(-Math.PI / 2);
        const roofMesh = new THREE.Mesh(roofGeo, stadiumRoofMat);
        roofMesh.position.set(0, 38, 0);
        roofMesh.scale.set(1.0, 1.0, 1.25);
        roofMesh.castShadow = true;
        roofMesh.receiveShadow = true;
        stadGroup.add(roofMesh);

        // Inner Tiered Grandstand Bowl
        const standGeo = new THREE.ConeGeometry(122, 34, 64, 4, true);
        standGeo.rotateX(Math.PI);
        const standMesh = new THREE.Mesh(standGeo, darkStandMat);
        standMesh.position.set(0, 18, 0);
        standMesh.scale.set(1.0, 1.0, 1.25);
        stadGroup.add(standMesh);

        // Dynamic 3D Crowd (Vibrant red, green, gold, white spectator points)
        const crowdCount = 1800;
        const crowdGeo = new THREE.BufferGeometry();
        const cPositions = new Float32Array(crowdCount * 3);
        const cColors = new Float32Array(crowdCount * 3);

        const crowdPalette = [
            [0.0, 0.55, 0.3], // Green
            [1.0, 0.82, 0.0], // Gold
            [0.9, 0.15, 0.15],// Red
            [0.1, 0.5, 0.9],  // Blue
            [0.95, 0.95, 0.95]// White
        ];

        for (let i = 0; i < crowdCount; i++) {
            const angle = (i / crowdCount) * Math.PI * 2 + Math.random() * 0.04;
            const radius = 58 + Math.random() * 58;
            const height = 4.5 + (radius - 58) * 0.52 + Math.random() * 1.5;

            cPositions[i * 3] = Math.cos(angle) * radius;
            cPositions[i * 3 + 1] = height;
            cPositions[i * 3 + 2] = Math.sin(angle) * (radius * 1.25);

            const col = crowdPalette[Math.floor(Math.random() * crowdPalette.length)];
            cColors[i * 3] = col[0];
            cColors[i * 3 + 1] = col[1];
            cColors[i * 3 + 2] = col[2];
        }

        crowdGeo.setAttribute('position', new THREE.BufferAttribute(cPositions, 3));
        crowdGeo.setAttribute('color', new THREE.BufferAttribute(cColors, 3));

        const crowdMat = new THREE.PointsMaterial({ size: 2.4, vertexColors: true });
        const crowdPoints = new THREE.Points(crowdGeo, crowdMat);
        stadGroup.add(crowdPoints);

        // Rugby Field Pitch
        const pitchGeo = new THREE.PlaneGeometry(68, 115);
        pitchGeo.rotateX(-Math.PI / 2);
        const pitch = new THREE.Mesh(pitchGeo, pitchMat);
        pitch.position.set(0, 3.9, 0);
        pitch.receiveShadow = true;
        stadGroup.add(pitch);

        // White Rugby Pitch Markings (Halfway line, 22m lines, center spot)
        const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        
        // Halfway line
        const midLine = new THREE.Mesh(new THREE.PlaneGeometry(66, 0.9), lineMat);
        midLine.rotateX(-Math.PI / 2);
        midLine.position.set(0, 3.95, 0);
        stadGroup.add(midLine);

        // 22-meter lines
        [-24, 24].forEach(z => {
            const line22 = new THREE.Mesh(new THREE.PlaneGeometry(66, 0.7), lineMat);
            line22.rotateX(-Math.PI / 2);
            line22.position.set(0, 3.95, z);
            stadGroup.add(line22);
        });

        // Rugby Goal Posts (Authentic White H-posts with Yellow Pads)
        [-46, 46].forEach(zPos => {
            const postGroup = new THREE.Group();
            postGroup.position.set(0, 3.9, zPos);

            // Left upright (16m tall)
            const upL = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 16), postMat);
            upL.position.set(-5.6, 8, 0);
            postGroup.add(upL);

            // Yellow crash pad at base
            const padL = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 2.2), yellowPadMat);
            padL.position.set(-5.6, 1.1, 0);
            postGroup.add(padL);

            // Right upright
            const upR = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 16), postMat);
            upR.position.set(5.6, 8, 0);
            postGroup.add(upR);

            const padR = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 2.2), yellowPadMat);
            padR.position.set(5.6, 1.1, 0);
            postGroup.add(padR);

            // Crossbar
            const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 11.2), postMat);
            bar.rotateZ(Math.PI / 2);
            bar.position.set(0, 4.2, 0);
            postGroup.add(bar);

            stadGroup.add(postGroup);

            colliders.push({
                type: 'post',
                box: new THREE.Box3(new THREE.Vector3(-6.5, 3.9, zPos - 102), new THREE.Vector3(6.5, 20, zPos - 98))
            });
        });

        // Stadium Outer Ring Road & Golf Course Lawn
        const golfLawn = new THREE.Mesh(new THREE.RingGeometry(135, 260, 48), fairwayGrassMat);
        golfLawn.rotateX(-Math.PI / 2);
        golfLawn.position.set(0, 0.2, 0);
        stadGroup.add(golfLawn);

        // Roof Canopy Colliders (Left & Right Flanks)
        colliders.push({
            type: 'roof_left',
            box: new THREE.Box3(new THREE.Vector3(-140, 32, -260), new THREE.Vector3(-55, 46, 60))
        });
        colliders.push({
            type: 'roof_right',
            box: new THREE.Box3(new THREE.Vector3(55, 32, -260), new THREE.Vector3(140, 46, 60))
        });

        // ── 3. Cape Town Backdrop (Table Mountain, Devil's Peak, Lion's Head) ──
        if (stadiumId === 'dhl') {
            const mtnGroup = new THREE.Group();
            mtnGroup.position.set(0, 0, -850);

            const mtnMat = new THREE.MeshStandardMaterial({ color: 0x455a64, roughness: 0.95 });
            const plateauTopMat = new THREE.MeshStandardMaterial({ color: 0x546e7a, roughness: 0.9 });
            const slopesMat = new THREE.MeshStandardMaterial({ color: 0x388e3c, roughness: 0.85 });

            // Table Mountain Main Flat Plateau (1000m wide, 350m high)
            const plateau = new THREE.Mesh(new THREE.BoxGeometry(850, 340, 240), mtnMat);
            plateau.position.set(0, 170, 0);
            mtnGroup.add(plateau);

            // Platteklip Gorge Shadow Cutout
            const gorge = new THREE.Mesh(new THREE.BoxGeometry(45, 345, 120), new THREE.MeshBasicMaterial({ color: 0x263238 }));
            gorge.position.set(-60, 170, 70);
            mtnGroup.add(gorge);

            // Table Flat Top Cap
            const topCap = new THREE.Mesh(new THREE.BoxGeometry(860, 12, 250), plateauTopMat);
            topCap.position.set(0, 340, 0);
            mtnGroup.add(topCap);

            // Devil's Peak (Left Eastern Peak - 420m)
            const devilsPeak = new THREE.Mesh(new THREE.ConeGeometry(210, 420, 16), mtnMat);
            devilsPeak.position.set(-520, 210, 30);
            mtnGroup.add(devilsPeak);

            // Lion's Head (Right Western Peak - 320m)
            const lionsHead = new THREE.Mesh(new THREE.ConeGeometry(150, 320, 16), mtnMat);
            lionsHead.position.set(520, 160, 80);
            mtnGroup.add(lionsHead);

            // Signal Hill Slopes
            const signalHill = new THREE.Mesh(new THREE.BoxGeometry(260, 140, 180), slopesMat);
            signalHill.position.set(620, 70, 140);
            mtnGroup.add(signalHill);

            // Green Mountain Foothills
            const foothills = new THREE.Mesh(new THREE.BoxGeometry(1100, 100, 180), slopesMat);
            foothills.position.set(0, 50, 90);
            mtnGroup.add(foothills);

            envGroup.add(mtnGroup);

            // Atlantic Ocean Shoreline (West of Stadium)
            const ocean = new THREE.Mesh(new THREE.PlaneGeometry(1600, 4500), oceanMat);
            ocean.rotateX(-Math.PI / 2);
            ocean.position.set(950, 0.6, 500);
            envGroup.add(ocean);

            // White Sand Beach Line
            const beach = new THREE.Mesh(new THREE.PlaneGeometry(80, 4500), beachSandMat);
            beach.rotateX(-Math.PI / 2);
            beach.position.set(130, 0.8, 500);
            envGroup.add(beach);

            // Cape Town City Skyline High-Rises (far from flight path)
            this._buildCitySkyline(envGroup, -500, 0, -550, 24);

        } else if (stadiumId === 'moses') {
            // ── Moses Mabhida Durban: The 106m Central Y-Arch ──
            const archGroup = new THREE.Group();
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
            const archTube = new THREE.TubeGeometry(archCurve, 64, 3.8, 16, false);
            const archMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.6 });
            const archMesh = new THREE.Mesh(archTube, archMat);
            archMesh.castShadow = true;
            archGroup.add(archMesh);

            stadGroup.add(archGroup);

            // Arch Collider (Over-arch or under-arch challenge)
            colliders.push({
                type: 'arch_spine',
                box: new THREE.Box3(new THREE.Vector3(-12, 85, -235), new THREE.Vector3(12, 105, 35))
            });

            // Durban Indian Ocean & Beach
            const ocean = new THREE.Mesh(new THREE.PlaneGeometry(1600, 4500), oceanMat);
            ocean.rotateX(-Math.PI / 2);
            ocean.position.set(900, 0.6, 500);
            envGroup.add(ocean);

        } else if (stadiumId === 'ellis') {
            // ── Ellis Park Johannesburg: 4 Towering Floodlight Masts ──
            const towerPositions = [
                [-145, -230], [145, -230],
                [-145, 30],   [145, 30]
            ];
            const towerMat = new THREE.MeshStandardMaterial({ color: 0x37474f, metalness: 0.8 });
            const glowMat = new THREE.MeshBasicMaterial({ color: 0xfff9c4 });

            towerPositions.forEach(([tx, tz]) => {
                const mast = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 2.8, 85, 8), towerMat);
                mast.position.set(tx, 42.5, tz);
                envGroup.add(mast);

                const head = new THREE.Mesh(new THREE.BoxGeometry(18, 6.5, 4.5), glowMat);
                head.position.set(tx, 83, tz);
                envGroup.add(head);

                colliders.push({
                    type: 'tower',
                    box: new THREE.Box3(new THREE.Vector3(tx - 10, 0, tz - 10), new THREE.Vector3(tx + 10, 88, tz + 10))
                });
            });

            this._buildCitySkyline(envGroup, -550, 0, -600, 24);

        } else if (stadiumId === 'loftus') {
            // ── Pretoria Loftus: Jacaranda Canopy Hills ──
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

        // ── 4. Perimeter Pyrotechnic Flare Cannons on Roof Rim ──
        const flareCanons = [];
        const flarePositions = [
            [-95, 38, -190], [95, 38, -190],
            [-115, 42, -100], [115, 42, -100],
            [-95, 38, -10],  [95, 38, -10],
            [-60, 34, 35],   [60, 34, 35]
        ];

        flarePositions.forEach(pos => {
            const cannon = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 2.5), darkStandMat);
            cannon.position.set(pos[0], pos[1] + 1.25, pos[2]);
            envGroup.add(cannon);
            flareCanons.push(new THREE.Vector3(pos[0], pos[1] + 2.5, pos[2]));
        });

        // ── 5. Holographic Flight Stunt Gates ──
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

        envGroup.add(stadGroup);
        scene.add(envGroup);

        return {
            group: envGroup,
            stadiumGroup: stadGroup,
            colliders: colliders,
            flarePositions: flareCanons,
            flightGates: flightGates
        };
    }

    static _createGateMesh(gateDef) {
        const group = new THREE.Group();
        group.position.copy(gateDef.pos);

        // Holographic Glowing Torus Ring
        const ringGeo = new THREE.TorusGeometry(gateDef.radius, 0.8, 12, 32);
        const ringMat = new THREE.MeshBasicMaterial({
            color: gateDef.required ? 0xffd600 : 0x00e676,
            transparent: true,
            opacity: 0.85
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        group.add(ring);

        // Inner glowing translucent target disc
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

            // Top beacon
            const beacon = new THREE.Mesh(new THREE.SphereGeometry(1.2, 8, 8), new THREE.MeshBasicMaterial({ color: 0xff1744 }));
            beacon.position.set(bx, h + 1.5, bz);
            parent.add(beacon);
        }
    }
}

window.StadiumBuilder = StadiumBuilder;
