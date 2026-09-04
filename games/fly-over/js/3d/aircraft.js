/* ==========================================================================
   Aircraft Module — High-Fidelity Airlink Embraer 190 & Aerodynamics
   ========================================================================== */

class Aircraft {
    constructor(scene) {
        this.scene = scene;
        
        // Flight state & physics
        this.position = new THREE.Vector3(0, 180, 2200);
        this.velocity = new THREE.Vector3(0, 0, -180);
        this.speed = 180; // Knots
        this.targetSpeed = 180;
        this.maxSpeed = 260;
        this.minSpeed = 110;
        
        // Orientations (Euler YXZ)
        this.pitch = -0.04;
        this.roll = 0.0;
        this.yaw = 0.0;
        this.targetPitch = -0.04;
        this.targetRoll = 0.0;
        this.targetYaw = 0.0;
        
        // Flight metrics
        this.gForce = 1.0;
        this.clearance = 999;
        this.crashed = false;
        this.isStalling = false;
        
        // Control surfaces & parts for animation
        this.aileronL = null;
        this.aileronR = null;
        this.elevators = [];
        this.rudder = null;
        this.engineFans = [];
        
        // Mesh container
        this.mesh = new THREE.Group();
        this._buildModel();
        this._createSmokeParticles();
        
        this.scene.add(this.mesh);
    }

    _buildModel() {
        const jet = new THREE.Group();

        // ── Authentic Airlink / Springbok Test Livery Materials ──
        const fuselageMat = new THREE.MeshStandardMaterial({
            color: 0x181c28, // Deep dark midnight slate / navy
            roughness: 0.3,
            metalness: 0.55
        });

        const whiteBellyMat = new THREE.MeshStandardMaterial({
            color: 0xf5f7fa,
            roughness: 0.35,
            metalness: 0.2
        });

        const cyanStripeMat = new THREE.MeshStandardMaterial({
            color: 0x00bcd4, // Airlink Cyan cheatline
            roughness: 0.3,
            metalness: 0.4
        });

        const goldLiveryMat = new THREE.MeshStandardMaterial({
            color: 0xffb612, // Springbok Gold
            roughness: 0.25,
            metalness: 0.7
        });

        const greenLiveryMat = new THREE.MeshStandardMaterial({
            color: 0x007749, // Springbok Green
            roughness: 0.3,
            metalness: 0.4
        });

        const glassMat = new THREE.MeshStandardMaterial({
            color: 0x80d8ff,
            roughness: 0.05,
            metalness: 0.95,
            transparent: true,
            opacity: 0.9
        });

        const engineMetalMat = new THREE.MeshStandardMaterial({
            color: 0x37474f,
            roughness: 0.4,
            metalness: 0.85
        });

        const chromeLipMat = new THREE.MeshStandardMaterial({
            color: 0xe0e0e0,
            roughness: 0.1,
            metalness: 0.95
        });

        const windowLightMat = new THREE.MeshBasicMaterial({
            color: 0xfff9c4 // Warm illuminated passenger windows
        });

        // ── 1. Fuselage (Smooth Aerodynamic Embraer Body) ──
        // Main cabin cylinder
        const bodyGeo = new THREE.CylinderGeometry(1.65, 1.65, 26, 32);
        bodyGeo.rotateX(Math.PI / 2);
        const bodyMesh = new THREE.Mesh(bodyGeo, fuselageMat);
        bodyMesh.castShadow = true;
        jet.add(bodyMesh);

        // Lower White Belly Fairing
        const bellyGeo = new THREE.CylinderGeometry(1.66, 1.66, 24, 32, 1, false, Math.PI * 0.75, Math.PI * 0.5);
        bellyGeo.rotateX(Math.PI / 2);
        bellyGeo.rotateZ(Math.PI);
        const bellyMesh = new THREE.Mesh(bellyGeo, whiteBellyMat);
        jet.add(bellyMesh);

        // Airlink Cyan Speed Stripe along side
        const stripeGeo = new THREE.CylinderGeometry(1.67, 1.67, 24, 32, 1, false, Math.PI * 0.45, Math.PI * 0.1);
        stripeGeo.rotateX(Math.PI / 2);
        const stripeL = new THREE.Mesh(stripeGeo, cyanStripeMat);
        stripeL.position.set(0, 0.2, 0);
        jet.add(stripeL);

        const stripeR = stripeL.clone();
        stripeR.rotation.z = Math.PI;
        jet.add(stripeR);

        // Passenger Windows (Double row of illuminated window dots)
        for (let i = -8; i <= 8; i += 1.3) {
            const winL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.35, 0.55), windowLightMat);
            winL.position.set(-1.64, 0.35, i);
            jet.add(winL);

            const winR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.35, 0.55), windowLightMat);
            winR.position.set(1.64, 0.35, i);
            jet.add(winR);
        }

        // Tapered Streamlined Nose
        const noseGeo = new THREE.ConeGeometry(1.65, 8.5, 32);
        noseGeo.rotateX(-Math.PI / 2);
        const noseMesh = new THREE.Mesh(noseGeo, fuselageMat);
        noseMesh.position.set(0, -0.05, -17.25);
        noseMesh.castShadow = true;
        jet.add(noseMesh);

        // Black Radome Nose Cone Tip
        const radomeTip = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), new THREE.MeshStandardMaterial({ color: 0x111111 }));
        radomeTip.position.set(0, -0.05, -21.4);
        jet.add(radomeTip);

        // Cockpit Windshield (Wrap-around 6-panel visor)
        const cockpitGeo = new THREE.CylinderGeometry(1.67, 1.67, 2.8, 16, 1, false, Math.PI * 0.72, Math.PI * 0.56);
        cockpitGeo.rotateX(Math.PI / 2);
        const cockpitMesh = new THREE.Mesh(cockpitGeo, glassMat);
        cockpitMesh.position.set(0, 0.45, -14.2);
        jet.add(cockpitMesh);

        // Tapered Tail Cone
        const tailGeo = new THREE.ConeGeometry(1.65, 9.5, 32);
        tailGeo.rotateX(Math.PI / 2);
        const tailMesh = new THREE.Mesh(tailGeo, fuselageMat);
        tailMesh.position.set(0, 0.4, 17.75);
        tailMesh.castShadow = true;
        jet.add(tailMesh);

        // APU Exhaust Hole in tail tip
        const apuGeo = new THREE.CylinderGeometry(0.3, 0.3, 1, 16);
        apuGeo.rotateX(Math.PI / 2);
        const apuMesh = new THREE.Mesh(apuGeo, engineMetalMat);
        apuMesh.position.set(0, 0.7, 22.4);
        jet.add(apuMesh);

        // ── 2. Swept Main Wings & Moving Ailerons ──
        const wingSpan = 28;
        const wingChordRoot = 4.8;
        
        // Wing shape with smooth airfoil sweep
        const wingShape = new THREE.Shape();
        wingShape.moveTo(0, 0);
        wingShape.lineTo(wingChordRoot, 0);
        wingShape.lineTo(wingChordRoot * 0.35, wingSpan * 0.5);
        wingShape.lineTo(0.2, wingSpan * 0.5);
        wingShape.closePath();

        const extrudeOptions = { depth: 0.38, bevelEnabled: true, bevelSegments: 2, bevelSize: 0.08, bevelThickness: 0.08 };
        const wingGeo = new THREE.ExtrudeGeometry(wingShape, extrudeOptions);
        wingGeo.center();

        // Left Wing
        const leftWing = new THREE.Mesh(wingGeo, fuselageMat);
        leftWing.rotation.set(-Math.PI / 2, 0.09, -0.42); // Dihedral & sweep
        leftWing.position.set(-7.4, -0.45, 0.8);
        leftWing.castShadow = true;
        jet.add(leftWing);

        // Right Wing
        const rightWing = new THREE.Mesh(wingGeo, fuselageMat);
        rightWing.rotation.set(-Math.PI / 2, -0.09, 0.42);
        rightWing.position.set(7.4, -0.45, 0.8);
        rightWing.scale.set(1, -1, 1);
        rightWing.castShadow = true;
        jet.add(rightWing);

        // Animated Ailerons (control surfaces that tilt on roll)
        const aileronGeo = new THREE.BoxGeometry(3.5, 0.15, 0.9);
        
        this.aileronL = new THREE.Mesh(aileronGeo, cyanStripeMat);
        this.aileronL.position.set(-11.2, -0.2, 3.8);
        this.aileronL.rotation.y = -0.42;
        jet.add(this.aileronL);

        this.aileronR = new THREE.Mesh(aileronGeo, cyanStripeMat);
        this.aileronR.position.set(11.2, -0.2, 3.8);
        this.aileronR.rotation.y = 0.42;
        jet.add(this.aileronR);

        // Upturned Winglets (Sharklets) with Springbok Gold
        const wingletGeo = new THREE.BoxGeometry(0.25, 2.2, 1.4);
        const wingletL = new THREE.Mesh(wingletGeo, goldLiveryMat);
        wingletL.position.set(-14.4, 0.7, 4.2);
        wingletL.rotation.set(-0.25, 0, 0.35);
        jet.add(wingletL);

        const wingletR = new THREE.Mesh(wingletGeo, goldLiveryMat);
        wingletR.position.set(14.4, 0.7, 4.2);
        wingletR.rotation.set(-0.25, 0, -0.35);
        jet.add(wingletR);

        // ── 3. High-Bypass Turbofan Engines ──
        [-4.8, 4.8].forEach(xOff => {
            const engGroup = new THREE.Group();
            engGroup.position.set(xOff, -1.35, -0.8);

            // Pylon strut
            const pylon = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.1, 3.6), fuselageMat);
            pylon.position.set(0, 0.7, 0);
            engGroup.add(pylon);

            // Nacelle Outer Casing
            const nacelleGeo = new THREE.CylinderGeometry(1.15, 1.05, 5.2, 24, 1, true);
            nacelleGeo.rotateX(Math.PI / 2);
            const nacelle = new THREE.Mesh(nacelleGeo, fuselageMat);
            nacelle.castShadow = true;
            engGroup.add(nacelle);

            // Chrome Intake Lip
            const lipGeo = new THREE.TorusGeometry(1.15, 0.1, 16, 32);
            const lip = new THREE.Mesh(lipGeo, chromeLipMat);
            lip.position.set(0, 0, -2.6);
            engGroup.add(lip);

            // Exhaust Core Cone
            const coreGeo = new THREE.ConeGeometry(0.55, 2.0, 16);
            coreGeo.rotateX(-Math.PI / 2);
            const core = new THREE.Mesh(coreGeo, engineMetalMat);
            core.position.set(0, 0, 2.8);
            engGroup.add(core);

            // Spinning Fan Blades
            const fanGeo = new THREE.CircleGeometry(1.05, 16);
            const fan = new THREE.Mesh(fanGeo, new THREE.MeshBasicMaterial({ color: 0x1a1a1a }));
            fan.position.set(0, 0, -2.0);
            engGroup.add(fan);
            this.engineFans.push(fan);

            jet.add(engGroup);
        });

        // ── 4. Tail Empennage (Vertical Fin, Rudder, Horizontal Stabilizers, Elevators) ──
        // Vertical Fin (Springbok Green with Gold Emblem)
        const finShape = new THREE.Shape();
        finShape.moveTo(0, 0);
        finShape.lineTo(5.5, 0);
        finShape.lineTo(2.2, 7.5);
        finShape.lineTo(0.2, 7.5);
        finShape.closePath();

        const finGeo = new THREE.ExtrudeGeometry(finShape, { depth: 0.38, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.06 });
        finGeo.center();
        const verticalFin = new THREE.Mesh(finGeo, greenLiveryMat);
        verticalFin.position.set(0, 4.6, 16.5);
        verticalFin.rotation.set(0, -Math.PI / 2, 0.42);
        verticalFin.castShadow = true;
        jet.add(verticalFin);

        // Animated Rudder
        const rudderGeo = new THREE.BoxGeometry(0.2, 5.0, 1.2);
        this.rudder = new THREE.Mesh(rudderGeo, goldLiveryMat);
        this.rudder.position.set(0, 4.2, 19.5);
        jet.add(this.rudder);

        // Gold Springbok Emblem on both sides of tail fin
        const logoGeo = new THREE.CircleGeometry(1.1, 24);
        const logoL = new THREE.Mesh(logoGeo, goldLiveryMat);
        logoL.position.set(-0.22, 5.2, 17.2);
        logoL.rotation.set(0, -Math.PI / 2, 0);
        jet.add(logoL);

        const logoR = new THREE.Mesh(logoGeo, goldLiveryMat);
        logoR.position.set(0.22, 5.2, 17.2);
        logoR.rotation.set(0, Math.PI / 2, 0);
        jet.add(logoR);

        // Horizontal Stabilizers (Tail Wings)
        const horizGeo = new THREE.BoxGeometry(11.5, 0.28, 3.2);
        const horizStab = new THREE.Mesh(horizGeo, fuselageMat);
        horizStab.position.set(0, 1.6, 18.5);
        horizStab.castShadow = true;
        jet.add(horizStab);

        // Animated Elevators (pitch control)
        const elevGeo = new THREE.BoxGeometry(5.2, 0.14, 0.9);
        const elevL = new THREE.Mesh(elevGeo, cyanStripeMat);
        elevL.position.set(-3.0, 1.6, 20.2);
        jet.add(elevL);
        this.elevators.push(elevL);

        const elevR = new THREE.Mesh(elevGeo, cyanStripeMat);
        elevR.position.set(3.0, 1.6, 20.2);
        jet.add(elevR);
        this.elevators.push(elevR);

        // Scale Jet to realistic arcade scale
        jet.scale.set(0.9, 0.9, 0.9);
        this.mesh.add(jet);
    }

    _createSmokeParticles() {
        const count = 300;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);
        const cols = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        const alphas = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            pos[i * 3] = 0;
            pos[i * 3 + 1] = -999;
            pos[i * 3 + 2] = 0;

            if (i % 2 === 0) {
                // Springbok Green
                cols[i * 3] = 0.0;
                cols[i * 3 + 1] = 0.9;
                cols[i * 3 + 2] = 0.46;
            } else {
                // Springbok Gold
                cols[i * 3] = 1.0;
                cols[i * 3 + 1] = 0.82;
                cols[i * 3 + 2] = 0.0;
            }
            sizes[i] = 14.0;
            alphas[i] = 0.0;
        }

        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
        geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geo.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));

        const mat = new THREE.ShaderMaterial({
            vertexShader: `
                attribute float size;
                attribute float alpha;
                varying vec3 vColor;
                varying float vAlpha;
                void main() {
                    vColor = color;
                    vAlpha = alpha;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * (350.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                varying float vAlpha;
                void main() {
                    vec2 coord = gl_PointCoord - vec2(0.5);
                    float dist = length(coord);
                    if (dist > 0.5) discard;
                    float soft = smoothstep(0.5, 0.0, dist);
                    gl_FragColor = vec4(vColor, vAlpha * soft * 0.75);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.NormalBlending,
            vertexColors: true
        });

        this.smokePoints = new THREE.Points(geo, mat);
        this.scene.add(this.smokePoints);

        this.smokeData = [];
        for (let i = 0; i < count; i++) {
            this.smokeData.push({
                life: 0,
                maxLife: 2.2,
                wing: i % 2 === 0 ? -1 : 1
            });
        }
        this.smokeIndex = 0;
    }

    update(dt, wind = { x: 0, y: 0 }) {
        if (this.crashed) return;

        // Spin engine turbines
        this.engineFans.forEach(f => f.rotation.z += dt * 50);

        // ── Authentic Airliner Physics with Inertia ──
        // Pitch response (heavy jet inertia)
        this.pitch = THREE.MathUtils.lerp(this.pitch, this.targetPitch, dt * 4.5);
        // Roll / Banking response
        this.roll = THREE.MathUtils.lerp(this.roll, this.targetRoll, dt * 5.0);
        // Yaw follows banking naturally
        this.yaw = THREE.MathUtils.lerp(this.yaw, -this.roll * 0.35, dt * 3.5);
        // Speed throttle smoothing
        this.speed = THREE.MathUtils.lerp(this.speed, this.targetSpeed, dt * 3.0);

        // Aerodynamic Lift & Vertical Velocity
        // Pulling nose up generates climb rate, diving plunges down
        const climbForce = Math.sin(-this.pitch) * this.speed * 1.15;
        const gravityForce = -22.0 * (1.0 - Math.max(0, -this.pitch * 2.5));

        // Aerodynamic Ground Effect: Air cushion under wings within 8m of turf
        let groundEffectLift = 0;
        if (this.position.y < 9.0 && this.position.y > 0.5) {
            const cushionFactor = (9.0 - this.position.y) / 8.5;
            groundEffectLift = cushionFactor * 26.0;
        }
        
        this.velocity.y = climbForce + gravityForce + groundEffectLift + (wind.y || 0);
        this.velocity.z = -this.speed;
        this.velocity.x = Math.sin(this.roll) * this.speed * 0.65 + (wind.x || 0);

        // Update Position
        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;
        this.position.z += this.velocity.z * dt;

        // Minimum Altitude Safety (prevents falling below pitch plane)
        if (this.position.y < 1.2) this.position.y = 1.2;

        // Apply to 3D Mesh
        this.mesh.position.copy(this.position);
        this.mesh.rotation.set(this.pitch, this.yaw, this.roll, 'YXZ');

        // Animate Control Surfaces
        if (this.aileronL && this.aileronR) {
            this.aileronL.rotation.x = this.roll * 0.8;
            this.aileronR.rotation.x = -this.roll * 0.8;
        }
        this.elevators.forEach(el => {
            el.rotation.x = this.pitch * 0.9;
        });
        if (this.rudder) {
            this.rudder.rotation.y = -this.yaw * 1.5;
        }

        // Calculate G-Force
        this.gForce = 1.0 + (this.velocity.y / 45.0) + Math.abs(this.roll * 1.6);

        // Smoke trails
        this._updateSmoke(dt);
    }

    _updateSmoke(dt) {
        if (!this.smokePoints) return;
        
        const posAttr = this.smokePoints.geometry.attributes.position;
        const sizeAttr = this.smokePoints.geometry.attributes.size;
        const alphaAttr = this.smokePoints.geometry.attributes.alpha;

        const leftTip = new THREE.Vector3(-13.0, 0.5, 3.5).applyEuler(this.mesh.rotation).add(this.position);
        const rightTip = new THREE.Vector3(13.0, 0.5, 3.5).applyEuler(this.mesh.rotation).add(this.position);

        // Emit pairs
        for (let k = 0; k < 2; k++) {
            const idx = (this.smokeIndex + k) % this.smokeData.length;
            const data = this.smokeData[idx];
            data.life = data.maxLife;

            const pt = data.wing === -1 ? leftTip : rightTip;
            posAttr.setXYZ(idx, pt.x, pt.y, pt.z);
            alphaAttr.setX(idx, 0.9);
            sizeAttr.setX(idx, 10.0);
        }
        this.smokeIndex = (this.smokeIndex + 2) % this.smokeData.length;

        for (let i = 0; i < this.smokeData.length; i++) {
            const data = this.smokeData[i];
            if (data.life > 0) {
                data.life -= dt;
                const prog = 1.0 - (data.life / data.maxLife);

                sizeAttr.setX(i, 10.0 + prog * 32.0);
                alphaAttr.setX(i, Math.max(0, 0.9 * (1.0 - prog)));

                const py = posAttr.getY(i) + dt * 1.5;
                posAttr.setY(i, py);
            }
        }

        posAttr.needsUpdate = true;
        sizeAttr.needsUpdate = true;
        alphaAttr.needsUpdate = true;
    }

    setControls({ pitchUp, pitchDown, rollLeft, rollRight, boost, brake, analogPitch, analogRoll }) {
        // Pitch Control: Analog joystick takes precedence, then digital keys
        if (analogPitch !== undefined && Math.abs(analogPitch) > 0.05) {
            // analogPitch: +1.0 = Pull Back / Climb, -1.0 = Push Forward / Dive
            this.targetPitch = -analogPitch * 0.44;
        } else if (pitchUp) {
            this.targetPitch = -0.42; // Strong pull up
        } else if (pitchDown) {
            this.targetPitch = 0.36;  // Steep plunge dive into stadium bowl
        } else {
            this.targetPitch = -0.04; // Gentle cruise glide slope
        }

        // Roll Control: Analog joystick takes precedence, then digital keys
        if (analogRoll !== undefined && Math.abs(analogRoll) > 0.05) {
            // analogRoll: -1.0 = Left, +1.0 = Right
            this.targetRoll = analogRoll * 0.58;
        } else if (rollLeft) {
            this.targetRoll = -0.54;
        } else if (rollRight) {
            this.targetRoll = 0.54;
        } else {
            this.targetRoll = 0.0;
        }

        // Throttle & Speed Control: Boost, Brake, or Cruise
        if (boost) {
            this.targetSpeed = this.maxSpeed; // 260 kts
        } else if (brake) {
            this.targetSpeed = 135; // Airbrake for controlled steep bowl descent
        } else {
            this.targetSpeed = 185; // Normal cruise
        }
    }

    reset(startPos = new THREE.Vector3(0, 180, 2200)) {
        this.position.copy(startPos);
        this.velocity.set(0, 0, -180);
        this.pitch = -0.04;
        this.roll = 0.0;
        this.yaw = 0.0;
        this.targetPitch = -0.04;
        this.targetRoll = 0.0;
        this.targetYaw = 0.0;
        this.speed = 180;
        this.targetSpeed = 180;
        this.crashed = false;
        this.mesh.visible = true;
    }

    triggerCrash() {
        this.crashed = true;
        this.mesh.visible = false;
    }
}

window.Aircraft = Aircraft;
