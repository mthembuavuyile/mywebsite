import { state } from '../state.js';
import { CONFIG } from '../config.js';

export function setupGraphics() {
    state.clock = new THREE.Clock();

    state.scene = new THREE.Scene();
    state.scene.background = new THREE.Color(0x050811);
    state.scene.fog = new THREE.FogExp2(0x050811, CONFIG.fogDensity);

    state.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.05, 1000);

    const canvas = document.getElementById('gameCanvas');
    state.renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        powerPreference: 'high-performance'
    });
    state.renderer.setSize(window.innerWidth, window.innerHeight);
    state.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    state.renderer.shadowMap.enabled = true;
    state.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    state.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    state.renderer.toneMappingExposure = 1.05;

    setupLighting();
}

function setupLighting() {
    // Ambient tactical lighting
    const ambient = new THREE.HemisphereLight(0x2d3748, 0x070b14, 0.65);
    state.scene.add(ambient);

    // Primary directional moonlight / floodlight
    const dirLight = new THREE.DirectionalLight(0xa5b4fc, 0.9);
    dirLight.position.set(40, 60, -30);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 180;
    const d = 75;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.bias = -0.0005;
    state.scene.add(dirLight);

    // Red sector beacon
    const pLightRed = new THREE.PointLight(0xef4444, 1.4, 40);
    pLightRed.position.set(-35, 7, -35);
    state.scene.add(pLightRed);

    // Cyan quarantine beacon
    const pLightCyan = new THREE.PointLight(0x06b6d4, 1.4, 40);
    pLightCyan.position.set(35, 7, 35);
    state.scene.add(pLightCyan);
}

export function onResize() {
    if (state.camera && state.renderer) {
        state.camera.aspect = window.innerWidth / window.innerHeight;
        state.camera.updateProjectionMatrix();
        state.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
