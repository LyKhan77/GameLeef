// ============================================================
// world.js — renderer, isometric camera, lights, map 1 geometry
// ============================================================
import * as THREE from 'three';
import { PALETTE, WORLD } from './config.js';

const W = WORLD;

export function createRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  return renderer;
}

// True isometric: from (40,40,40) at (0,0,0), up +Y.
export function createCamera(aspect, halfH = 27) {
  const camera = new THREE.OrthographicCamera(
    -halfH * aspect, halfH * aspect, halfH, -halfH, 0.1, 300,
  );
  camera.position.set(40, 40, 40);
  camera.up.set(0, 1, 0);
  camera.lookAt(0, 0, 0);
  return camera;
}

export function resizeCamera(camera, renderer, aspect) {
  const halfH = 27;
  camera.left = -halfH * aspect;
  camera.right = halfH * aspect;
  camera.top = halfH;
  camera.bottom = -halfH;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight, false);
}

export function createLights(scene) {
  const ambient = new THREE.AmbientLight(0xcfe0ff, 0.6);
  const sun = new THREE.DirectionalLight(0xfff4e0, 1.0);
  sun.position.set(30, 50, 20);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const s = 34;
  sun.shadow.camera.left = -s;
  sun.shadow.camera.right = s;
  sun.shadow.camera.top = s;
  sun.shadow.camera.bottom = -s;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 140;
  sun.shadow.bias = -0.0004;
  scene.add(ambient, sun);
  return { ambient, sun };
}

// ----------------------------------------------------------------
// Map 1 — Downtown 4-Way Crossroad
// ----------------------------------------------------------------

function flatMat(color, extra = {}) {
  return new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.7, metalness: 0.05, ...extra });
}

function slab(w, h, d, x, y, z, material, parent, shadow = true) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  m.position.set(x, y, z);
  if (shadow) { m.castShadow = true; m.receiveShadow = true; }
  parent.add(m);
  return m;
}

function dashes(parent, matRef, axis, at, from, to, len, gap, thick) {
  // Dashed line segments along `axis` at fixed cross coordinate `at`.
  for (let p = from; p + len <= to; p += len + gap) {
    const mid = p + len / 2;
    if (axis === 'z') slab(thick, 0.02, len, at, 0.21, mid, matRef, parent, false);
    else slab(len, 0.02, thick, mid, 0.21, at, matRef, parent, false);
  }
}

export function buildMap(scene) {
  const map = new THREE.Group();
  scene.add(map);

  const grassMat = flatMat(PALETTE.grass);
  const asphaltMat = flatMat(PALETTE.asphalt);
  const sidewalkMat = flatMat(0xd8dce2);
  const lineMat = flatMat(PALETTE.curb);

  // Grass base
  slab(64, 0.1, 64, 0, -0.05, 0, grassMat, map, false);

  // Roads (EW layer sits 0.01 above NS to avoid z-fighting in the crossing)
  slab(8, 0.16, 56, 0, 0.02, 0, asphaltMat, map, false);   // N-S road
  slab(56, 0.16, 8, 0, 0.06, 0, asphaltMat, map, false);   // E-W road

  // Curb strips along road edges
  const curbMat = flatMat(PALETTE.curb);
  for (const s of [-1, 1]) {
    slab(0.3, 0.1, 56, 4.15 * s, 0.05, 0, curbMat, map, false);
    slab(56, 0.1, 0.3, 0, 0.05, 4.15 * s, curbMat, map, false);
  }

  // Sidewalk pads (corner quadrants + long strips along road sides)
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    slab(14, 0.06, 14, 11.2 * sx, 0.04, 11.2 * sz, sidewalkMat, map, false);
  }
  for (const s of [-1, 1]) {
    slab(4, 0.06, 56, 6.6 * s, 0.04, 0, sidewalkMat, map, false);
    slab(56, 0.06, 4, 0, 0.04, 6.6 * s, sidewalkMat, map, false);
  }

  // ---- Road markings ----
  const D = 1.3, G = 1.3, B = W.INTER + 0.4; // break at the intersection
  // Dashed center lines (splitting opposing traffic)
  dashes(map, lineMat, 'z', 0, -24, -B, D, G, 0.12);
  dashes(map, lineMat, 'z', 0, B, 24, D, G, 0.12);
  dashes(map, lineMat, 'x', 0, -24, -B, D, G, 0.12);
  dashes(map, lineMat, 'x', 0, B, 24, D, G, 0.12);
  // Dashed lane-divider lines (between same-direction lanes)
  for (const a of [2, -2]) {
    dashes(map, lineMat, 'z', a, 5, 24, D, G, 0.1);
    dashes(map, lineMat, 'z', a, -24, -5, D, G, 0.1);
    dashes(map, lineMat, 'x', a, 5, 24, D, G, 0.1);
    dashes(map, lineMat, 'x', a, -24, -5, D, G, 0.1);
  }

  // Stop lines: white bar in each approach, just before the intersection
  const stopAt = W.INTER + W.STOP_GAP;
  for (const s of [-1, 1]) {
    slab(4, 0.02, 0.28, 2 * s, 0.21, stopAt * s, lineMat, map, false);      // S/N approaches
    slab(4, 0.02, 0.28, -2 * s, 0.21, -stopAt * s, lineMat, map, false);
    slab(0.28, 0.02, 4, stopAt * s, 0.21, 2 * s, lineMat, map, false);      // E/W approaches
    slab(0.28, 0.02, 4, -stopAt * s, 0.21, -2 * s, lineMat, map, false);
  }

  // Crosswalks (zebra bars) on each approach
  const zebraNS = (z0) => { // crossing the N-S road (bars run along X)
    for (let i = 0; i < 8; i++) {
      const off = (i - 3.5) * 0.7;
      slab(4.4, 0.02, 0.42, 0, 0.21, z0 + off, lineMat, map, false);
    }
  };
  const zebraEW = (x0) => { // crossing the E-W road (bars run along Z)
    for (let i = 0; i < 8; i++) {
      const off = (i - 3.5) * 0.7;
      slab(0.42, 0.02, 4.4, x0 + off, 0.21, 0, lineMat, map, false);
    }
  };
  zebraNS(7.1);
  zebraNS(-7.1);
  zebraEW(7.1);
  zebraEW(-7.1);

  // ---------------- Props: trees, hydrants, lamps ----------------
  const trunkMat = flatMat(0x6b4226);
  const leafMat = flatMat(0x00b894);
  const leafMat2 = flatMat(0x01a36c);
  const lampPostMat = flatMat(0x57606f);
  const lampHeadMat = flatMat(0xfff3bf, { emissive: 0xffe9a8, emissiveIntensity: 0.55 });
  const hydrantMat = flatMat(0xff4757);

  function tree(x, z, scale = 1) {
    const t = new THREE.Group();
    const h = 1.6 * scale;
    slab(0.35 * scale, h, 0.35 * scale, 0, h / 2, 0, trunkMat, t);
    slab(1.5 * scale, 1.3 * scale, 1.5 * scale, 0, h + 0.6 * scale, 0, leafMat, t);
    slab(1.0 * scale, 1.0 * scale, 1.0 * scale, 0.2 * scale, h + 1.5 * scale, 0.1 * scale, leafMat2, t);
    t.position.set(x, 0, z);
    map.add(t);
  }

  function lamp(x, z, rotY = 0) {
    const t = new THREE.Group();
    slab(0.22, 4.4, 0.22, 0, 2.2, 0, lampPostMat, t);
    slab(1.6, 0.14, 0.22, 0.7, 4.35, 0, lampPostMat, t);
    slab(0.5, 0.28, 0.3, 1.45, 4.35, 0, lampHeadMat, t);
    t.position.set(x, 0, z);
    t.rotation.y = rotY;
    map.add(t);
  }

  function hydrant(x, z) {
    const t = new THREE.Group();
    slab(0.3, 0.55, 0.3, 0, 0.28, 0, hydrantMat, t);
    const dome = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.16, 8), hydrantMat);
    dome.position.y = 0.62;
    dome.castShadow = true;
    t.add(dome);
    slab(0.5, 0.1, 0.1, 0, 0.4, 0.18, hydrantMat, t);
    t.position.set(x, 0, z);
    map.add(t);
  }

  // Trees at the four block corners + along the sidewalks
  tree(-7.4, 7.4, 1.15);   tree(-7.4, -7.4, 1.0);
  tree(7.4, -7.4, 1.15);   tree(7.4, 7.4, 1.0);
  tree(-13, 10.5, 1.0);    tree(13, -10.5, 1.1);
  tree(10.5, -13, 0.95);   tree(-10.5, 13, 1.05);
  tree(-18.5, 16, 1.2);    tree(18.5, -16, 1.1);
  tree(16, 18.5, 1.0);     tree(-16, -18.5, 1.15);

  // Street lamps at the four corners (arm reaching over the road)
  lamp(-5.2, 5.2, 0);
  lamp(5.2, -5.2, Math.PI);
  lamp(-5.2, -5.2, Math.PI / 2);
  lamp(5.2, 5.2, -Math.PI / 2);

  // Fire hydrants on the sidewalk corners
  hydrant(6.2, 6.2);
  hydrant(-6.2, -6.2);
  hydrant(6.2, -6.2);

  return map;
}

// ----------------------------------------------------------------
// ROI trigger line — glowing neon cyan across the N-bound exit
// ----------------------------------------------------------------
export function buildROILine(scene) {
  const g = new THREE.Group();
  const x0 = W.ROI_X0, x1 = W.ROI_X1, xc = (x0 + x1) / 2;

  const barMat = new THREE.MeshBasicMaterial({ color: PALETTE.roi, transparent: true, opacity: 0.95 });
  const bar = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, 0.06, 0.1), barMat);
  bar.position.set(xc, 0.26, W.ROI_Z);
  g.add(bar);

  const planeMat = new THREE.MeshBasicMaterial({
    color: PALETTE.roi, transparent: true, opacity: 0.12,
    side: THREE.DoubleSide, depthWrite: false,
  });
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, 2.6), planeMat);
  plane.rotation.x = -Math.PI / 2;
  plane.position.set(xc, 0.1, W.ROI_Z);
  g.add(plane);

  scene.add(g);
  return g;
}

// ----------------------------------------------------------------
// Traffic light model: pole + 3-lamp head, per-signal materials
// ----------------------------------------------------------------
export function buildTrafficLight(scene) {
  const poleMat = flatMat(0x57606f);
  const housingMat = flatMat(0x232a36);

  const mkHead = (x, z, rotY) => {
    const g = new THREE.Group();
    slab(0.3, 5.2, 0.3, 0, 2.6, 0, poleMat, g);
    slab(0.7, 2.1, 0.5, 0, 5.0, 0.42, housingMat, g);

    const mats = {}, pLights = {};
    const makeLamp = (key, color, y) => {
      const m = new THREE.MeshStandardMaterial({
        color: 0x14181f, emissive: color, emissiveIntensity: 0.05,
        flatShading: true, roughness: 0.7,
      });
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.21, 8, 6), m);
      mesh.position.set(0, y, 0.68);
      g.add(mesh);
      const pl = new THREE.PointLight(color, 0, 7, 2);
      pl.position.set(0, y, 0.85);
      g.add(pl);
      mats[key] = m;
      pLights[key] = pl;
    };
    makeLamp('red', 0xff4757, 5.62);
    makeLamp('yellow', 0xffa502, 5.0);
    makeLamp('green', 0x2ed573, 4.38);

    g.position.set(x, 0, z);
    g.rotation.y = rotY;
    scene.add(g);

    return (state) => {
      for (const k of ['red', 'yellow', 'green']) {
        const on = state === k;
        mats[k].emissiveIntensity = on ? 1.6 : 0.05;
        pLights[k].intensity = on ? 1.3 : 0;
      }
    };
  };

  const setNS = mkHead(5.6, 5.6, Math.PI);         // SE corner, facing south (+Z)
  const setEW = mkHead(5.6, -5.6, -Math.PI / 2);   // NE corner, facing west (-X)

  return {
    setNS,
    setEW,
    setBoth: (state) => { setNS(state); setEW(state); },
  };
}
