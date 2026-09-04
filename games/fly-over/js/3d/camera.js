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
        }
    }
}

window.CameraController = CameraController;
