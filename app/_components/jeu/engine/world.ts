// GameEngine : assemble terrain + physique + ramassage + combo + énergie +
// état du run. Tout est en refs (jamais dans React). step() n'est appelé que
// depuis la boucle rAF. Garde NaN/Inf -> self-heal (un glitch = un hoquet
// d'une frame, jamais un canvas figé). Thème vélo : on pédale, l'ÉNERGIE
// descend, rechargée par des ravitaillements.

import {
  COIN_DX,
  COIN_ENERGY_BONUS,
  COIN_VALUE,
  COMBO_MAX,
  COMBO_WINDOW,
  CRASH_ANGLE,
  CRASH_GRACE,
  DIST_PER_COIN,
  DRAIN_IDLE,
  DRAIN_PEDAL,
  ENERGY_MAX,
  FLIP_BONUS,
  PICKUP_RADIUS,
  PX_PER_M,
  RAVITO_DX,
  RAVITO_REFILL,
} from "./constants";
import { normalizeAngle, stepBike } from "./physics";
import { createTerrain, type Terrain } from "./terrain";
import type {
  BikeState,
  HudSnapshot,
  InputState,
  Particle,
  RunEndReason,
  RunResult,
  TireStats,
} from "./types";

const TAU = Math.PI * 2;
const MAX_PARTICLES = 60;

export class GameEngine {
  terrain: Terrain;
  bike: BikeState;
  particles: Particle[] = [];
  screenShake = 0;
  crashFlash = 0;
  energy = ENERGY_MAX;
  distanceM = 0;
  combo = 1;
  runOver = false;
  reason: RunEndReason = "crash";
  connected = false;
  // pose du pas précédent (pour l'interpolation de rendu) + caméra lissée
  prevX = 0;
  prevY = 0;
  prevTheta = 0;
  camX = 0;
  camY = 0;
  camReady = false;

  private tire: TireStats;
  private comboTimer = 0;
  private coins: Set<number> = new Set();
  private ravitoTaken: Set<number> = new Set();
  private coinsCollected = 0;
  private flipsTotal = 0;
  private runMoney = 0;
  private crashGrace = 0;
  private noEnergyTimer = 0;
  private airRot = 0;
  private wasAirborne = false;
  private good: BikeState;

  constructor(seed: number, tire: TireStats, connected: boolean) {
    this.terrain = createTerrain(seed);
    this.tire = tire;
    this.connected = connected;
    this.bike = this.spawn();
    this.good = { ...this.bike };
    this.prevX = this.bike.x;
    this.prevY = this.bike.y;
    this.prevTheta = this.bike.theta;
  }

  private spawn(): BikeState {
    const x = 90;
    return {
      x,
      y: this.terrain.groundY(x) - 50,
      vx: 0,
      vy: 0,
      theta: 0,
      omega: 0,
      airTime: 0,
      onGround: false,
    };
  }

  private spark(x: number, y: number, n: number, spread: number): void {
    for (let i = 0; i < n && this.particles.length < MAX_PARTICLES; i++) {
      const a = Math.random() * TAU;
      const sp = Math.random() * spread;
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - spread * 0.4,
        life: 0.5 + Math.random() * 0.4,
        max: 0.9,
      });
    }
  }

  isCoinTaken(i: number): boolean {
    return this.coins.has(i);
  }

  isRavitoTaken(i: number): boolean {
    return this.ravitoTaken.has(i);
  }

  step(dt: number, input: InputState, reducedMotion: boolean): void {
    if (this.runOver) return;

    // pose du pas précédent (interpolation de rendu)
    this.prevX = this.bike.x;
    this.prevY = this.bike.y;
    this.prevTheta = this.bike.theta;

    // énergie du cycliste
    const empty = this.energy <= 0;
    const eff: InputState = {
      throttle: input.throttle && !empty, // plus d'énergie -> on ne pédale plus
      brake: input.brake,
    };
    this.energy -= DRAIN_IDLE * dt;
    if (eff.throttle) this.energy -= DRAIN_PEDAL * dt;
    if (this.energy < 0) this.energy = 0;

    // self-heal : ne sauvegarde l'état "bon" que s'il est fini
    if (Number.isFinite(this.bike.x) && Number.isFinite(this.bike.y)) {
      this.good.x = this.bike.x;
      this.good.y = this.bike.y;
      this.good.theta = this.bike.theta;
    }

    stepBike(this.bike, this.terrain, eff, this.tire, dt);

    const b = this.bike;
    if (
      !Number.isFinite(b.x) ||
      !Number.isFinite(b.y) ||
      !Number.isFinite(b.vx) ||
      !Number.isFinite(b.vy) ||
      !Number.isFinite(b.theta) ||
      !Number.isFinite(b.omega)
    ) {
      b.x = this.good.x;
      b.y = this.good.y;
      b.theta = this.good.theta;
      b.vx = 0;
      b.vy = 0;
      b.omega = 0;
    }

    // distance (ne recule jamais)
    const dm = Math.floor(b.x / PX_PER_M);
    if (dm > this.distanceM) this.distanceM = dm;

    // flips : suivre la rotation en l'air, récompenser à la réception
    if (!b.onGround) {
      this.airRot += b.omega * dt;
      this.wasAirborne = b.airTime > 0.08 || this.wasAirborne;
    } else {
      if (this.wasAirborne) {
        const rotations = Math.floor(Math.abs(this.airRot) / TAU);
        if (rotations >= 1 && Math.abs(normalizeAngle(b.theta)) < 0.9) {
          this.flipsTotal += rotations;
          this.runMoney += FLIP_BONUS * rotations;
          if (!reducedMotion) this.spark(b.x, b.y - 20, 8, 300);
          this.screenShake = Math.min(5, this.screenShake + 2.5);
        }
      }
      this.airRot = 0;
      this.wasAirborne = false;
    }

    // combo
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) this.combo = 1;
    }

    this.collectPickups(reducedMotion);

    // poussière de gravel sous l'effort
    if (!reducedMotion && eff.throttle && b.onGround && Math.random() < 0.4) {
      this.spark(b.x - 18, b.y + 14, 1, 120);
    }

    // particules
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 600 * dt;
    }

    if (this.screenShake > 0)
      this.screenShake = Math.max(0, this.screenShake - dt * 30);
    if (this.crashFlash > 0)
      this.crashFlash = Math.max(0, this.crashFlash - dt * 2.2);

    // chute (angle maintenu)
    if (Math.abs(normalizeAngle(b.theta)) > CRASH_ANGLE) {
      this.crashGrace += dt;
      if (this.crashGrace >= CRASH_GRACE) this.end("crash", reducedMotion);
    } else {
      this.crashGrace = 0;
    }

    // fringale : plus d'énergie -> on s'arrête -> fin du run
    if (empty) {
      if (Math.abs(b.vx) < 22) {
        this.noEnergyTimer += dt;
        if (this.noEnergyTimer >= 0.7) this.end("energy", reducedMotion);
      } else {
        this.noEnergyTimer = 0;
      }
    }
  }

  private collectPickups(reducedMotion: boolean): void {
    const b = this.bike;
    const ci = Math.round(b.x / COIN_DX);
    for (let i = ci - 1; i <= ci + 1; i++) {
      if (this.coins.has(i)) continue;
      const c = this.terrain.coinAt(i);
      if (!c) continue;
      if (Math.hypot(c.x - b.x, c.y - b.y) > PICKUP_RADIUS) continue;
      this.coins.add(i);
      this.coinsCollected++;
      this.combo = this.comboTimer > 0 ? Math.min(COMBO_MAX, this.combo + 1) : 1;
      this.comboTimer = COMBO_WINDOW;
      this.runMoney += COIN_VALUE * this.combo;
      this.energy = Math.min(ENERGY_MAX, this.energy + COIN_ENERGY_BONUS);
      if (!reducedMotion) this.spark(c.x, c.y, 4, 150);
    }
    const ri = Math.round(b.x / RAVITO_DX);
    for (let i = ri - 1; i <= ri + 1; i++) {
      if (this.ravitoTaken.has(i)) continue;
      const f = this.terrain.ravitoAt(i);
      if (!f) continue;
      if (Math.hypot(f.x - b.x, f.y - b.y) > PICKUP_RADIUS + 6) continue;
      this.ravitoTaken.add(i);
      this.energy = Math.min(ENERGY_MAX, this.energy + RAVITO_REFILL);
      if (!reducedMotion) this.spark(f.x, f.y, 5, 140);
    }
  }

  private end(reason: RunEndReason, reducedMotion: boolean): void {
    if (this.runOver) return;
    this.runOver = true;
    this.reason = reason;
    if (reason === "crash") {
      this.crashFlash = 1;
      if (!reducedMotion) this.screenShake = 8;
    }
  }

  hudSnapshot(): HudSnapshot {
    return {
      distance: this.distanceM,
      money:
        this.runMoney + Math.floor(this.distanceM / DIST_PER_COIN) * COIN_VALUE,
      combo: this.combo,
      energyPct: this.energy / ENERGY_MAX,
      score: this.distanceM + this.coinsCollected * 10,
      connected: this.connected,
      runOver: this.runOver,
    };
  }

  result(): RunResult {
    const payout =
      this.runMoney + Math.floor(this.distanceM / DIST_PER_COIN) * COIN_VALUE;
    return {
      distance: this.distanceM,
      coins: this.coinsCollected,
      payout,
      flips: this.flipsTotal,
      score: this.distanceM + this.coinsCollected * 10,
      reason: this.reason,
      newBestDistance: false,
      newBestScore: false,
    };
  }
}
