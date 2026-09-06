/* ==========================================================================
   Camera Controller — Dynamic Action, Cockpit FPV, and Belly Skim Cameras
   ========================================================================== */

class CameraController {
    constructor(camera) {
        this.camera = camera;
        this.mode = 'CINEMATIC_INTRO'; // CINEMATIC_INTRO, ACTION_FLIGHT
        this.flightView = 'CHASE';      // CHASE, COCKPIT, BELLY
        
        // Smoothing vectors
        this.currentPos = new THREE.Vector3(0, 120, 400);
        this.currentTarget = new THREE.Vector3(0, 50, 0);
        this.shakeAmount = 0;
        this.orbitAngle = 0;
    }

    setMode(mode) {
        this.mode = mode;
    }

    cycleFlightView() {
        const views = ['CHASE', 'COCKPIT', 'BELLY'];
        const nextIdx = (views.indexOf(this.flightView) + 1) % views.length;
        this.flightView = views[nextIdx];
        return this.flightView;
    }

    setFlightView(view) {
        if (['CHASE', 'COCKPIT', 'BELLY'].includes(view)) {
            this.flightView = view;
        }
        return this.flightView;
    }

    addShake(amount) {
        this.shakeAmount = Math.min(2.0, this.shakeAmount + amount);
    }

    update(dt, aircraft, stadiumPos = new THREE.Vector3(0, 0, -100)) {
        // Decay camera shake
        if (this.shakeAmount > 0.001) {
            this.shakeAmount *= 0.86;
        } else {
            this.shakeAmount = 0;
        }

        const shakeVec = new THREE.Vector3(
            (Math.random() - 0.5) * this.shakeAmount * 2.0,
            (Math.random() - 0.5) * this.shakeAmount * 2.0,
            (Math.random() - 0.5) * this.shakeAmount * 2.0
        );

        if (this.mode === 'CINEMATIC_INTRO') {
            // ── GTA Orbital Cinematic Flyover ──
            this.orbitAngle += dt * 0.3;
            const radius = 260;
            const camX = Math.cos(this.orbitAngle) * radius;
            const camZ = stadiumPos.z + Math.sin(this.orbitAngle) * (radius * 0.85);
            const camY = 68 + Math.sin(this.orbitAngle * 0.8) * 22;

            const targetPos = new THREE.Vector3(camX, camY, camZ);
            const lookTarget = new THREE.Vector3(0, 32, stadiumPos.z);

            this.currentPos.lerp(targetPos, dt * 3.5);
            this.currentTarget.lerp(lookTarget, dt * 3.5);

            this.camera.position.copy(this.currentPos);
            this.camera.lookAt(this.currentTarget);
            this.camera.fov = 52;
            this.camera.updateProjectionMatrix();

        } else if (this.mode === 'ACTION_FLIGHT') {
            const jetPos = aircraft.position;
            const jetRot = aircraft.mesh.rotation;
            const isLowPass = jetPos.y < 50;

            if (this.flightView === 'COCKPIT') {
                // ── 1. Cockpit Pilot FPV ──
                // Position right at the cockpit windshield looking forward
                const cockpitOffset = new THREE.Vector3(0, 0.8, -13.5).applyEuler(new THREE.Euler(jetRot.x, jetRot.y, jetRot.z, 'YXZ'));
                const desiredPos = jetPos.clone().add(cockpitOffset);

                const lookAhead = new THREE.Vector3(0, -0.3, -120).applyEuler(new THREE.Euler(jetRot.x, jetRot.y, jetRot.z, 'YXZ'));
                const desiredTarget = desiredPos.clone().add(lookAhead);

                const targetFOV = 68 + (aircraft.speed - 180) * 0.12;
                this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFOV, dt * 6.0);
                this.camera.updateProjectionMatrix();

                this.currentPos.copy(desiredPos);
                this.currentTarget.lerp(desiredTarget, dt * 25.0);

                this.camera.position.copy(this.currentPos).add(shakeVec);
                this.camera.lookAt(this.currentTarget);

            } else if (this.flightView === 'BELLY') {
                // ── 2. Belly Skim Camera (Underbelly Turf View) ──
                const bellyOffset = new THREE.Vector3(0, -1.3, -4.0).applyEuler(new THREE.Euler(jetRot.x * 0.5, jetRot.y, jetRot.z * 0.5, 'YXZ'));
                const desiredPos = jetPos.clone().add(bellyOffset);

                const lookAhead = new THREE.Vector3(0, -1.8, -90).applyEuler(new THREE.Euler(jetRot.x, jetRot.y, jetRot.z, 'YXZ'));
                const desiredTarget = desiredPos.clone().add(lookAhead);

                const targetFOV = 74 + (aircraft.speed - 180) * 0.15;
                this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFOV, dt * 6.0);
                this.camera.updateProjectionMatrix();

                this.currentPos.lerp(desiredPos, dt * 14.0);
                this.currentTarget.lerp(desiredTarget, dt * 16.0);

                this.camera.position.copy(this.currentPos).add(shakeVec);
                this.camera.lookAt(this.currentTarget);

            } else {
                // ── 3. High-Impact Dynamic Action Chase Camera ──
                const camDistZ = isLowPass ? 32.0 : 38.0;
                const camHeightY = isLowPass ? 5.5 : 7.5;

                const offset = new THREE.Vector3(0, camHeightY, camDistZ);
                offset.applyEuler(new THREE.Euler(jetRot.x * 0.35, jetRot.y * 0.7, jetRot.z * 0.45, 'YXZ'));
                const desiredPos = jetPos.clone().add(offset);

                const forwardLook = new THREE.Vector3(0, -1.0, -80).applyEuler(jetRot);
                const desiredTarget = jetPos.clone().add(forwardLook);

                const targetFOV = 58 + (aircraft.speed - 180) * 0.15 + (isLowPass ? 6 : 0);
                this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFOV, dt * 4.0);
                this.camera.updateProjectionMatrix();

                this.currentPos.lerp(desiredPos, dt * 9.0);
                this.currentTarget.lerp(desiredTarget, dt * 11.0);

                this.camera.position.copy(this.currentPos).add(shakeVec);
                this.camera.lookAt(this.currentTarget);
            }
        } else if (this.mode === 'ORBIT_INSPECTOR') {
            // ── 4. Architect Free Orbit Inspector Mode ──
            if (this.isUserOrbiting) {
                this.orbitTheta += (this.targetOrbitTheta - this.orbitTheta) * 0.15;
                this.orbitPhi += (this.targetOrbitPhi - this.orbitPhi) * 0.15;
                this.orbitRadius += (this.targetOrbitRadius - this.orbitRadius) * 0.15;
            } else {
                // Slow continuous auto-rotation
                this.orbitTheta += dt * 0.18;
                this.targetOrbitTheta = this.orbitTheta;
            }

            const x = Math.cos(this.orbitTheta) * Math.cos(this.orbitPhi) * this.orbitRadius;
            const y = Math.sin(this.orbitPhi) * this.orbitRadius;
            const z = stadiumPos.z + Math.sin(this.orbitTheta) * Math.cos(this.orbitPhi) * this.orbitRadius;

            this.camera.position.set(x, Math.max(8, y), z);
            this.camera.lookAt(new THREE.Vector3(0, 20, stadiumPos.z));
            this.camera.fov = 52;
            this.camera.updateProjectionMatrix();
        }
    }

    setupOrbitControls(domElement) {
        this.orbitRadius = 320;
        this.targetOrbitRadius = 320;
        this.orbitTheta = 0.5;
        this.targetOrbitTheta = 0.5;
        this.orbitPhi = 0.42;
        this.targetOrbitPhi = 0.42;
        this.isUserOrbiting = false;

        let isDown = false;
        let prevX = 0, prevY = 0;

        const onDown = (clientX, clientY) => {
            isDown = true;
            this.isUserOrbiting = true;
            prevX = clientX;
            prevY = clientY;
        };

        const onMove = (clientX, clientY) => {
            if (!isDown || this.mode !== 'ORBIT_INSPECTOR') return;
            const dx = clientX - prevX;
            const dy = clientY - prevY;
            prevX = clientX;
            prevY = clientY;

            this.targetOrbitTheta -= dx * 0.006;
            this.targetOrbitPhi = Math.max(0.12, Math.min(1.45, this.targetOrbitPhi + dy * 0.006));
        };

        const onUp = () => { isDown = false; };

        domElement.addEventListener('mousedown', e => onDown(e.clientX, e.clientY));
        window.addEventListener('mousemove', e => onMove(e.clientX, e.clientY));
        window.addEventListener('mouseup', onUp);

        domElement.addEventListener('touchstart', e => {
            if (e.touches.length === 1) {
                onDown(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: true });

        window.addEventListener('touchmove', e => {
            if (e.touches.length === 1) {
                onMove(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: true });

        window.addEventListener('touchend', onUp);

        domElement.addEventListener('wheel', e => {
            if (this.mode === 'ORBIT_INSPECTOR') {
                e.preventDefault();
                this.targetOrbitRadius = Math.max(80, Math.min(550, this.targetOrbitRadius + e.deltaY * 0.4));
                this.isUserOrbiting = true;
            }
        }, { passive: false });
    }
}

window.CameraController = CameraController;
