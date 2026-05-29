/**
 * MyGameplay
 * Handles gameplay state, cargo, movement and collisions
 * @constructor
 */
export class MyGameplay {
    constructor() {
        // gameplay settings
        this.initialHp = 100;
        this.maxBales = 2;
        this.hpLossPerSecond = 1;
        this.hpPerBale = 50;
        this.minObstacleDamage = 5;
        this.maxObstacleDamage = 15;
        this.hayBalePickupDistance = 1.5;
        
        // gameplay state
        this.hp = this.initialHp;
        this.score = 0;
        this.currentBales = 0;
        this.totalPickedUpBales = 0;
        this.totalDeliveredBales = 0;
        this.lastDamage = 0;
        this.lastHealthRestored = 0;
        this.gameOver = false;

        this.elapsedSeconds = 0;
        this.lastUpdateTime = null;
        this.wasPickupPressed = false;
        this.wasDropdownPressed = false;

        // movement settings and state
        this.speed = 0.0;
        this.maxSpeed = 4.0;
        this.acceleration = 2.6;
        this.brakeDeceleration = 4.2;
        this.coastingDeceleration = 0.35;
        this.steerAngle = 0.0;
        this.maxSteerAngle = 0.55;
        this.steerSpeed = 1.6;
        this.steerReturnSpeed = 1.9;
        this.turnRateFactor = 2.4;

        // collision settings
        this.staticCollisionMargin = 0.24;

        // scene gameplay dynamic objects
        this.wagon = null;
        this.hayBales = null;
        this.scatterElements = null;
        this.barn = null;
    }

    // world setup
    setWorld({ wagon = null, hayBales = null, scatterElements = null, barn = null }) {
        this.wagon = wagon;
        this.hayBales = hayBales;
        this.scatterElements = scatterElements;
        this.barn = barn;

        this.syncWagonVisualState();
    }

    // update loop
    update(t, input = null) {
        let dt = 0;

        if (this.lastUpdateTime === null) {
            this.lastUpdateTime = t;
            this.syncWagonVisualState();
            return;
        } else {
            dt = (t - this.lastUpdateTime) / 1000;
            if (dt <= 0) return;

            if (!this.gameOver) {
                this.elapsedSeconds += dt;
                this.score = Math.floor(this.elapsedSeconds);
                this.hp = Math.max(0, this.hp - this.hpLossPerSecond * dt);

                if (this.hp === 0) this.gameOver = true;
            }

            this.lastUpdateTime = t;

            this.updateCargoInput(input);
            this.updateWagonMovement(t, this.clamp(dt, 0.0, 0.10), input);
            this.syncWagonVisualState();

            return;
        }
    }

    // render sync
    syncWagonVisualState() {
        if (!this.wagon) return;

        this.wagon.setMotionState({
            speed: this.speed,
            maxSpeed: this.maxSpeed,
            steerAngle: this.steerAngle,
        });

        this.wagon.setCargoBaleCount(this.currentBales);
    }

    // input
    getMovementInput(input) {
        return {
            accelerating: this.isInputPressed(input, 'KeyW'),
            braking: this.isInputPressed(input, 'KeyS'),
            steeringLeft: this.isInputPressed(input, 'KeyA'),
            steeringRight: this.isInputPressed(input, 'KeyD'),
        };
    }

    isInputPressed(input, keyCode) {
        if (!input) return false;
        return input.isKeyPressed(keyCode);
    }

    // cargo
    updateCargoInput(input) {
        if (!this.wagon || !this.hayBales) return;

        const pickUp = this.isInputPressed(input, 'KeyP');
        const dropDown = this.isInputPressed(input, 'KeyL');

        const interactionPoint = this.wagon.getBaleInteractionPoint();
        const wagonPoint = this.wagon.getPose();

        if (pickUp && !this.wasPickupPressed) {
            const bale = this.hayBales.getPickupTargets().find((target) =>
                Math.hypot(interactionPoint.x - target.x, interactionPoint.z - target.z) <= this.hayBalePickupDistance
            );
            if (bale && this.tryAddBale()) {
                bale.onPickup();
            }
        }
        this.wasPickupPressed = pickUp;

        if (dropDown && !this.wasDropdownPressed) {
            if (this.isCargoInDeliveryArea(interactionPoint, wagonPoint)) {
                this.deliverBales();
            } else if (this.tryDropBale()) {
                this.hayBales.dropBale(interactionPoint.x, interactionPoint.z);
            }
        }
        this.wasDropdownPressed = dropDown;
    }

    isCargoInDeliveryArea(dropPoint, wagonPoint) {
        if (!this.barn || this.currentBales === 0) return false;

        return this.barn.isPointInDeliveryArea(wagonPoint.x, wagonPoint.z) || this.barn.isPointInDeliveryArea(dropPoint.x, dropPoint.z);
    }

    tryAddBale() {
        if (this.currentBales >= this.maxBales) return false;

        this.currentBales++;
        this.totalPickedUpBales++;
        return true;
    }

    tryDropBale() {
        if (this.currentBales === 0) return false;

        this.currentBales--;
        return true;
    }

    deliverBales() {
        if (this.currentBales === 0) return 0;

        const delivered = this.currentBales;
        const restoredHp = delivered * this.hpPerBale;

        this.totalDeliveredBales += delivered;
        this.lastHealthRestored = restoredHp;

        this.currentBales = 0;
        this.hp += restoredHp;
        
        return restoredHp;
    }

    // movement
    updateWagonMovement(t, dt, input) {
        if (!this.wagon) return;

        const movementInput = this.getMovementInput(input);

        // forwards speed
        if (movementInput.accelerating) this.speed += this.acceleration * dt;
        if (movementInput.braking) this.speed -= this.brakeDeceleration * dt;
        if (!movementInput.accelerating && !movementInput.braking) {
            this.speed = this.approachZero(this.speed, this.coastingDeceleration * dt);
        }
        this.speed = this.clamp(this.speed, 0.0, this.maxSpeed);

        // turning
        const steerInput = (movementInput.steeringLeft ? 1 : 0) - (movementInput.steeringRight ? 1 : 0);
        if (steerInput !== 0) {
            this.steerAngle += steerInput * this.steerSpeed * dt;
        } else {
            this.steerAngle = this.approachZero(this.steerAngle, this.steerReturnSpeed * dt);
        }
        this.steerAngle = this.clamp(this.steerAngle, -this.maxSteerAngle, this.maxSteerAngle);

        // set mov state
        this.wagon.setMotionState({
            speed: this.speed,
            maxSpeed: this.maxSpeed,
            steerAngle: this.steerAngle,
        });

        if (this.speed <= 0.001) {
            this.speed = 0.0;
            this.wagon.setMotionState({
                speed: this.speed,
                maxSpeed: this.maxSpeed,
                steerAngle: this.steerAngle
            });
            return;
        }

        // caculate next pos
        const pose = this.wagon.getPose();
        const distance = this.speed * dt;
        const turnRate = (this.speed / this.turnRateFactor) * Math.tan(this.steerAngle);
        const nextRotation = pose.rotation + turnRate * dt;
        const nextX = pose.x + Math.sin(nextRotation) * distance;
        const nextZ = pose.z + Math.cos(nextRotation) * distance;

        // collision check with map border
        if (!this.isWagonInsideTerrain(this.wagon, nextX, nextZ, nextRotation)) {
            this.speed = 0.0;
            this.wagon.setMotionState({ speed: this.speed, maxSpeed: this.maxSpeed, steerAngle: this.steerAngle });
            this.registerBoundaryImpact();
            return;
        }

        // collision check with obstacles (scatter elements)
        const obstacle = this.findWagonStaticCollision(
            this.wagon,
            this.scatterElements?.getCollisionObstacles() ?? [],
            nextX,
            nextZ,
            nextRotation
        );
        if (obstacle) {
            this.speed = 0.0;
            this.wagon.setMotionState({ speed: this.speed, maxSpeed: this.maxSpeed, steerAngle: this.steerAngle });
            obstacle.onImpact(t);
            this.registerObstacleImpact(obstacle);
            return;
        }

        // set next pose and continue anims
        this.wagon.setPose(nextX, nextZ, nextRotation);
        this.wagon.advanceMovementAnimation(distance);
    }

    // collisions
    isWagonInsideTerrain(wagon, originX, originZ, rotation) {
        for (const circle of wagon.getCollisionCirclesAt(originX, originZ, rotation)) {
            if (Math.sqrt(circle.x * circle.x + circle.z * circle.z) + circle.radius > 30.0) {
                return false;
            }
        }

        return true;
    }

    findWagonStaticCollision(wagon, obstacles, originX, originZ, rotation) {
        for (const circle of wagon.getCollisionCirclesAt(originX, originZ, rotation, this.staticCollisionMargin)) {
            for (const obstacle of obstacles) {
                if (!obstacle.isActive()) continue;

                const dx = circle.x - obstacle.x;
                const dz = circle.z - obstacle.z;
                const minDistance = circle.radius + (obstacle.radius ?? 0);

                if (dx * dx + dz * dz < minDistance * minDistance) return obstacle;
            }
        }

        return null;
    }

    // damage
    registerObstacleImpact() {
        const damageRange = this.maxObstacleDamage - this.minObstacleDamage + 1;
        const damage = this.minObstacleDamage + Math.floor(Math.random() * damageRange);
        this.lastDamage = damage;

        this.hp = Math.max(0, this.hp - damage);
        if (this.hp === 0) this.gameOver = true;

        return damage;
    }

    registerBoundaryImpact() {
        const damage = 9999; // ouch
        this.lastDamage = 100;
        
        this.hp = Math.max(0, this.hp - damage);
        if (this.hp === 0) this.gameOver = true;

        return damage;
    }

    // utilities
    approachZero(value, maxDelta) {
        if (value > maxDelta) return value - maxDelta;
        if (value < -maxDelta) return value + maxDelta;
        return 0.0;
    }

    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
}
