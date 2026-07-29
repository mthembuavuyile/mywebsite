
        /**
         * Outbreak Protocol Engine
         * Features: GLTF 3D Models (FBI & Zombie), Procedural 3D Fallbacks, Multi-weapon Arsenal,
         * Direction Fix, Dynamic Shadows & Lighting, Glassmorphism HUD, Radar Sweep Minimap.
         */

        const CONFIG = {
            groundSize: 150,
            playerSpeed: 9.5,
            mouseSens: 0.0022,
            minPitch: -Math.PI / 2.2,
            maxPitch: Math.PI / 2.2
        };

        const WEAPONS = [
            { name: 'Pistol', damage: 35, cooldown: 220, magSize: 12, reloadTime: 1200, speed: 2.2, color: 0xffff44, spread: 0.01, pellets: 1, recoil: 0.03 },
            { name: 'Assault Rifle', damage: 24, cooldown: 110, magSize: 30, reloadTime: 1600, speed: 2.6, color: 0xffaa00, spread: 0.03, pellets: 1, recoil: 0.04 },
            { name: 'Shotgun', damage: 18, cooldown: 650, magSize: 6, reloadTime: 2000, speed: 2.0, color: 0xff4400, spread: 0.12, pellets: 8, recoil: 0.12 },
            { name: 'Plasma Cannon', damage: 90, cooldown: 550, magSize: 8, reloadTime: 1800, speed: 1.5, color: 0x00f0ff, spread: 0.005, pellets: 1, recoil: 0.08, isPlasma: true, splashRadius: 4.5 }
        ];

        const ENEMY_TYPES = [
            { type: 'walker', name: 'Walker', health: 100, speed: 0.04, damage: 8, color: 0x3d703d, size: 1.0, attackCd: 900 },
            { type: 'runner', name: 'Runner', health: 65, speed: 0.08, damage: 5, color: 0x992222, size: 0.9, attackCd: 600 },
            { type: 'tank', name: 'Tank', health: 260, speed: 0.025, damage: 18, color: 0x334466, size: 1.45, attackCd: 1300 },
            { type: 'spitter', name: 'Toxic Spitter', health: 90, speed: 0.045, damage: 12, color: 0x22aa44, size: 1.05, attackCd: 1800, isRanged: true }
        ];

        let scene, camera, renderer, clock;
        let player, playerBody, weaponHolder, laserSight;
        let playerGltfModel = null, zombieGltfModel = null;
        let currentWeaponIdx = 0;
        let weaponState = WEAPONS.map(w => ({ ammo: w.magSize, isReloading: false }));

        let score = 0, wave = 1, health = 100, maxHealth = 100;
        let gameActive = false, isPaused = false, isThirdPerson = false;

        let bullets = [], enemies = [], spitProjectiles = [], particles = [], powerUps = [], obstacles = [];
        let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
        let isShooting = false, lastShootTime = 0;

        let touchMoveActive = false, touchMoveDir = { x: 0, y: 0 };
        let minimapCtx, audioCtx;

        // Sound System Synthesizer
        function initAudio() {
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                audioCtx = new AudioContext();
            } catch (e) { console.warn('AudioContext not supported'); }
        }

        function playSound(type) {
            if (!audioCtx) return;
            if (audioCtx.state === 'suspended') audioCtx.resume();

            const now = audioCtx.currentTime;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            switch (type) {
                case 'pistol':
                    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(400, now); osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);
                    gain.gain.setValueAtTime(0.4, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                    osc.start(now); osc.stop(now + 0.15); break;
                case 'rifle':
                    osc.type = 'square'; osc.frequency.setValueAtTime(500, now); osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
                    gain.gain.setValueAtTime(0.3, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                    osc.start(now); osc.stop(now + 0.1); break;
                case 'shotgun':
                    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(250, now); osc.frequency.exponentialRampToValueAtTime(40, now + 0.3);
                    gain.gain.setValueAtTime(0.6, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                    osc.start(now); osc.stop(now + 0.3); break;
                case 'plasma':
                    osc.type = 'sine'; osc.frequency.setValueAtTime(800, now); osc.frequency.exponentialRampToValueAtTime(150, now + 0.25);
                    gain.gain.setValueAtTime(0.5, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
                    osc.start(now); osc.stop(now + 0.25); break;
                case 'hit':
                    osc.type = 'triangle'; osc.frequency.setValueAtTime(300, now); osc.frequency.linearRampToValueAtTime(100, now + 0.08);
                    gain.gain.setValueAtTime(0.3, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
                    osc.start(now); osc.stop(now + 0.08); break;
                case 'reload':
                    osc.type = 'sine'; osc.frequency.setValueAtTime(300, now); osc.frequency.linearRampToValueAtTime(600, now + 0.15);
                    gain.gain.setValueAtTime(0.2, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                    osc.start(now); osc.stop(now + 0.15); break;
                case 'explosion':
                    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(120, now); osc.frequency.exponentialRampToValueAtTime(20, now + 0.5);
                    gain.gain.setValueAtTime(0.7, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
                    osc.start(now); osc.stop(now + 0.5); break;
                case 'health':
                    osc.type = 'sine'; osc.frequency.setValueAtTime(440, now); osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);
                    gain.gain.setValueAtTime(0.4, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
                    osc.start(now); osc.stop(now + 0.25); break;
            }
        }

        // Initialize Engine
        function init() {
            clock = new THREE.Clock();

            scene = new THREE.Scene();
            scene.background = new THREE.Color(0x060912);
            scene.fog = new THREE.FogExp2(0x060912, 0.016);

            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.05, 1000);

            renderer = new THREE.WebGLRenderer({
                canvas: document.getElementById('gameCanvas'),
                antialias: true,
                powerPreference: "high-performance"
            });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;

            setupLighting();
            createEnvironment();
            createPlayer();
            initMinimap();
            initAudio();

            // Load Models
            loadPlayerModelGLTF();
            loadZombieModelGLTF();

            setupEventListeners();
            setupUI();

            if (/Android|iPhone|iPad/i.test(navigator.userAgent)) {
                document.getElementById('touchControls').style.display = 'flex';
                document.getElementById('viewBtnTouch').style.display = 'block';
            }
        }

        function setupLighting() {
            const ambient = new THREE.HemisphereLight(0x334466, 0x050a10, 0.6);
            scene.add(ambient);

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
            scene.add(dirLight);

            const pLight1 = new THREE.PointLight(0xff3300, 1.2, 35);
            pLight1.position.set(-30, 6, -30);
            scene.add(pLight1);

            const pLight2 = new THREE.PointLight(0x00f0ff, 1.2, 35);
            pLight2.position.set(30, 6, 30);
            scene.add(pLight2);
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

        function createEnvironment() {
            const size = CONFIG.groundSize;

            const groundMat = new THREE.MeshStandardMaterial({
                map: createGroundTexture(),
                roughness: 0.7, metalness: 0.3
            });
            const ground = new THREE.Mesh(new THREE.PlaneGeometry(size, size), groundMat);
            ground.rotation.x = -Math.PI / 2;
            ground.receiveShadow = true;
            scene.add(ground);

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
                scene.add(mesh);
                obstacles.push(mesh);
            });

            createMapObstacles();
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
                scene.add(mesh);
                obstacles.push(mesh);
            }
        }

        function createPlayer() {
            player = new THREE.Group();
            player.position.set(0, 0, 0);
            scene.add(player);

            // Procedural 3D Fallback Body for 3rd Person
            playerBody = new THREE.Group();

            const matArmor = new THREE.MeshStandardMaterial({ color: 0x162032, roughness: 0.4, metalness: 0.6 });
            const matCloth = new THREE.MeshStandardMaterial({ color: 0x0d121c, roughness: 0.8 });
            const matSkin = new THREE.MeshStandardMaterial({ color: 0xe0b58e, roughness: 0.6 });
            const matVisor = new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x00f0ff, emissiveIntensity: 0.8 });
            const matGun = new THREE.MeshStandardMaterial({ color: 0x11151c, roughness: 0.3, metalness: 0.8 });

            const torso = new THREE.Mesh(new THREE.BoxGeometry(0.75, 1.0, 0.45), matArmor);
            torso.position.y = 1.2; torso.castShadow = true;
            playerBody.add(torso);

            const badge = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.47), matVisor);
            badge.position.set(0, 1.35, 0.02);
            playerBody.add(badge);

            const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), matSkin);
            head.position.y = 1.9; head.castShadow = true;
            playerBody.add(head);

            const helmet = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.34, 0.22, 16), matArmor);
            helmet.position.y = 2.0; playerBody.add(helmet);

            const visor = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.12, 0.22), matVisor);
            visor.position.set(0, 1.92, -0.18); playerBody.add(visor);

            const legGeo = new THREE.CylinderGeometry(0.13, 0.11, 0.85, 12);
            const legL = new THREE.Mesh(legGeo, matCloth);
            legL.name = 'legL'; legL.position.set(-0.22, 0.425, 0); legL.castShadow = true;
            const legR = legL.clone(); legR.name = 'legR'; legR.position.x = 0.22;
            playerBody.add(legL, legR);

            const armGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.7, 10);
            const armL3rd = new THREE.Mesh(armGeo, matArmor);
            armL3rd.name = 'armL3rd'; armL3rd.position.set(-0.45, 1.35, -0.2); armL3rd.rotation.set(-Math.PI / 4, 0.2, 0.3);
            const armR3rd = new THREE.Mesh(armGeo, matArmor);
            armR3rd.name = 'armR3rd'; armR3rd.position.set(0.45, 1.35, -0.2); armR3rd.rotation.set(-Math.PI / 3, -0.3, -0.3);
            playerBody.add(armL3rd, armR3rd);

            const gun3rd = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.6), matGun);
            gun3rd.position.set(0.2, 1.25, -0.4); gun3rd.rotation.y = -0.1;
            playerBody.add(gun3rd);

            playerBody.visible = false;
            player.add(playerBody);

            camera.position.set(0, 1.7, 0);
            player.add(camera);

            weaponHolder = new THREE.Group();
            weaponHolder.position.set(0.32, -0.28, -0.55);
            camera.add(weaponHolder);

            const laserGeo = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(0, 0, -40)
            ]);
            const laserMat = new THREE.LineBasicMaterial({ color: 0xff0044, transparent: true, opacity: 0.6 });
            laserSight = new THREE.Line(laserGeo, laserMat);
            weaponHolder.add(laserSight);

            updateWeaponVisual();
        }

        function loadPlayerModelGLTF() {
            if (typeof THREE.GLTFLoader === 'undefined') return;
            const loader = new THREE.GLTFLoader();
            loader.load('assets/models/fbi.glb', (gltf) => {
                playerGltfModel = gltf.scene;
                playerGltfModel.scale.setScalar(1.0); // Full human scale
                playerGltfModel.position.set(0, 0, 0);
                playerGltfModel.rotation.y = Math.PI;

                playerGltfModel.traverse(child => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                playerGltfModel.visible = isThirdPerson;
                if (playerBody) playerBody.visible = isThirdPerson && !playerGltfModel;
                player.add(playerGltfModel);
            }, undefined, (err) => {
                console.warn('fbi.glb not found or failed to load, using procedural fallback model');
            });
        }

        function loadZombieModelGLTF() {
            if (typeof THREE.GLTFLoader === 'undefined') return;
            const loader = new THREE.GLTFLoader();
            loader.load('assets/models/zombie_walk_animated.glb', (gltf) => {
                zombieGltfModel = gltf;
            }, undefined, (err) => {
                console.warn('zombie_walk_animated.glb not found, using procedural fallback zombies');
            });
        }

        function updateWeaponVisual() {
            for (let i = weaponHolder.children.length - 1; i >= 0; i--) {
                if (weaponHolder.children[i] !== laserSight) {
                    weaponHolder.remove(weaponHolder.children[i]);
                }
            }

            const w = WEAPONS[currentWeaponIdx];
            const gunGroup = new THREE.Group();
            const matMetal = new THREE.MeshStandardMaterial({ color: 0x1b1f24, metalness: 0.8, roughness: 0.3 });
            const matAccent = new THREE.MeshStandardMaterial({ color: w.color, emissive: w.color, emissiveIntensity: 0.3 });

            if (currentWeaponIdx === 0) {
                const body = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.3), matMetal);
                const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.25, 12), matMetal);
                barrel.rotation.x = Math.PI / 2; barrel.position.set(0, 0.03, -0.2);
                gunGroup.add(body, barrel);
            } else if (currentWeaponIdx === 1) {
                const body = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.14, 0.55), matMetal);
                const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.45, 12), matMetal);
                barrel.rotation.x = Math.PI / 2; barrel.position.set(0, 0.03, -0.38);
                const mag = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.25, 0.1), matAccent);
                mag.position.set(0, -0.12, -0.05);
                gunGroup.add(body, barrel, mag);
            } else if (currentWeaponIdx === 2) {
                const body = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.15, 0.65), matMetal);
                const barrel1 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 12), matMetal);
                barrel1.rotation.x = Math.PI / 2; barrel1.position.set(-0.03, 0.03, -0.4);
                const barrel2 = barrel1.clone(); barrel2.position.x = 0.03;
                gunGroup.add(body, barrel1, barrel2);
            } else {
                const body = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.18, 0.5), matMetal);
                const core = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), matAccent);
                core.position.set(0, 0, -0.15);
                const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.3, 16), matAccent);
                barrel.rotation.x = Math.PI / 2; barrel.position.set(0, 0, -0.35);
                gunGroup.add(body, core, barrel);
            }

            weaponHolder.add(gunGroup);
            laserSight.material.color.setHex(w.color);
        }

        function createZombieMesh(typeIdx) {
            const def = ENEMY_TYPES[typeIdx];
            let zombie;

            if (zombieGltfModel && typeof THREE.SkeletonUtils !== 'undefined') {
                zombie = THREE.SkeletonUtils.clone(zombieGltfModel.scene);
                const mixer = new THREE.AnimationMixer(zombie);
                if (zombieGltfModel.animations && zombieGltfModel.animations.length > 0) {
                    mixer.clipAction(zombieGltfModel.animations[0]).play();
                }
                zombie.scale.setScalar(0.02 * def.size);

                zombie.traverse(node => {
                    if (node.isMesh && node.material) {
                        node.material = node.material.clone();
                        node.material.color.setHex(def.color);
                        node.castShadow = true; node.receiveShadow = true;
                    }
                });
                zombie.userData.mixer = mixer;
            } else {
                // Procedural 3D Zombie Mesh Fallback
                zombie = new THREE.Group();
                const matBody = new THREE.MeshStandardMaterial({ color: def.color, roughness: 0.8, metalness: 0.2 });
                const matEye = new THREE.MeshBasicMaterial({ color: def.type === 'spitter' ? 0x00ff44 : 0xff0000 });

                const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.35, 1.3, 10), matBody);
                torso.position.y = 1.05; torso.castShadow = true;
                zombie.add(torso);

                const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), matBody);
                head.position.y = 1.9; head.castShadow = true;
                zombie.add(head);

                const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), matEye);
                eyeL.position.set(-0.12, 1.95, -0.25);
                const eyeR = eyeL.clone(); eyeR.position.x = 0.12;
                zombie.add(eyeL, eyeR);

                const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.8, 8), matBody);
                armL.name = 'armL'; armL.position.set(-0.5, 1.35, -0.3); armL.rotation.x = -Math.PI / 2.2; armL.castShadow = true;
                const armR = armL.clone(); armR.name = 'armR'; armR.position.x = 0.5;
                zombie.add(armL, armR);

                zombie.scale.setScalar(def.size);
            }

            zombie.userData = Object.assign(zombie.userData || {}, {
                typeIdx: typeIdx,
                def: def,
                health: def.health,
                maxHealth: def.health,
                speed: def.speed,
                damage: def.damage,
                lastAttack: 0,
                isDying: false,
                walkTime: Math.random() * Math.PI * 2
            });

            return zombie;
        }

        function spawnWaveEnemies() {
            const count = Math.min(6 + wave * 3, 40);
            const safeRadius = 22;

            for (let i = 0; i < count; i++) {
                let typeIdx = 0;
                const r = Math.random();
                if (wave >= 2 && r < 0.3) typeIdx = 1;
                if (wave >= 3 && r > 0.7) typeIdx = 3;
                if (wave >= 4 && r > 0.85) typeIdx = 2;

                const enemy = createZombieMesh(typeIdx);

                let x, z, valid = false, attempts = 0;
                while (!valid && attempts < 80) {
                    x = (Math.random() - 0.5) * (CONFIG.groundSize - 25);
                    z = (Math.random() - 0.5) * (CONFIG.groundSize - 25);
                    if (Math.sqrt(x * x + z * z) > safeRadius) valid = true;
                    attempts++;
                }

                enemy.position.set(x, 0, z);
                scene.add(enemy);
                enemies.push(enemy);
            }

            updateHUD();
        }

        function spawnPowerUp(pos) {
            const pGroup = new THREE.Group();
            const type = Math.random() < 0.6 ? 'health' : 'ammo';
            const color = type === 'health' ? 0x00ff44 : 0x00f0ff;

            const box = new THREE.Mesh(
                new THREE.BoxGeometry(0.6, 0.6, 0.6),
                new THREE.MeshStandardMaterial({ color: color, emissive: color, emissiveIntensity: 0.5, transparent: true, opacity: 0.9 })
            );
            pGroup.add(box);

            const light = new THREE.PointLight(color, 1, 5);
            pGroup.add(light);

            pGroup.position.copy(pos); pGroup.position.y = 0.8;
            pGroup.userData = { type: type, created: Date.now() };

            scene.add(pGroup);
            powerUps.push(pGroup);
        }

        function shoot() {
            if (!gameActive || isPaused) return;

            const w = WEAPONS[currentWeaponIdx];
            const state = weaponState[currentWeaponIdx];
            const now = Date.now();

            if (state.isReloading || now - lastShootTime < w.cooldown) return;
            if (state.ammo <= 0) { reloadWeapon(); return; }

            state.ammo--;
            lastShootTime = now;
            updateHUD();

            playSound(w.name === 'Pistol' ? 'pistol' : (w.name === 'Assault Rifle' ? 'rifle' : (w.name === 'Shotgun' ? 'shotgun' : 'plasma')));

            camera.rotation.x -= w.recoil;
            weaponHolder.position.z = -0.45;
            setTimeout(() => { weaponHolder.position.z = -0.55; }, 80);

            const flash = new THREE.PointLight(w.color, 2, 6);
            flash.position.set(0.3, -0.2, -0.9);
            camera.add(flash);
            setTimeout(() => camera.remove(flash), 50);

            const camWorldDir = new THREE.Vector3();
            camera.getWorldDirection(camWorldDir);
            const camWorldPos = new THREE.Vector3();
            camera.getWorldPosition(camWorldPos);

            for (let i = 0; i < w.pellets; i++) {
                const dir = camWorldDir.clone();
                dir.x += (Math.random() - 0.5) * w.spread;
                dir.y += (Math.random() - 0.5) * w.spread;
                dir.z += (Math.random() - 0.5) * w.spread;
                dir.normalize();

                const bulletGeo = w.isPlasma ? new THREE.SphereGeometry(0.25, 12, 12) : new THREE.SphereGeometry(0.08, 8, 8);
                const bulletMat = new THREE.MeshBasicMaterial({ color: w.color });
                const bullet = new THREE.Mesh(bulletGeo, bulletMat);

                bullet.position.copy(camWorldPos).addScaledVector(dir, 0.8);
                bullet.userData = { dir: dir, speed: w.speed, damage: w.damage, created: now, isPlasma: w.isPlasma || false, splashRadius: w.splashRadius || 0 };

                scene.add(bullet);
                bullets.push(bullet);
            }
        }

        function reloadWeapon() {
            const state = weaponState[currentWeaponIdx];
            const w = WEAPONS[currentWeaponIdx];
            if (state.isReloading || state.ammo === w.magSize) return;

            state.isReloading = true;
            playSound('reload');
            document.getElementById('ammoVal').textContent = 'RELOADING...';

            setTimeout(() => {
                state.ammo = w.magSize;
                state.isReloading = false;
                updateHUD();
            }, w.reloadTime);
        }

        function switchWeapon(idx) {
            if (idx < 0 || idx >= WEAPONS.length) return;
            currentWeaponIdx = idx;
            updateWeaponVisual();
            updateHUD();

            document.querySelectorAll('.weapon-btn').forEach((btn, i) => {
                btn.classList.toggle('active', i === idx);
            });
        }

        function triggerHitMarker() {
            const hm = document.getElementById('hitMarker');
            hm.style.opacity = '1';
            setTimeout(() => hm.style.opacity = '0', 100);
        }

        function createExplosionEffect(pos, colorHex, count = 25) {
            for (let i = 0; i < count; i++) {
                const pMat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 1.0 });
                const p = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), pMat);
                p.position.copy(pos);

                const dir = new THREE.Vector3(
                    (Math.random() - 0.5) * 2,
                    (Math.random() - 0.2) * 2,
                    (Math.random() - 0.5) * 2
                ).normalize();

                p.userData = { dir: dir, speed: 0.1 + Math.random() * 0.25, created: Date.now(), life: 400 + Math.random() * 400 };

                scene.add(p);
                particles.push(p);
            }
        }

        function update(delta) {
            if (!gameActive || isPaused) return;

            updatePlayer(delta);
            updateBullets(delta);
            updateSpitProjectiles(delta);
            updateEnemies(delta);
            updateParticles(delta);
            updatePowerUps(delta);
            drawMinimap();
        }

        // ==========================================
        // DIRECTION FIX: MOVEMENT CONTROL CORRECTION
        // ==========================================
        function updatePlayer(delta) {
            const speed = CONFIG.playerSpeed * delta;
            const moveDir = new THREE.Vector3();

            const forward = new THREE.Vector3();
            player.getWorldDirection(forward);
            forward.y = 0; forward.normalize();

            const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), forward).normalize();

            if (moveForward) moveDir.sub(forward);
            if (moveBackward) moveDir.add(forward);
            if (moveLeft) moveDir.sub(right);   // Corrected: Left moves left (-right)
            if (moveRight) moveDir.add(right);  // Corrected: Right moves right (+right)

            if (touchMoveActive) {
                moveDir.addScaledVector(forward, -touchMoveDir.y);
                moveDir.addScaledVector(right, touchMoveDir.x);
            }

            if (moveDir.lengthSq() > 0) {
                moveDir.normalize();

                if (isThirdPerson) {
                    const walkCycle = clock.getElapsedTime() * 12;
                    const legL = playerBody.getObjectByName('legL');
                    const legR = playerBody.getObjectByName('legR');
                    if (legL) legL.rotation.x = Math.sin(walkCycle) * 0.5;
                    if (legR) legR.rotation.x = -Math.sin(walkCycle) * 0.5;
                }
            } else if (isThirdPerson) {
                const legL = playerBody.getObjectByName('legL');
                const legR = playerBody.getObjectByName('legR');
                if (legL) legL.rotation.x = 0;
                if (legR) legR.rotation.x = 0;
            }

            const nextPos = player.position.clone().addScaledVector(moveDir, speed);

            const bound = CONFIG.groundSize / 2 - 1.5;
            nextPos.x = Math.max(-bound, Math.min(bound, nextPos.x));
            nextPos.z = Math.max(-bound, Math.min(bound, nextPos.z));

            if (checkPlayerObstacleCollisions(nextPos)) {
                player.position.copy(nextPos);
            }

            if (isShooting) shoot();
        }

        function checkPlayerObstacleCollisions(pos) {
            const radius = 0.6;
            for (const obs of obstacles) {
                const box = new THREE.Box3().setFromObject(obs);
                const closestX = Math.max(box.min.x, Math.min(pos.x, box.max.x));
                const closestZ = Math.max(box.min.z, Math.min(pos.z, box.max.z));
                const dx = pos.x - closestX, dz = pos.z - closestZ;
                if ((dx * dx + dz * dz) < (radius * radius)) return false;
            }
            return true;
        }

        function updateBullets(delta) {
            const now = Date.now();

            for (let i = bullets.length - 1; i >= 0; i--) {
                const b = bullets[i];
                b.position.addScaledVector(b.userData.dir, b.userData.speed);

                let destroyed = false;

                for (let j = enemies.length - 1; j >= 0; j--) {
                    const e = enemies[j];
                    if (e.userData.isDying) continue;

                    const center = e.position.clone().add(new THREE.Vector3(0, 1.1 * e.scale.y, 0));
                    if (b.position.distanceTo(center) < (0.9 * e.scale.y)) {
                        destroyed = true;
                        e.userData.health -= b.userData.damage;
                        playSound('hit');
                        triggerHitMarker();

                        e.traverse(child => {
                            if (child.isMesh && child.material) {
                                const origHex = child.material.color.getHex();
                                child.material.color.setHex(0xffffff);
                                setTimeout(() => { if (child.material) child.material.color.setHex(origHex); }, 80);
                            }
                        });

                        if (b.userData.isPlasma) {
                            createExplosionEffect(b.position, 0x00f0ff, 35);
                            playSound('explosion');
                            enemies.forEach(otherE => {
                                if (otherE !== e && !otherE.userData.isDying) {
                                    if (b.position.distanceTo(otherE.position) < b.userData.splashRadius) {
                                        otherE.userData.health -= b.userData.damage * 0.6;
                                    }
                                }
                            });
                        } else {
                            createExplosionEffect(b.position, 0xff2222, 6);
                        }

                        if (e.userData.health <= 0) {
                            e.userData.isDying = true;
                            score += e.userData.def.health;
                            updateHUD();

                            if (Math.random() < 0.22) spawnPowerUp(e.position.clone());

                            createExplosionEffect(e.position, e.userData.def.color, 25);
                            scene.remove(e);
                            enemies.splice(j, 1);

                            if (enemies.length === 0) nextWave();
                        }
                        break;
                    }
                }

                if (destroyed || now - b.userData.created > 2500 || Math.abs(b.position.x) > CONFIG.groundSize / 2) {
                    scene.remove(b);
                    bullets.splice(i, 1);
                }
            }
        }

        function updateSpitProjectiles(delta) {
            for (let i = spitProjectiles.length - 1; i >= 0; i--) {
                const s = spitProjectiles[i];
                s.position.addScaledVector(s.userData.dir, s.userData.speed);

                if (s.position.distanceTo(player.position.clone().add(new THREE.Vector3(0, 1, 0))) < 1.0) {
                    takeDamage(s.userData.damage);
                    createExplosionEffect(s.position, 0x00ff44, 15);
                    scene.remove(s);
                    spitProjectiles.splice(i, 1);
                    continue;
                }

                if (Date.now() - s.userData.created > 3000) {
                    scene.remove(s);
                    spitProjectiles.splice(i, 1);
                }
            }
        }

        function updateEnemies(delta) {
            const now = Date.now();

            enemies.forEach(e => {
                if (e.userData.isDying) return;

                if (e.userData.mixer) {
                    e.userData.mixer.update(delta);
                } else {
                    e.userData.walkTime += delta * 6.0;
                    const armL = e.getObjectByName('armL');
                    const armR = e.getObjectByName('armR');
                    if (armL) armL.rotation.z = Math.sin(e.userData.walkTime) * 0.3;
                    if (armR) armR.rotation.z = -Math.sin(e.userData.walkTime) * 0.3;
                }

                const distToPlayer = e.position.distanceTo(player.position);

                if (e.userData.def.isRanged && distToPlayer < 25 && distToPlayer > 6) {
                    e.lookAt(player.position.x, 0, player.position.z);
                    if (now - e.userData.lastAttack > e.userData.def.attackCd) {
                        e.userData.lastAttack = now;

                        const spitMat = new THREE.MeshBasicMaterial({ color: 0x00ff44 });
                        const spit = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), spitMat);
                        spit.position.copy(e.position).add(new THREE.Vector3(0, 1.6, 0));

                        const dir = new THREE.Vector3().subVectors(player.position, e.position).normalize();
                        spit.userData = { dir: dir, speed: 0.6, damage: e.userData.damage, created: now };

                        scene.add(spit);
                        spitProjectiles.push(spit);
                    }
                } else if (distToPlayer > 1.4) {
                    const dir = new THREE.Vector3().subVectors(player.position, e.position);
                    dir.y = 0; dir.normalize();

                    e.position.addScaledVector(dir, e.userData.speed * (delta * 60));
                    e.lookAt(player.position.x, 0, player.position.z);
                } else {
                    if (now - e.userData.lastAttack > e.userData.def.attackCd) {
                        e.userData.lastAttack = now;
                        takeDamage(e.userData.damage);
                    }
                }
            });
        }

        function takeDamage(amount) {
            health = Math.max(0, health - amount);
            updateHUD();

            const flash = document.getElementById('damageFlash');
            flash.style.opacity = '1';
            setTimeout(() => flash.style.opacity = '0', 200);

            if (health <= 0) gameOver();
        }

        function updateParticles(delta) {
            const now = Date.now();
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.position.addScaledVector(p.userData.dir, p.userData.speed);

                const lifeRatio = 1 - ((now - p.userData.created) / p.userData.life);
                if (lifeRatio <= 0) {
                    scene.remove(p);
                    particles.splice(i, 1);
                } else {
                    p.scale.setScalar(lifeRatio);
                    p.material.opacity = lifeRatio;
                }
            }
        }

        function updatePowerUps(delta) {
            powerUps.forEach((pu, i) => {
                pu.rotation.y += 0.03;
                pu.position.y = 0.8 + Math.sin(Date.now() * 0.004) * 0.15;

                if (pu.position.distanceTo(player.position) < 1.8) {
                    if (pu.userData.type === 'health') {
                        health = Math.min(maxHealth, health + 45);
                        playSound('health');
                    } else {
                        weaponState[currentWeaponIdx].ammo = WEAPONS[currentWeaponIdx].magSize;
                        playSound('reload');
                    }
                    updateHUD();
                    scene.remove(pu);
                    powerUps.splice(i, 1);
                }
            });
        }

        function initMinimap() {
            const canvas = document.getElementById('minimapCanvas');
            canvas.width = 140; canvas.height = 140;
            minimapCtx = canvas.getContext('2d');
        }

        function drawMinimap() {
            if (!minimapCtx) return;

            minimapCtx.clearRect(0, 0, 140, 140);
            const cx = 70, cy = 70;
            const scale = 140 / CONFIG.groundSize;

            const angle = (Date.now() * 0.002) % (Math.PI * 2);
            minimapCtx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
            minimapCtx.lineWidth = 1;
            minimapCtx.beginPath();
            minimapCtx.moveTo(cx, cy);
            minimapCtx.lineTo(cx + Math.cos(angle) * 70, cy + Math.sin(angle) * 70);
            minimapCtx.stroke();

            enemies.forEach(e => {
                if (e.userData.isDying) return;
                const ex = cx + (e.position.x - player.position.x) * scale;
                const ey = cy + (e.position.z - player.position.z) * scale;

                minimapCtx.fillStyle = e.userData.def.type === 'spitter' ? '#00ff44' : (e.userData.def.type === 'tank' ? '#aa00ff' : '#ff3333');
                minimapCtx.beginPath();
                minimapCtx.arc(ex, ey, 3, 0, Math.PI * 2);
                minimapCtx.fill();
            });

            minimapCtx.fillStyle = '#00f0ff';
            minimapCtx.beginPath();
            minimapCtx.arc(cx, cy, 4, 0, Math.PI * 2);
            minimapCtx.fill();
        }

        function nextWave() {
            wave++;
            showWaveBanner(`WAVE ${wave}`);
            setTimeout(() => spawnWaveEnemies(), 2000);
        }

        function showWaveBanner(text) {
            const banner = document.getElementById('waveBanner');
            banner.textContent = text;
            banner.style.opacity = '1';
            setTimeout(() => banner.style.opacity = '0', 2200);
        }

        function updateHUD() {
            document.getElementById('healthVal').textContent = `${Math.round(health)} HP`;
            document.getElementById('healthBar').style.width = `${(health / maxHealth) * 100}%`;
            document.getElementById('scoreVal').textContent = score;
            document.getElementById('waveVal').textContent = wave;

            const state = weaponState[currentWeaponIdx];
            document.getElementById('ammoVal').textContent = state.isReloading ? 'RELOADING...' : `${state.ammo} / ∞`;
        }

        function setupUI() {
            document.querySelectorAll('.weapon-btn').forEach((btn, idx) => {
                btn.addEventListener('click', () => switchWeapon(idx));
            });
        }

        function setupEventListeners() {
            window.addEventListener('resize', onResize);

            document.addEventListener('keydown', (e) => {
                if (e.code === 'KeyW' || e.code === 'ArrowUp') moveForward = true;
                if (e.code === 'KeyS' || e.code === 'ArrowDown') moveBackward = true;
                if (e.code === 'KeyA' || e.code === 'ArrowLeft') moveLeft = true;
                if (e.code === 'KeyD' || e.code === 'ArrowRight') moveRight = true;

                if (e.code === 'KeyR') reloadWeapon();
                if (e.code === 'KeyV') toggleCameraView();
                if (e.code === 'Escape') togglePause();
                if (e.code === 'Space') isShooting = true;

                if (e.code === 'Digit1') switchWeapon(0);
                if (e.code === 'Digit2') switchWeapon(1);
                if (e.code === 'Digit3') switchWeapon(2);
                if (e.code === 'Digit4') switchWeapon(3);
            });

            document.addEventListener('keyup', (e) => {
                if (e.code === 'KeyW' || e.code === 'ArrowUp') moveForward = false;
                if (e.code === 'KeyS' || e.code === 'ArrowDown') moveBackward = false;
                if (e.code === 'KeyA' || e.code === 'ArrowLeft') moveLeft = false;
                if (e.code === 'KeyD' || e.code === 'ArrowRight') moveRight = false;
                if (e.code === 'Space') isShooting = false;
            });

            window.addEventListener('wheel', (e) => {
                if (!gameActive || isPaused) return;
                let nextIdx = currentWeaponIdx + (e.deltaY > 0 ? 1 : -1);
                if (nextIdx < 0) nextIdx = WEAPONS.length - 1;
                if (nextIdx >= WEAPONS.length) nextIdx = 0;
                switchWeapon(nextIdx);
            });

            const canvas = document.getElementById('gameCanvas');
            canvas.addEventListener('mousedown', (e) => {
                if (e.button === 0 && gameActive && !isPaused) {
                    if (document.pointerLockElement !== canvas) {
                        canvas.requestPointerLock();
                    }
                    isShooting = true;
                }
            });

            document.addEventListener('mouseup', () => isShooting = false);

            document.addEventListener('mousemove', (e) => {
                if (document.pointerLockElement === canvas && gameActive && !isPaused) {
                    player.rotation.y -= e.movementX * CONFIG.mouseSens;
                    if (!isThirdPerson) {
                        camera.rotation.x -= e.movementY * CONFIG.mouseSens;
                        camera.rotation.x = Math.max(CONFIG.minPitch, Math.min(CONFIG.maxPitch, camera.rotation.x));
                    } else {
                        camera.rotation.x -= e.movementY * CONFIG.mouseSens * 0.5;
                        camera.rotation.x = Math.max(-0.4, Math.min(0.2, camera.rotation.x));
                    }
                }
            });

            setupTouchControls();

            document.getElementById('startButton').addEventListener('click', startGame);
            document.getElementById('resumeButton').addEventListener('click', togglePause);
            document.getElementById('viewToggleButton').addEventListener('click', toggleCameraView);
            document.getElementById('viewBtnTouch').addEventListener('click', toggleCameraView);
            document.getElementById('restartButtonPause').addEventListener('click', () => location.reload());
            document.getElementById('restartButtonGameOver').addEventListener('click', () => location.reload());
        }

        function setupTouchControls() {
            const moveJoy = document.getElementById('moveJoystick');
            const thumb = moveJoy.querySelector('.touch-thumb');
            const shootBtn = document.getElementById('shootBtnTouch');

            moveJoy.addEventListener('touchstart', (e) => { e.preventDefault(); touchMoveActive = true; });

            moveJoy.addEventListener('touchmove', (e) => {
                e.preventDefault();
                const rect = moveJoy.getBoundingClientRect();
                const touch = e.touches[0];
                const dx = touch.clientX - (rect.left + rect.width / 2);
                const dy = touch.clientY - (rect.top + rect.height / 2);
                const dist = Math.min(35, Math.sqrt(dx * dx + dy * dy));
                const angle = Math.atan2(dy, dx);

                thumb.style.transform = `translate(-50%, -50%) translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px)`;
                touchMoveDir = { x: (Math.cos(angle) * dist) / 35, y: (Math.sin(angle) * dist) / 35 };
            });

            const resetJoy = () => {
                touchMoveActive = false; touchMoveDir = { x: 0, y: 0 };
                thumb.style.transform = 'translate(-50%, -50%)';
            };

            moveJoy.addEventListener('touchend', resetJoy);
            moveJoy.addEventListener('touchcancel', resetJoy);

            shootBtn.addEventListener('touchstart', (e) => { e.preventDefault(); isShooting = true; });
            shootBtn.addEventListener('touchend', () => isShooting = false);
        }

        function toggleCameraView() {
            isThirdPerson = !isThirdPerson;
            if (playerGltfModel) playerGltfModel.visible = isThirdPerson;
            playerBody.visible = isThirdPerson && !playerGltfModel;
            if (weaponHolder) weaponHolder.visible = !isThirdPerson;

            if (isThirdPerson) {
                camera.position.set(0, 2.4, 4.5);
                camera.rotation.set(-0.25, 0, 0);
                document.getElementById('crosshair').style.display = 'none';
            } else {
                camera.position.set(0, 1.7, 0);
                camera.rotation.set(0, 0, 0);
                document.getElementById('crosshair').style.display = 'block';
            }
        }

        function togglePause() {
            if (!gameActive) return;
            isPaused = !isPaused;
            document.getElementById('pauseScreen').style.display = isPaused ? 'flex' : 'none';
            if (isPaused) document.exitPointerLock();
        }

        function startGame() {
            document.getElementById('startScreen').style.display = 'none';
            document.getElementById('hud').style.display = 'flex';
            document.getElementById('weaponSelector').style.display = 'flex';
            document.getElementById('crosshair').style.display = 'block';
            document.getElementById('minimapContainer').style.display = 'block';

            gameActive = true;
            score = 0; wave = 1; health = 100;
            weaponState = WEAPONS.map(w => ({ ammo: w.magSize, isReloading: false }));

            spawnWaveEnemies();
            showWaveBanner('WAVE 1');
            updateHUD();

            animate();
        }

        function gameOver() {
            gameActive = false;
            document.exitPointerLock();
            document.getElementById('hud').style.display = 'none';
            document.getElementById('weaponSelector').style.display = 'none';
            document.getElementById('crosshair').style.display = 'none';
            document.getElementById('minimapContainer').style.display = 'none';

            document.getElementById('finalScore').textContent = `Final Score: ${score} | Waves Survived: ${wave - 1}`;
            document.getElementById('gameOver').style.display = 'flex';
        }

        function onResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        function animate() {
            if (!gameActive) return;
            requestAnimationFrame(animate);

            const delta = clock.getDelta();
            update(delta);
            renderer.render(scene, camera);
        }

        window.onload = init;
    