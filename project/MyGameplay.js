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
        this.hpPerBale = 20;
        this.minObstacleDamage = 5;
        this.maxObstacleDamage = 15;
        this.hayBalePickupDistance = 1.5;
        this.feedbackDuration = 5.0;
        
        // gameplay state

        this.hp = this.initialHp;
        this.displayHp = this.initialHp;
        this.score = 0;
        this.currentBales = 0;
        this.totalDeliveredBales = 0;
        this.lastDamage = 0;
        this.lastHealthRestored = 0;
        
        this.gameOver = false;
        this.gameOverTime = null;
        this.restartDelay = 5000;
        this.onRestart = null;

        this.elapsedSeconds = 0;
        this.lastUpdateTime = null;
        this.lastDamageTime = null;
        this.lastHealthRestoredTime = null;

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

    // --- world setup

    setWorld({ wagon = null, hayBales = null, scatterElements = null, barn = null }) {
        this.wagon = wagon;
        this.hayBales = hayBales;
        this.scatterElements = scatterElements;
        this.barn = barn;

        this.syncWagonVisualState();
        this.syncBarnVisualState();
        this.syncHayBalesVisualState();
    }

    // --- update loop

    update(t, input = null) {
        let dt = 0;

        if (this.lastUpdateTime === null) {
            this.lastUpdateTime = t;
            return;
        } else {
            dt = (t - this.lastUpdateTime) / 1000;
            this.lastUpdateTime = t;
            if (dt <= 0) return;
        }

        if (this.gameOver) {
            if (t - this.gameOverTime >= this.restartDelay) {
                if (this.onRestart && typeof this.onRestart === 'function') {
                    this.onRestart();
                }
            }
            return;
        }

        this.elapsedSeconds += dt;
        this.score = Math.floor(this.elapsedSeconds);
        this.hp = this.clamp(this.hp - this.hpLossPerSecond * dt, 0, this.initialHp);

        if (this.isGameOver()) {
            this.setGameOver();
        } else {
            this.updateWagonMovement(t, this.clamp(dt, 0.0, 0.10), input);
            if (!this.isGameOver()) this.updateCargoInput(input);
        }

        this.syncWagonVisualState();
        this.syncBarnVisualState();
        this.syncHayBalesVisualState();

        this.updateFeedbackTimers();
        this.updateDisplayedStats();
    }

    // game over

    isGameOver() {
        return this.hp === 0;
    }

    setGameOver() {
        this.gameOver = true;
        this.gameOverTime = this.lastUpdateTime;
        this.speed = 0.0;
    }

    reset() {
        this.hp = this.initialHp;
        this.displayHp = this.initialHp;
        this.score = 0;
        this.currentBales = 0;
        this.totalDeliveredBales = 0;
        this.lastDamage = 0;
        this.lastHealthRestored = 0;
        this.gameOver = false;
        this.gameOverTime = null;

        this.elapsedSeconds = 0;
        this.lastUpdateTime = null;
        this.lastDamageTime = null;
        this.lastHealthRestoredTime = null;

        this.wasPickupPressed = false;
        this.wasDropdownPressed = false;

        this.speed = 0.0;
        this.steerAngle = 0.0;
    }

    // --- render sync

    syncWagonVisualState() {
        if (!this.wagon) return;

        this.wagon.setMotionState({
            speed: this.speed,
            maxSpeed: this.maxSpeed,
            steerAngle: this.steerAngle,
        });

        this.wagon.setCargoBaleCount(this.currentBales);
    }

    syncBarnVisualState() {
        if (!this.barn || !this.wagon) return;
 
        const interactionPoint = this.wagon.getBaleInteractionPoint();
        const wagonPoint = this.wagon.getPose();
        
        this.barn.setWagonInDeliveryArea(this.isWagonOrDropInDeliveryArea(interactionPoint, wagonPoint));
    }

    syncHayBalesVisualState() {
        if (!this.hayBales || !this.wagon) return;

        const interactionPoint = this.wagon.getBaleInteractionPoint();

        const interactionBaleIndex = this.hayBales.getPickupTargets().findIndex((target) =>
            Math.hypot(interactionPoint.x - target.x, interactionPoint.z - target.z) <= this.hayBalePickupDistance
        );

        this.hayBales.setInteractionBaleIndex(interactionBaleIndex);
    }

    // --- input

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

    // --- cargo

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
            if (bale && this.tryPickBale()) {
                bale.onPickup();
            }
        }
        this.wasPickupPressed = pickUp;

        if (dropDown && !this.wasDropdownPressed) {
            if (this.isWagonOrDropInDeliveryArea(interactionPoint, wagonPoint)) {
                this.deliverBales();
            } else if (this.tryDropBale()) {
                this.hayBales.dropBale(interactionPoint.x, interactionPoint.z);
            }
        }
        this.wasDropdownPressed = dropDown;
    }

    isWagonOrDropInDeliveryArea(dropPoint, wagonPoint) {
        if (!this.barn) return false;

        return this.barn.isPointInDeliveryArea(wagonPoint.x, wagonPoint.z) || this.barn.isPointInDeliveryArea(dropPoint.x, dropPoint.z);
    }

    tryPickBale() {
        if (this.currentBales >= this.maxBales) return false;

        this.currentBales++;
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
        const missingHp = this.clamp(this.initialHp - this.hp, 0, this.initialHp);
        const restoredHp = this.clamp(delivered * this.hpPerBale, 0, missingHp);

        this.totalDeliveredBales += delivered;
        this.lastHealthRestored = restoredHp;
        this.lastHealthRestoredTime = this.elapsedSeconds;

        this.currentBales = 0;
        this.hp = this.clamp(this.hp + restoredHp, 0, this.initialHp);
        
        return restoredHp;
    }

    // --- movement

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
        this.syncWagonVisualState();

        if (this.speed <= 0.001) {
            this.speed = 0.0;
            this.syncWagonVisualState();
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
            this.syncWagonVisualState();
            this.registerSolidImpact();
            return;
        }

        // collision check with barn
        if (this.isWagonCollidingWithBarn(this.wagon, nextX, nextZ, nextRotation)) {
            this.speed = 0.0;
            this.syncWagonVisualState();
            this.registerSolidImpact();
            return;
        }

        // collision check with obstacles (scatter elements)
        const obstacle = this.findWagonObjectCollision(
            this.wagon,
            this.scatterElements?.getCollisionObstacles() ?? [],
            nextX,
            nextZ,
            nextRotation
        );
        if (obstacle) {
            this.speed = 0.0;
            this.syncWagonVisualState();
            obstacle.onImpact(t);
            this.registerObstacleImpact(obstacle);
            return;
        }

        // set next pose and continue anims
        this.wagon.setPose(nextX, nextZ, nextRotation);
        this.wagon.advanceMovementAnimation(distance);
    }

    // --- collisions

    isWagonInsideTerrain(wagon, originX, originZ, rotation) {
        for (const circle of wagon.getCollisionCirclesAt(originX, originZ, rotation)) {
            if (Math.sqrt(circle.x * circle.x + circle.z * circle.z) + circle.radius > 30.0) {
                return false;
            }
        }

        return true;
    }

    findWagonObjectCollision(wagon, obstacles, originX, originZ, rotation) {
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

    isWagonCollidingWithBarn(wagon, x, z, rotation) {
        if (!this.barn) return false;

        const barnBox = this.barn.getCollisionBox();

        for (const circle of wagon.getCollisionCirclesAt(x, z, rotation, this.staticCollisionMargin)) {
            if (this.circleCollidesWithBarnBox(circle, barnBox)) return true;
        }

        return false;
    }

    circleCollidesWithBarnBox(circle, box) {
        const dx = circle.x - box.x;
        const dz = circle.z - box.z;

        const c = Math.cos(box.rotation);
        const s = Math.sin(box.rotation);
        const localX = dx * c - dz * s;
        const localZ = dx * s + dz * c;

        const closestX = this.clamp(localX, -box.width / 2, box.width / 2);
        const closestZ = this.clamp(localZ, -box.depth / 2, box.depth / 2);

        const diffX = localX - closestX;
        const diffZ = localZ - closestZ;

        return diffX * diffX + diffZ * diffZ <= circle.radius * circle.radius;
    }

    // --- damage

    registerObstacleImpact() {
        const damageRange = this.maxObstacleDamage - this.minObstacleDamage + 1;
        const damage = this.minObstacleDamage + Math.floor(Math.random() * damageRange);
        this.lastDamage = damage;
        this.lastDamageTime = this.elapsedSeconds;

        this.hp = this.clamp(this.hp - damage, 0, this.initialHp);
        if (this.isGameOver()) this.setGameOver();

        return damage;
    }

    registerSolidImpact() {
        const damage = 9999; // ouch
        this.lastDamage = 100;
        this.lastDamageTime = this.elapsedSeconds;
        
        this.hp = this.clamp(this.hp - damage, 0, this.initialHp);
        if (this.isGameOver()) this.setGameOver();

        return damage;
    }

    // --- ui

    updateFeedbackTimers() {
        if (this.lastDamageTime !== null && this.elapsedSeconds - this.lastDamageTime >= this.feedbackDuration) {
            this.lastDamage = 0;
            this.lastDamageTime = null;
        }

        if (this.lastHealthRestoredTime !== null && this.elapsedSeconds - this.lastHealthRestoredTime >= this.feedbackDuration) {
            this.lastHealthRestored = 0;
            this.lastHealthRestoredTime = null;
        }
    }

    updateDisplayedStats() {
        this.displayHp = Math.ceil(this.clamp(this.hp, 0, this.initialHp));
    }

    // --- utilities

    approachZero(value, maxDelta) {
        if (value > maxDelta) return value - maxDelta;
        if (value < -maxDelta) return value + maxDelta;
        return 0.0;
    }

    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
}
