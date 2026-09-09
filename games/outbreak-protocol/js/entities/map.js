import { state } from '../state.js';
import { CONFIG } from '../config.js';

export function createEnvironment() {
    const size = CONFIG.groundSize;
    state.obstacles = [];
    state.obstacleBoxes = [];

    // Quarantine Ground Arena
    const groundMat = new THREE.MeshStandardMaterial({
        map: createTacticalGroundTexture(),
        roughness: 0.75,
        metalness: 0.25
    });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(size, size), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    state.scene.add(ground);

    // Perimeter Containment Walls
    const wallMat = new THREE.MeshStandardMaterial({
        color: 0x111827,
        roughness: 0.85,
        metalness: 0.2
    });
    const wallAccentMat = new THREE.MeshStandardMaterial({
        color: 0xef4444,
        emissive: 0xef4444,
        emissiveIntensity: 0.35
    });

    const wallH = 9;
    const wallT = 2.5;
    const halfS = size / 2;

    const walls = [
        { pos: [0, wallH / 2, -halfS], size: [size, wallH, wallT] },
        { pos: [0, wallH / 2, halfS], size: [size, wallH, wallT] },
        { pos: [-halfS, wallH / 2, 0], size: [wallT, wallH, size] },
        { pos: [halfS, wallH / 2, 0], size: [wallT, wallH, size] }
    ];

    walls.forEach(w => {
        const wallGroup = new THREE.Group();
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(...w.size), wallMat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        wallGroup.add(mesh);

        // Warning light strip on top of wall
        const stripSize = w.size[0] > w.size[2] ? [w.size[0], 0.25, 0.4] : [0.4, 0.25, w.size[2]];
        const strip = new THREE.Mesh(new THREE.BoxGeometry(...stripSize), wallAccentMat);
        strip.position.set(0, wallH / 2 - 0.2, 0);
        wallGroup.add(strip);

        wallGroup.position.set(...w.pos);
        state.scene.add(wallGroup);

        // Cache AABB bounding box for wall collision
        const box = new THREE.Box3().setFromObject(mesh);
        state.obstacleBoxes.push(box);
        state.obstacles.push(mesh);
    });

    // Create tactical interior covers and obstacles
    createMapObstacles();
}

function createTacticalGroundTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Dark asphalt base
    ctx.fillStyle = '#0a0e1a';
    ctx.fillRect(0, 0, 512, 512);

    // Tactical quarantine grid lines
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.09)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 512; i += 32) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 512);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(512, i);
        ctx.stroke();
    }

    // Concrete noise speckles
    for (let i = 0; i < 5000; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const s = Math.random() * 2 + 1;
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.04})`;
        ctx.fillRect(x, y, s, s);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(16, 16);
    return texture;
}

function createMapObstacles() {
    const numProps = 28;
    const matCrate = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.7, metalness: 0.3 });
    const matBarrel = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.4, metalness: 0.6 });
    const matToxic = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.3, emissive: 0x15803d, emissiveIntensity: 0.45 });
    const matPillar = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });

    for (let i = 0; i < numProps; i++) {
        const x = (Math.random() - 0.5) * (CONFIG.groundSize - 40);
        const z = (Math.random() - 0.5) * (CONFIG.groundSize - 40);

        // Keep starting center spawn area clear
        if (Math.abs(x) < 14 && Math.abs(z) < 14) continue;

        const type = i % 4;
        let mesh;

        if (type === 0) {
            // Military crate
            mesh = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.4, 2.6), matCrate);
            mesh.position.set(x, 1.2, z);
        } else if (type === 1) {
            // Fuel drum
            mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 2.2, 16), matBarrel);
            mesh.position.set(x, 1.1, z);
        } else if (type === 2) {
            // Biohazard containment tank
            mesh = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 2.3, 16), matToxic);
            mesh.position.set(x, 1.15, z);
            const light = new THREE.PointLight(0x22c55e, 0.75, 7);
            light.position.set(0, 1.1, 0);
            mesh.add(light);
        } else {
            // Reinforced defense pillar
            mesh = new THREE.Mesh(new THREE.BoxGeometry(2.2, 5.0, 2.2), matPillar);
            mesh.position.set(x, 2.5, z);
        }

        mesh.castShadow = true;
        mesh.receiveShadow = true;
        state.scene.add(mesh);

        // Precompute AABB for physics engine
        const box = new THREE.Box3().setFromObject(mesh);
        state.obstacleBoxes.push(box);
        state.obstacles.push(mesh);
    }
}
