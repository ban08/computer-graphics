/**
 * MyGameplay
 * @constructor
 * @param initialHp - Health points at the start of a game
 * @param maxBales - Maximum number of hay bales carried by the wagon
 * @param hpLossPerSecond - Health points lost per second
 * @param hpPerBale - Health points restored per delivered hay bale
 * @param minObstacleDamage - Minimum health points lost after hitting an obstacle
 * @param maxObstacleDamage - Maximum health points lost after hitting an obstacle
 */
export class MyGameplay {
    constructor(initialHp, maxBales, hpLossPerSecond, hpPerBale, minObstacleDamage, maxObstacleDamage) {
        this.maxBales = maxBales ?? 2;
        this.hpLossPerSecond = hpLossPerSecond ?? 1;
        this.hpPerBale = hpPerBale ?? 50;
        this.minObstacleDamage = minObstacleDamage ?? 5;
        this.maxObstacleDamage = maxObstacleDamage ?? 15;
        
        this.hp = initialHp ?? 100;
        this.score = 0;
        this.currentBales = 0;
        this.totalPickedUpBales = 0;
        this.totalDeliveredBales = 0;
        this.lastDamage = 0;
        this.lastHealthRestored = 0;
        this.gameOver = false;

        this.elapsedSeconds = 0;
        this.lastUpdateTime = null;
    }

    update(t) {
        if (this.lastUpdateTime === null) {
            this.lastUpdateTime = t;
        } else if (!this.gameOver) {
            const dt = (t - this.lastUpdateTime) / 1000;
            if (dt <= 0) return;
            this.elapsedSeconds += dt;

            this.score = Math.floor(this.elapsedSeconds);
            this.hp = Math.max(0, this.hp - this.hpLossPerSecond * dt);

            if (this.hp === 0) this.gameOver = true;
        }
        this.lastUpdateTime = t;
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

    getCurrentBales() {
        return this.currentBales;
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
}
