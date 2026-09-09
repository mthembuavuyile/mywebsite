import { state } from '../state.js';
import { CONFIG } from '../config.js';

export function setupGraphics() {
    state.clock = new THREE.Clock();

    state.scene = new THREE.Scene();
    state.scene.background = new THREE.Color(0x060912);
    state.scene.fog = new THREE.FogExp2(0x060912, 0.016);

    state.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.05, 1000);

    state.renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('gameCanvas'),
        antialias: true,
        powerPreference: "high-performance"
    });
    state.renderer.setSize(window.innerWidth, window.innerHeight);
    state.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    state.renderer.shadowMap.enabled = true;
    state.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    setupLighting();
}

function setupLighting() {
    const ambient = new THREE.HemisphereLight(0x334466, 0x050a10, 0.6);
    state.scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0x99ccff, 0.85);
    dirLight.position.set(30, 50, -20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 160;
    const d = 60;
    dirLight.shadow.camera.left = -d; dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d; dirLight.shadow.camera.bottom = -d;
    state.scene.add(dirLight);

    const pLight1 = new THREE.PointLight(0xff3300, 1.2, 35);
    pLight1.position.set(-30, 6, -30);
    state.scene.add(pLight1);

    const pLight2 = new THREE.PointLight(0x00f0ff, 1.2, 35);
    pLight2.position.set(30, 6, 30);
    state.scene.add(pLight2);
}

export function onResize() {
    if (state.camera && state.renderer) {
        state.camera.aspect = window.innerWidth / window.innerHeight;
        state.camera.updateProjectionMatrix();
        state.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
