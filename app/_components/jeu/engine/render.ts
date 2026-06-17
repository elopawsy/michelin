// Rendu canvas pur. Fluidité : interpolation de la pose du vélo entre deux pas
// de physique fixes (alpha = reste de l'accumulateur) + caméra basse-fréquence
// en vertical (supprime le tremblement de suspension). Visuel sobre : ciel en
// dégradé propre, collines très discrètes, liseré jaune de marque, peu d'effets.

import {
  CAM_SMOOTH_Y,
  COIN_DX,
  RAVITO_DX,
  SAMPLE_STEP,
  WHEEL_BASE,
  WHEEL_R,
} from "./constants";
import type { GameEngine } from "./world";
import type { Palette, Sprites, Viewport } from "./types";

const COIN_R = 12;
const RAVITO_W = 24;
const RAVITO_H = 28;
const RIDER_H = 64;

interface RenderOpts {
  reducedMotion: boolean;
  time: number;
  alpha: number;
}

export function render(
  ctx: CanvasRenderingContext2D,
  engine: GameEngine,
  theme: Palette,
  sprites: Sprites,
  view: Viewport,
  opts: RenderOpts,
): void {
  const { width, height } = view;
  const a = opts.alpha < 0 ? 0 : opts.alpha > 1 ? 1 : opts.alpha;
  const bike = engine.bike;
  const terrain = engine.terrain;

  // pose interpolée (lissage du mouvement, indépendant du taux de rafraîchissement)
  const bx = engine.prevX + (bike.x - engine.prevX) * a;
  const by = engine.prevY + (bike.y - engine.prevY) * a;
  const bth = engine.prevTheta + (bike.theta - engine.prevTheta) * a;

  // --- ciel : dégradé propre (sobre) ---
  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, theme.skyTop);
  sky.addColorStop(1, theme.skyHorizon);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  // --- caméra : horizontale verrouillée, verticale basse-fréquence ---
  const focusY = by * 0.35 + terrain.groundY(bx) * 0.65;
  const targetX = width * 0.34 - bx;
  const targetY = height * 0.58 - focusY;
  if (!engine.camReady) {
    engine.camX = targetX;
    engine.camY = targetY;
    engine.camReady = true;
  } else {
    engine.camX = targetX;
    engine.camY += (targetY - engine.camY) * CAM_SMOOTH_Y;
  }

  const shake = opts.reducedMotion ? 0 : engine.screenShake * 0.5;
  const camX = engine.camX + (shake ? (Math.random() - 0.5) * shake : 0);
  const camY = engine.camY + (shake ? (Math.random() - 0.5) * shake : 0);

  const left = bx - width * 0.34 - 40;
  const right = left + width + 80;

  // --- collines très discrètes ---
  drawHills(ctx, terrain, theme.hillsFar, width, camX * 0.55, camY, 70, 0.5, 0.12);
  drawHills(ctx, terrain, theme.hillsMid, width, camX * 0.78, camY, 36, 0.75, 0.2);

  ctx.save();
  ctx.translate(camX, camY);

  // --- terrain : corps + liseré jaune (signature de marque) ---
  ctx.beginPath();
  ctx.moveTo(left, terrain.groundY(left));
  for (let x = left; x <= right; x += SAMPLE_STEP) {
    ctx.lineTo(x, terrain.groundY(x));
  }
  const bottom = focusY + height;
  ctx.lineTo(right, bottom);
  ctx.lineTo(left, bottom);
  ctx.closePath();
  ctx.fillStyle = theme.groundBody;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(left, terrain.groundY(left));
  for (let x = left; x <= right; x += SAMPLE_STEP) {
    ctx.lineTo(x, terrain.groundY(x));
  }
  ctx.strokeStyle = theme.groundEdge;
  ctx.lineWidth = 3;
  ctx.lineJoin = "round";
  ctx.stroke();

  // --- ravitaillements (sobre : carré + croix) ---
  const r0 = Math.floor(left / RAVITO_DX);
  const r1 = Math.ceil(right / RAVITO_DX);
  for (let i = r0; i <= r1; i++) {
    if (engine.isRavitoTaken(i)) continue;
    const f = terrain.ravitoAt(i);
    if (!f) continue;
    ctx.fillStyle = theme.ravito;
    roundRect(ctx, f.x - RAVITO_W / 2, f.y - RAVITO_H / 2, RAVITO_W, RAVITO_H, 6);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(f.x - 6, f.y - 2, 12, 4);
    ctx.fillRect(f.x - 2, f.y - 6, 4, 12);
  }

  // --- pièces (épurées : disque + fin liseré) ---
  const c0 = Math.floor(left / COIN_DX);
  const c1 = Math.ceil(right / COIN_DX);
  for (let i = c0; i <= c1; i++) {
    if (engine.isCoinTaken(i)) continue;
    const c = terrain.coinAt(i);
    if (!c) continue;
    const bob = opts.reducedMotion ? 0 : Math.sin(opts.time * 2.4 + i) * 2.5;
    ctx.beginPath();
    ctx.arc(c.x, c.y + bob, COIN_R, 0, Math.PI * 2);
    ctx.fillStyle = theme.coinFill;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = theme.coinRim;
    ctx.stroke();
  }

  // --- particules (rares, fines) ---
  for (const p of engine.particles) {
    ctx.globalAlpha = Math.max(0, p.life / p.max) * 0.7;
    ctx.fillStyle = theme.dust;
    ctx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3);
  }
  ctx.globalAlpha = 1;

  // --- vélo + Bibendum (pose interpolée) ---
  drawBike(ctx, theme, sprites, engine.connected, bx, by, bth);

  ctx.restore();

  // --- vignette de chute (discrète) ---
  if (engine.crashFlash > 0) {
    ctx.save();
    ctx.globalAlpha = engine.crashFlash * 0.3;
    const v = ctx.createRadialGradient(
      width / 2,
      height / 2,
      height * 0.25,
      width / 2,
      height / 2,
      height * 0.8,
    );
    v.addColorStop(0, "rgba(183,28,28,0)");
    v.addColorStop(1, theme.crashFlash);
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }
}

function drawHills(
  ctx: CanvasRenderingContext2D,
  terrain: GameEngine["terrain"],
  color: string,
  viewWidth: number,
  camX: number,
  camY: number,
  lift: number,
  squash: number,
  alpha: number,
): void {
  ctx.save();
  ctx.translate(camX, camY);
  const hl = -camX - 40;
  const hr = -camX + viewWidth + 40;
  ctx.beginPath();
  ctx.moveTo(hl, terrain.groundY(hl) * squash - lift);
  for (let x = hl; x <= hr; x += SAMPLE_STEP * 3) {
    ctx.lineTo(x, terrain.groundY(x) * squash - lift);
  }
  ctx.lineTo(hr, 4000);
  ctx.lineTo(hl, 4000);
  ctx.closePath();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

function drawBike(
  ctx: CanvasRenderingContext2D,
  theme: Palette,
  sprites: Sprites,
  connected: boolean,
  bx: number,
  by: number,
  bth: number,
): void {
  const cos = Math.cos(bth);
  const sin = Math.sin(bth);
  const l = WHEEL_BASE / 2;
  const wheels = [
    { x: bx - l * cos, y: by - l * sin },
    { x: bx + l * cos, y: by + l * sin },
  ];
  for (const w of wheels) {
    ctx.beginPath();
    ctx.arc(w.x, w.y, WHEEL_R, 0, Math.PI * 2);
    ctx.fillStyle = theme.bikeWheel;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(w.x, w.y, WHEEL_R * 0.32, 0, Math.PI * 2);
    ctx.fillStyle = theme.bikeHub;
    ctx.fill();
  }

  ctx.save();
  ctx.translate(bx, by);
  ctx.rotate(bth);

  if (connected) {
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = theme.connectedGlow;
    ctx.beginPath();
    ctx.arc(0, -6, 42, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.strokeStyle = theme.hillsMid;
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-30, 0);
  ctx.lineTo(-4, -16);
  ctx.lineTo(30, 0);
  ctx.moveTo(-4, -16);
  ctx.lineTo(2, 0);
  ctx.stroke();

  const rider = sprites.rider;
  if (rider && rider.complete && rider.naturalWidth > 0) {
    const h = RIDER_H;
    const w = h * (rider.naturalWidth / rider.naturalHeight);
    ctx.drawImage(rider, -w / 2, -h - 4, w, h);
  } else {
    ctx.fillStyle = theme.bikeHub;
    ctx.beginPath();
    ctx.arc(-2, -28, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = theme.hillsMid;
    ctx.fillRect(-8, -22, 14, 18);
  }
  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
