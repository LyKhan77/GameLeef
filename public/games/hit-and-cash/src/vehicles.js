// ============================================================
// vehicles.js — procedural low-poly vehicle factory
// Each vehicle faces +Z (local forward). Returns a THREE.Group
// with metadata: { cat, len, maxSpeed, wheels[] }.
// ============================================================
import * as THREE from 'three';

const BODY_COLORS = {
  car:     [0xe84118, 0x0652dd], // red / blue
  bike:    [0x00cec9, 0xffa502], // cyan frame / yellow tank
  truck:   [0xf2994a, 0xf1f2f6], // orange cab / white box
  cycle:   [0x2ed573, 0x10ac84], // green frame / rider
};

function mat(color, extra = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    flatShading: true,
    roughness: 0.7,
    metalness: 0.05,
    ...extra,
  });
}

function box(w, h, d, material, x = 0, y = 0, z = 0, parent) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

// Wheel: cylinder axis baked along X so rotation.x rolls it along +Z.
function wheel(radius, width, color, x, y, z, parent, wheels) {
  const geo = new THREE.CylinderGeometry(radius, radius, width, 10);
  geo.rotateZ(Math.PI / 2);
  const m = new THREE.Mesh(geo, mat(color));
  m.position.set(x, y, z);
  m.castShadow = true;
  parent.add(m);
  wheels.push({ mesh: m, radius });
  return m;
}

function buildCar(g, variant) {
  const base = variant ? BODY_COLORS.car[1] : BODY_COLORS.car[0];
  const wheels = [];
  box(1.0, 0.36, 2.0, mat(base), 0, 0.34, 0, g);            // chassis
  box(0.88, 0.34, 1.05, mat(0x1e272e), 0, 0.66, -0.12, g);   // cabin
  box(0.8, 0.24, 0.06, mat(0x70a1ff, { roughness: 0.3 }), 0, 0.68, 0.45, g); // windshield
  box(0.8, 0.24, 0.06, mat(0x70a1ff, { roughness: 0.3 }), 0, 0.68, -0.6, g); // rear glass
  // headlights (front = +Z)
  const lamp = mat(0xffeaa7, { emissive: 0xffeaa7, emissiveIntensity: 0.7 });
  box(0.16, 0.1, 0.05, lamp, -0.32, 0.36, 1.0, g);
  box(0.16, 0.1, 0.05, lamp, 0.32, 0.36, 1.0, g);
  for (const zx of [-0.62, 0.62]) for (const x of [-0.52, 0.52]) {
    wheel(0.17, 0.14, 0x1e272e, x, 0.17, zx, g, wheels);
  }
}

function buildTruck(g) {
  const wheels = [];
  // cab (front, +Z)
  box(1.06, 0.92, 1.0, mat(BODY_COLORS.truck[0]), 0, 0.55, 1.7, g);
  box(0.96, 0.34, 0.06, mat(0x70a1ff, { roughness: 0.3 }), 0, 0.82, 2.2, g);
  // container
  box(1.12, 1.1, 3.0, mat(BODY_COLORS.truck[1]), 0, 0.92, -0.8, g);
  box(1.14, 0.16, 3.0, mat(BODY_COLORS.truck[0]), 0, 0.5, -0.8, g); // stripe
  const lamp = mat(0xffeaa7, { emissive: 0xffeaa7, emissiveIntensity: 0.7 });
  box(0.16, 0.1, 0.05, lamp, -0.36, 0.36, 2.21, g);
  box(0.16, 0.1, 0.05, lamp, 0.36, 0.36, 2.21, g);
  // 6 wheels: 2 front, 4 rear
  wheel(0.22, 0.16, 0x1e272e, -0.56, 0.22, 1.7, g, wheels);
  wheel(0.22, 0.16, 0x1e272e, 0.56, 0.22, 1.7, g, wheels);
  for (const zx of [-1.5, -0.5]) for (const x of [-0.56, 0.56]) {
    wheel(0.22, 0.16, 0x1e272e, x, 0.22, zx, g, wheels);
  }
}

function buildMotorcycle(g, variant) {
  const frame = variant ? BODY_COLORS.bike[1] : BODY_COLORS.bike[0];
  const wheels = [];
  box(0.13, 0.13, 0.92, mat(0x2f3542), 0, 0.36, 0, g);        // frame
  box(0.24, 0.3, 0.34, mat(frame), 0, 0.62, 0.08, g);         // tank / jacket
  box(0.16, 0.22, 0.1, mat(0x2f3542), 0, 0.5, 0.48, g);       // handlebar
  const rider = mat(BODY_COLORS.bike[variant ? 0 : 1], {});
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.11, 6, 5), mat(0xf1f2f6));
  head.position.set(0, 0.88, 0.08);
  head.castShadow = true;
  g.add(head);
  wheel(0.16, 0.09, 0x1e272e, 0, 0.16, 0.46, g, wheels);
  wheel(0.16, 0.09, 0x1e272e, 0, 0.16, -0.46, g, wheels);
}

function buildBicycle(g, variant) {
  const frame = BODY_COLORS.cycle[0];
  const rider = BODY_COLORS.cycle[variant ? 0 : 1];
  const wheels = [];
  box(0.06, 0.06, 0.78, mat(frame), 0, 0.42, 0, g);           // top tube
  box(0.06, 0.3, 0.06, mat(frame), 0, 0.3, 0.36, g);          // fork
  box(0.06, 0.3, 0.06, mat(frame), 0, 0.3, -0.34, g);         // seat stay
  box(0.5, 0.05, 0.05, mat(0x2f3542), 0, 0.62, 0.4, g);       // handlebar
  box(0.18, 0.06, 0.3, mat(0x2f3542), 0, 0.6, -0.34, g);      // saddle
  box(0.2, 0.32, 0.24, mat(rider), 0, 0.82, 0.02, g);         // torso
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 5), mat(0xffd9a0));
  head.position.set(0, 1.08, 0.12);
  head.castShadow = true;
  g.add(head);
  wheel(0.2, 0.045, 0x1e272e, 0, 0.2, 0.38, g, wheels);
  wheel(0.2, 0.045, 0x1e272e, 0, 0.2, -0.38, g, wheels);
}

const BUILDERS = {
  car: buildCar,
  truck: buildTruck,
  bike: buildMotorcycle,
  cycle: buildBicycle,
};

export function createVehicle(cat, variant = 0) {
  const spec = { car: { len: 2.2, speed: 3.5 }, bike: { len: 1.2, speed: 5.0 }, truck: { len: 4.5, speed: 2.0 }, cycle: { len: 1.0, speed: 2.2 } }[cat];
  const g = new THREE.Group();
  BUILDERS[cat](g, variant % 2);
  g.userData = { cat, len: spec.len, halfLen: spec.len / 2, maxSpeed: spec.speed, wheels: g.userData.wheels || [] };
  // collect wheels from builder (builders pushed to local arrays; re-collect via traverse)
  g.userData.wheels = [];
  g.traverse((o) => {
    if (o.isMesh && o.geometry.type === 'CylinderGeometry') g.userData.wheels.push({ mesh: o, radius: o.geometry.parameters.radiusTop });
  });
  return g;
}
