import { state } from '../state.js';
import { CONFIG } from '../config.js';

export function createEnvironment() {
    const size = CONFIG.groundSize;

    const groundMat = new THREE.MeshStandardMaterial({
        map: createGroundTexture(),
        roughness: 0.7, metalness: 0.3
    });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(size, size), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    state.scene.add(ground);

    const wallMat = new THREE.MeshStandardMaterial({ color: 0x141b28, roughness: 0.8 });
    const wallH = 8, wallT = 2, halfS = size / 2;

    const walls = [
        { pos: [0, wallH / 2, -halfS], size: [size, wallH, wallT] },
        { pos: [0, wallH / 2, halfS], size: [size, wallH, wallT] },
        { pos: [-halfS, wallH / 2, 0], size: [wallT, wallH, size] },
        { pos: [halfS, wallH / 2, 0], size: [wallT, wallH, size] }
    ];

    walls.forEach(w => {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(...w.size), wallMat);
        mesh.position.set(...w.pos);
        mesh.castShadow = true; mesh.receiveShadow = true;
        state.scene.add(mesh);
        state.obstacles.push(mesh);
    });

    createMapObstacles();
}

function createGroundTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0e121e';
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 512; i += 32) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 512); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(512, i); ctx.stroke();
    }

    for (let i = 0; i < 6000; i++) {
        const x = Math.random() * 512, y = Math.random() * 512, s = Math.random() * 2 + 1;
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.05})`;
        ctx.fillRect(x, y, s, s);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(14, 14);
    return texture;
}

function createMapObstacles() {
    const numProps = 24;
    const matCrate = new THREE.MeshStandardMaterial({ color: 0x5a4028, roughness: 0.8 });
    const matBarrel = new THREE.MeshStandardMaterial({ color: 0xaa2222, roughness: 0.4, metalness: 0.6 });
    const matToxic = new THREE.MeshStandardMaterial({ color: 0x22aa33, roughness: 0.3, emissive: 0x115511, emissiveIntensity: 0.4 });

    for (let i = 0; i < numProps; i++) {
        const x = (Math.random() - 0.5) * (CONFIG.groundSize - 35);
        const z = (Math.random() - 0.5) * (CONFIG.groundSize - 35);
        if (Math.abs(x) < 12 && Math.abs(z) < 12) continue;

        const type = i % 4;
        let mesh;

        if (type === 0) {
            mesh = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2.5, 2.5), matCrate);
            mesh.position.set(x, 1.25, z);
        } else if (type === 1) {
            mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 2.2, 16), matBarrel);
            mesh.position.set(x, 1.1, z);
        } else if (type === 2) {
            mesh = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 2.2, 16), matToxic);
            mesh.position.set(x, 1.1, z);
            const light = new THREE.PointLight(0x00ff44, 0.8, 8);
            light.position.set(0, 1, 0);
            mesh.add(light);
        } else {
            mesh = new THREE.Mesh(new THREE.BoxGeometry(2, 5, 2), new THREE.MeshStandardMaterial({ color: 0x323a48 }));
            mesh.position.set(x, 2.5, z);
        }

        mesh.castShadow = true; mesh.receiveShadow = true;
        state.scene.add(mesh);
        state.obstacles.push(mesh);
    }
}
