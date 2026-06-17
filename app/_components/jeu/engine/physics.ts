// Intégrateur à pas fixe. Le vélo est une barre rigide (centre + angle) avec
// deux roues reliées au sol par des ressorts amortis "push-only" (le sol ne
// fait que repousser) qui produisent l'auto-inclinaison sur les pentes.
// Traction tangentielle plafonnée par l'adhérence du pneu. Aucun moteur
// physique externe ; tout est borné -> impossible d'exploser.

import {
  AIR_TORQUE,
  ANG_DRAG,
  BRAKE_FORCE,
  C_GROUND,
  GRAVITY,
  GRIP_MU,
  INERTIA_FACTOR,
  K_GROUND,
  LIN_DRAG,
  OFFROAD_PENALTY,
  OMEGA_MAX,
  PEDAL_FORCE,
  V_MAX,
  WHEEL_BASE,
  WHEEL_R,
  WHEELIE_OMEGA_CAP,
  WHEELIE_TORQUE,
} from "./constants";
import type { BikeState, InputState, TireStats, Vec2 } from "./types";
import type { Terrain } from "./terrain";

const TAU = Math.PI * 2;

export function normalizeAngle(a: number): number {
  let r = a % TAU;
  if (r > Math.PI) r -= TAU;
  if (r < -Math.PI) r += TAU;
  return r;
}

export function wheelAnchors(bike: BikeState): { rear: Vec2; front: Vec2 } {
  const cos = Math.cos(bike.theta);
  const sin = Math.sin(bike.theta);
  const l = WHEEL_BASE / 2;
  return {
    rear: { x: bike.x - l * cos, y: bike.y - l * sin },
    front: { x: bike.x + l * cos, y: bike.y + l * sin },
  };
}

export function stepBike(
  bike: BikeState,
  terrain: Terrain,
  input: InputState,
  tire: TireStats,
  dt: number,
): void {
  const m = tire.weight;
  const inertia = m * INERTIA_FACTOR;
  const cos = Math.cos(bike.theta);
  const sin = Math.sin(bike.theta);
  const l = WHEEL_BASE / 2;

  let fx = 0;
  let fy = m * GRAVITY; // gravité (y vers le bas)
  let torque = 0;
  let contacts = 0;

  for (let w = 0; w < 2; w++) {
    const s = w === 0 ? -1 : 1; // -1 = roue arrière, +1 = roue avant
    const rx = s * l * cos;
    const ry = s * l * sin;
    const ax = bike.x + rx;
    const ay = bike.y + ry;
    const gy = terrain.groundY(ax);
    const pen = ay + WHEEL_R - gy;
    if (pen <= 0) continue;
    contacts++;

    const mSlope = terrain.slope(ax);
    const nlen = Math.sqrt(mSlope * mSlope + 1);
    const nx = mSlope / nlen; // normale (vers le haut = y négatif)
    const ny = -1 / nlen;
    const tx = 1 / nlen; // tangente unitaire vers +x
    const ty = mSlope / nlen;

    // vitesse au point d'ancrage : v = v_centre + ω × r
    const vax = bike.vx - bike.omega * ry;
    const vay = bike.vy + bike.omega * rx;
    const vn = vax * nx + vay * ny;

    const fn = Math.max(0, K_GROUND * pen - C_GROUND * vn);
    let fwx = nx * fn;
    let fwy = ny * fn;

    // adhérence disponible (plafond de traction)
    let mu = GRIP_MU * tire.grip;
    if (tire.roadOnly) {
      mu *= 1 - (1 - OFFROAD_PENALTY) * terrain.roughness(ax);
    }
    const tractionMax = mu * fn;

    const vt = vax * tx + vay * ty; // vitesse tangentielle (le long du sol)
    let drive = 0;
    if (input.throttle) drive += PEDAL_FORCE * tire.pedalPower;
    // frein : s'oppose au mouvement, ne propulse jamais en arrière depuis l'arrêt
    if (input.brake && Math.abs(vt) > 6) drive -= Math.sign(vt) * BRAKE_FORCE;
    const ft = Math.max(-tractionMax, Math.min(tractionMax, drive));
    fwx += tx * ft;
    fwy += ty * ft;

    fx += fwx;
    fy += fwy;
    torque += rx * fwy - ry * fwx;
  }

  bike.onGround = contacts > 0;

  // cabrage en danseuse : la relance lève un peu la roue avant, mais le couple
  // se COUPE dès qu'un petit nez-en-l'air est atteint -> pop borné, jamais un
  // backflip incontrôlable (le frottement angulaire ramène ensuite à plat).
  if (bike.onGround && input.throttle && bike.omega > -WHEELIE_OMEGA_CAP) {
    torque -= WHEELIE_TORQUE * Math.min(1, tire.pedalPower);
  }

  // contrôle de rotation en l'air
  if (!bike.onGround) {
    if (input.throttle) bike.omega -= AIR_TORQUE * dt;
    if (input.brake) bike.omega += AIR_TORQUE * dt;
  }

  // intégration semi-implicite d'Euler
  bike.vx += (fx / m) * dt;
  bike.vy += (fy / m) * dt;
  bike.omega += (torque / inertia) * dt;

  // frottements
  bike.vx -= bike.vx * LIN_DRAG * dt;
  bike.omega -= bike.omega * ANG_DRAG * dt;

  // clamps de sécurité
  const vmax = V_MAX * tire.topSpeed;
  const speed = Math.hypot(bike.vx, bike.vy);
  if (speed > vmax) {
    const k = vmax / speed;
    bike.vx *= k;
    bike.vy *= k;
  }
  if (bike.omega > OMEGA_MAX) bike.omega = OMEGA_MAX;
  else if (bike.omega < -OMEGA_MAX) bike.omega = -OMEGA_MAX;

  bike.x += bike.vx * dt;
  bike.y += bike.vy * dt;
  bike.theta += bike.omega * dt;
  bike.airTime = bike.onGround ? 0 : bike.airTime + dt;
}
