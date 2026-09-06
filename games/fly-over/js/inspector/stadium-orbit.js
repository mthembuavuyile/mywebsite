/* ==========================================================================
   Stadium Orbit Inspector Module
   Procedural 3D Stadium geometry generator with free orbit camera controls
   and multi-venue theme customization.
   ========================================================================== */

(function () {
    const VENUES = window.VENUES || {
        dhl: {
            name: "DHL Stadium",
            city: "Cape Town",
            capacity: "55,000",
            pitchLength: 210,
            pitchWidth: 130,
            palette: [0x002f6c, 0xffd100, 0xffffff, 0x0055a5], // Stormers / WP Blue & Gold
            skyColor: 0x0b1220,
            fogColor: 0x0b1220
        },
        moses: {
            name: "Moses Mabhida Stadium",
            city: "Durban",
            capacity: "56,000",
            pitchLength: 215,
            pitchWidth: 132,
            palette: [0x000000, 0xffd100, 0xffffff, 0x007a3d], // Sharks / Coastal Black & Gold
            skyColor: 0x071526,
            fogColor: 0x071526
        },
        ellis: {
            name: "Emirates Airline Park (Ellis Park)",
            city: "Johannesburg",
            capacity: "62,567",
            pitchLength: 210,
            pitchWidth: 135,
            palette: [0xd32f2f, 0xffffff, 0xb71c1c, 0x212121], // Lions Red & White
            skyColor: 0x16131c,
            fogColor: 0x16131c
        },
        loftus: {
            name: "Loftus Versfeld Stadium",
            city: "Pretoria",
            capacity: "51,762",
            pitchLength: 205,
            pitchWidth: 128,
            palette: [0x1565c0, 0x90caf9, 0xffffff, 0x0d47a1], // Bulls Blue & White
            skyColor: 0x0a1420,
            fogColor: 0x0a1420
        }
    };

    let currentVenueKey = 'dhl';

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(VENUES.dhl.skyColor);
    scene.fog = new THREE.Fog(VENUES.dhl.fogColor, 250, 950);

    const camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 2500);
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xbfd9ff, 0x1b1f14, 1.0));
    const sun = new THREE.DirectionalLight(0xfff2df, 1.1);
    sun.position.set(180, 320, 120);
    scene.add(sun);

    // Helpers
    function stadiumOutline(length, width, segments) {
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

    function grassTexture() {
        const c = document.createElement('canvas');
        c.width = c.height = 512;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#227027';
        ctx.fillRect(0, 0, 512, 512);
        for (let i = 0; i < 16; i++) {
            ctx.fillStyle = i % 2 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)';
            ctx.fillRect(i * 32, 0, 32, 512);
        }
        ctx.strokeStyle = 'rgba(255,255,255,0.6)';
        ctx.lineWidth = 3;
        ctx.strokeRect(20, 20, 472, 472);
        ctx.beginPath(); ctx.moveTo(256, 20); ctx.lineTo(256, 492); ctx.stroke();
        ctx.beginPath(); ctx.arc(256, 256, 60, 0, Math.PI * 2); ctx.stroke();
        return new THREE.CanvasTexture(c);
    }

    // Ground
    const ground = new THREE.Mesh(
        new THREE.CircleGeometry(520, 40),
        new THREE.MeshStandardMaterial({ color: 0x14181f, roughness: 1 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.15;
    scene.add(ground);

    // Group for dynamic stadium elements that re-generate on theme switch
    const stadiumGroup = new THREE.Group();
    scene.add(stadiumGroup);

    let pitchMesh = null;
    let bowlMesh = null;
    let roofMesh = null;
    let seatMeshes = [];

    function buildStadium(venueKey) {
        const v = VENUES[venueKey] || VENUES.dhl;
        currentVenueKey = venueKey;

        // Clear existing dynamic meshes
        while (stadiumGroup.children.length > 0) {
            const obj = stadiumGroup.children[0];
            stadiumGroup.remove(obj);
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
                else obj.material.dispose();
            }
        }
        seatMeshes = [];

        scene.background.set(v.skyColor);
        scene.fog.color.set(v.fogColor);

        // Pitch
        const pitchLength = v.pitchLength, pitchWidth = v.pitchWidth;
        const pitchGeo = new THREE.PlaneGeometry(pitchLength, pitchWidth);
        pitchGeo.rotateX(-Math.PI / 2);
        pitchMesh = new THREE.Mesh(pitchGeo, new THREE.MeshStandardMaterial({ map: grassTexture(), roughness: 0.95 }));
        stadiumGroup.add(pitchMesh);

        // Bowl
        const baseOutline = stadiumOutline(pitchLength + 70, pitchWidth + 70, 30);
        const TIERS = 20, GROWTH = 0.55, BOWL_HEIGHT = 85, EASE = 0.85;

        const ringsPts = [], ringsY = [];
        for (let i = 0; i <= TIERS; i++) {
            const t = i / TIERS;
            const scale = 1 + t * GROWTH;
            ringsPts.push(baseOutline.map(p => p.clone().multiplyScalar(scale)));
            ringsY.push(Math.pow(t, EASE) * BOWL_HEIGHT);
        }

        const positions = [], colors = [];
        const low = new THREE.Color(0x2b343d), high = new THREE.Color(0x768894);
        const M = baseOutline.length;
        for (let i = 0; i < TIERS; i++) {
            const y0 = ringsY[i], y1 = ringsY[i + 1];
            const c0 = low.clone().lerp(high, i / TIERS);
            const c1 = low.clone().lerp(high, (i + 1) / TIERS);
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

        bowlMesh = new THREE.Mesh(bowlGeo, new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 0.95 }));
        stadiumGroup.add(bowlMesh);

        // Seats (Instanced)
        const PALETTE = v.palette;
        const BLOCK = 8;
        const groups = {};
        for (let i = 3; i <= TIERS - 1; i++) {
            ringsPts[i].forEach((p, j) => {
                const color = PALETTE[Math.floor(j / BLOCK) % PALETTE.length];
                (groups[color] = groups[color] || []).push({ x: p.x, y: ringsY[i] + 1, z: p.y });
            });
        }

        const dummy = new THREE.Object3D();
        let totalSeats = 0;
        Object.entries(groups).forEach(([hex, arr]) => {
            totalSeats += arr.length;
            const mesh = new THREE.InstancedMesh(
                new THREE.BoxGeometry(2.4, 1.7, 1.9),
                new THREE.MeshStandardMaterial({ color: parseInt(hex), roughness: 0.85 }),
                arr.length
            );
            arr.forEach((s, idx) => {
                dummy.position.set(s.x, s.y, s.z);
                dummy.lookAt(0, s.y, 0);
                dummy.updateMatrix();
                mesh.setMatrixAt(idx, dummy.matrix);
            });
            mesh.instanceMatrix.needsUpdate = true;
            stadiumGroup.add(mesh);
            seatMeshes.push(mesh);
        });

        // Roof Canopy
        const roofOuter = baseOutline.map(p => p.clone().multiplyScalar(1 + GROWTH * 1.12));
        const roofInner = baseOutline.map(p => p.clone().multiplyScalar(1 + GROWTH * 0.92));
        const roofShape = new THREE.Shape(roofOuter);
        roofShape.holes.push(new THREE.Path(roofInner));
        const roofGeo = new THREE.ExtrudeGeometry(roofShape, { depth: 3.5, bevelEnabled: false });
        roofGeo.rotateX(Math.PI / 2);
        roofGeo.translate(0, BOWL_HEIGHT + 6, 0);
        roofMesh = new THREE.Mesh(roofGeo, new THREE.MeshStandardMaterial({ color: 0x1c232b, roughness: 0.5, metalness: 0.35, side: THREE.DoubleSide }));
        stadiumGroup.add(roofMesh);

        // Update HUD
        const nameEl = document.getElementById('venue-name');
        const cityEl = document.getElementById('venue-city');
        const capEl = document.getElementById('venue-capacity');
        const seatsEl = document.getElementById('venue-seats');

        if (nameEl) nameEl.textContent = v.name;
        if (cityEl) cityEl.textContent = v.city;
        if (capEl) capEl.textContent = v.capacity;
        if (seatsEl) seatsEl.textContent = totalSeats.toLocaleString();
    }

    // Floodlights (Static)
    function floodlight(x, z) {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.4, 95, 8), new THREE.MeshStandardMaterial({ color: 0x3a4650 }));
        pole.position.set(x, 47.5, z);
        scene.add(pole);
        const head = new THREE.Mesh(new THREE.BoxGeometry(15, 7, 4), new THREE.MeshStandardMaterial({ color: 0xfff6da, emissive: 0xfff6da, emissiveIntensity: 0.7 }));
        head.position.set(x, 96, z);
        head.lookAt(0, 60, 0);
        scene.add(head);
    }
    [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([sx, sz]) => floodlight(sx * 175, sz * 115));

    // Orbit Camera Controls
    let angle = 0.5, elev = 0.45, dist = 340;
    let dragging = false, lastX = 0, lastY = 0;

    renderer.domElement.addEventListener('pointerdown', (e) => {
        dragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
    });

    window.addEventListener('pointerup', () => (dragging = false));
    window.addEventListener('pointermove', (e) => {
        if (!dragging) return;
        angle -= (e.clientX - lastX) * 0.005;
        elev = Math.min(1.4, Math.max(0.12, elev - (e.clientY - lastY) * 0.004));
        lastX = e.clientX;
        lastY = e.clientY;
    });

    renderer.domElement.addEventListener('wheel', (e) => {
        dist = Math.min(680, Math.max(80, dist + e.deltaY * 0.3));
    }, { passive: true });

    function updateCamera() {
        camera.position.set(
            Math.sin(angle) * Math.cos(elev) * dist,
            Math.sin(elev) * dist + 15,
            Math.cos(angle) * Math.cos(elev) * dist
        );
        camera.lookAt(0, 40, 0);
    }

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Initial build
    buildStadium('dhl');

    // UI Buttons
    document.querySelectorAll('.venue-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.venue-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const vKey = btn.getAttribute('data-venue');
            if (vKey) buildStadium(vKey);
        });
    });

    // Check query param for initial stadium (e.g., stadiumdemo.html?venue=moses)
    const urlParams = new URLSearchParams(window.location.search);
    const initialVenue = urlParams.get('venue');
    if (initialVenue && VENUES[initialVenue]) {
        const btn = document.querySelector(`.venue-btn[data-venue="${initialVenue}"]`);
        if (btn) btn.click();
    }

    function animate() {
        requestAnimationFrame(animate);
        updateCamera();
        renderer.render(scene, camera);
    }
    animate();
})();
