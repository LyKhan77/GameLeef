// ============================================================
// simulation.js — traffic flow engine
// Poisson-burst spawning, car-following stop logic, ROI crossing
// detection, honk klaxon, rain particles, floating "+1" pings.
// ============================================================
import * as THREE from 'three';
import { LANES, WORLD, CATS, EVENTS, PALETTE, HONK_BOOST, HONK_DURATION } from './config.js';
import { createVehicle } from './vehicles.js';

const W = WORLD;
const CAT_KEYS = ['car', 'bike', 'truck', 'cycle'];
const MAX_VEHICLES = 90;
const RAIN_COUNT = 650;

export class Simulation {
  constructor(scene, lights) {
    this.scene = scene;
    this.lights = lights;
    this.vehicles = [];
    this.lanes = LANES.map((l) => ({ ...l, queue: [], timer: 0.5 + Math.random() * 2.5 }));
    this.event = EVENTS.clear;
    this.roiOn = false;       // crossings count toward the round
    this.onROI = null;        // (vehicle) => void
    this.honkCooldown = 0;
    this._popPool = [];
    this.rain = null;
    scene.background = new THREE.Color(PALETTE.sky);
  }

  // ---------------- round control ----------------
  clear() {
    for (const v of this.vehicles) this.scene.remove(v.root);
    this.vehicles.length = 0;
    for (const lane of this.lanes) lane.queue.length = 0;
    for (const p of this._popPool) this.scene.remove(p);
    this._popPool.length = 0;
  }

  setEvent(ev) {
    this.event = ev;
    if (ev.key === 'rain') {
      this.scene.background.set(0x4d5f7a);
      this.lights.sun.color.set(0x9fb4d0);
      this.lights.ambient.color.set(0x7e93b8);
      this.startRain();
    } else {
      this.scene.background.set(PALETTE.sky);
      this.lights.sun.color.set(0xfff4e0);
      this.lights.ambient.color.set(0xcfe0ff);
      this.stopRain();
    }
  }

  honk() {
    // Force-accelerate the lead vehicle (closest to the ROI) by +40%.
    const cands = this.vehicles.filter((v) => {
      if (v.boost > 0) return false;
      if (v.lane.axis !== 'z' || v.lane.dir !== -1) return false; // N-bound lanes carry ROI traffic
      const distToROI = v.root.position.z - W.ROI_Z;
      return distToROI > 0.5;
    });
    if (cands.length === 0) return null;
    cands.sort((a, b) => a.root.position.z - b.root.position.z);
    const v = cands[0];
    v.boost = HONK_DURATION;
    v.ignoringCar = true; // plows through the queue — "forces" it
    return v;
  }

  // ---------------- spawning ----------------
  _pickCat() {
    const scale = this.event.spawnScale;
    const entries = CAT_KEYS.map((k) => [k, CATS[k].weight * scale[k]]);
    const total = entries.reduce((s, [, w]) => s + w, 0);
    let r = Math.random() * total;
    for (const [k, w] of entries) {
      if ((r -= w) <= 0) return k;
    }
    return 'car';
  }

  _gap() {
    const base = 5.2; // mean seconds between spawns per lane
    const expo = -Math.log(1 - Math.random()) * base; // Poisson inter-arrival
    const burst = Math.random() < 0.3 ? 0.45 : 1;     // Poisson burst clustering
    return Math.min(Math.max(expo * burst, 1.6), 14);
  }

  _spawn(lane) {
    if (this.vehicles.length >= MAX_VEHICLES) return;
    // Don't stack on a queue that has reached the spawn point
    const tail = lane.queue[lane.queue.length - 1];
    if (tail) {
      const tailCoord = tail.root.position[lane.axis === 'z' ? 'z' : 'x'];
      if ((W.SPAWN_AT - tailCoord) * lane.dir < 5) return;
    }
    const cat = this._pickCat();
    const root = createVehicle(cat, Math.random() < 0.5 ? 0 : 1);
    const pos = lane.axis === 'z'
      ? new THREE.Vector3(lane.cross, 0.2, -W.SPAWN_AT * lane.dir)
      : new THREE.Vector3(-W.SPAWN_AT * lane.dir, 0.2, lane.cross);
    root.position.copy(pos);
    root.rotation.y = lane.axis === 'z' ? (lane.dir === 1 ? 0 : Math.PI) : (lane.dir === 1 ? -Math.PI / 2 : Math.PI / 2);
    this.scene.add(root);

    const v = {
      root,
      lane,
      cat,
      halfLen: root.userData.halfLen,
      maxSpeed: root.userData.maxSpeed,
      speed: 0,
      wheels: root.userData.wheels,
      committing: false, // has entered the intersection
      counted: false,
      boost: 0,
      ignoringCar: false,
    };
    lane.queue.push(v);
    this.vehicles.push(v);
  }

  // ---------------- ROI pings (+1) ----------------
  _pop(v) {
    const pos = v.root.position.clone();
    pos.y += 1.2;
    const mat = new THREE.SpriteMaterial({ color: 0x00ffcc, transparent: true, opacity: 1, depthWrite: false });
    const sp = new THREE.Sprite(mat);
    sp.position.copy(pos);
    sp.scale.set(1.4, 1.4, 1);
    sp.userData = { t: 0 };
    this.scene.add(sp);
    this._popPool.push(sp);
  }

  _updatePops(dt) {
    for (let i = this._popPool.length - 1; i >= 0; i--) {
      const p = this._popPool[i];
      p.userData.t += dt;
      p.position.y += dt * 1.1;
      p.material.opacity = Math.max(0, 1 - p.userData.t / 1.1);
      if (p.userData.t >= 1.1) {
        this.scene.remove(p);
        p.material.dispose();
        this._popPool.splice(i, 1);
      }
    }
  }

  // ---------------- rain ----------------
  startRain() {
    if (this.rain) return;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(RAIN_COUNT * 3);
    for (let i = 0; i < RAIN_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 1] = Math.random() * 26;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 60;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color: 0xbcd8ff, size: 0.14, transparent: true, opacity: 0.55, sizeAttenuation: true });
    const points = new THREE.Points(geo, mat);
    this.scene.add(points);
    this.rain = points;
  }

  stopRain() {
    if (!this.rain) return;
    this.scene.remove(this.rain);
    this.rain.geometry.dispose();
    this.rain.material.dispose();
    this.rain = null;
  }

  // ---------------- per-frame update ----------------
  update(dt, { nsGreen, ewGreen, lightNS, lightEW }) {
    if (this.honkCooldown > 0) this.honkCooldown = Math.max(0, this.honkCooldown - dt);

    // Spawning (Poisson per lane)
    for (const lane of this.lanes) {
      lane.timer -= dt;
      if (lane.timer <= 0) {
        this._spawn(lane);
        lane.timer = this._gap();
      }
    }

    // Movement
    const acc = 3.2, dec = 6.5;
    for (const v of this.vehicles) {
      const lane = v.lane;
      const axis = lane.axis === 'z' ? 'z' : 'x';

      // --- find stop target ---
      let maxCoord = Infinity; // furthest travel allowed (in coordinate space)
      if (!v.ignoringCar) {
        const idx = lane.queue.indexOf(v);
        const ahead = lane.queue[idx + 1];
        if (ahead) {
          const gap = (ahead.root.position[axis] - v.root.position[axis]) * lane.dir
            - (ahead.halfLen + v.halfLen + W.SAFE_GAP);
          maxCoord = Math.min(maxCoord, v.root.position[axis] + lane.dir * Math.max(gap, 0));
        }
      }
      if (!v.committing) {
        const stopCoord = (W.INTER + W.STOP_GAP) * -lane.dir + (lane.dir === 1 ? 0 : 0);
        const distToStop = (stopCoord - v.root.position[axis]) * -lane.dir; // >0 means before the line
        if (distToStop > 0) {
          const green = lane.side === 'NS' ? nsGreen : ewGreen;
          if (!green || distToStop < 3.2) {
            maxCoord = Math.min(maxCoord, stopCoord);
          }
        }
      }

      // --- accelerate / brake toward the target ---
      const target = Math.max(0, (maxCoord - v.root.position[axis]) * -lane.dir) * 0 + (maxCoord === Infinity ? v.targetSpeed() : Math.min(v.targetSpeed(), this._speedTo(v, maxCoord, lane)));
      // (compute desired speed from distance to the stop target)
      let desired;
      if (maxCoord === Infinity) {
        desired = v.boost > 0 ? v.maxSpeed * HONK_BOOST : v.maxSpeed;
      } else {
        const dist = (maxCoord - v.root.position[axis]) * -lane.dir;
        if (dist <= 0) desired = 0;
        else {
          const vMax = v.boost > 0 ? v.maxSpeed * HONK_BOOST : v.maxSpeed;
          // brake distance at `dec`
          desired = Math.min(vMax, Math.sqrt(2 * dec * Math.max(dist, 0)) * 0.92);
        }
      }
      if (v.speed < desired) v.speed = Math.min(desired, v.speed + acc * dt);
      else v.speed = Math.max(desired, v.speed - dec * dt);

      // --- commit to crossing once past the stop line ---
      const sCoord = (W.INTER + W.STOP_GAP) * -lane.dir;
      const pastStop = (v.root.position[axis] - sCoord) * -lane.dir > 0;
      if (pastStop) v.committing = true;

      // --- move ---
      v.root.position[axis] += v.speed * lane.dir * dt;
      for (const wl of v.wheels) wl.mesh.rotation.x += (v.speed * dt) / wl.radius;

      // --- ROI crossing ---
      if (!v.counted && this.roiOn
        && lane.axis === 'z' && lane.dir === -1
        && v.root.position.x >= W.ROI_X0 && v.root.position.x <= W.ROI_X1) {
        const prev = v.root.position.z;
        if (prev > W.ROI_Z && v.root.position.z <= W.ROI_Z) {
          v.counted = true;
          this._pop(v);
          if (this.onROI) this.onROI(v);
        }
      }
    }

    // --- despawn off-screen ---
    for (let i = this.vehicles.length - 1; i >= 0; i--) {
      const v = this.vehicles[i];
      const c = v.root.position[v.lane.axis === 'z' ? 'z' : 'x'];
      if (c * v.lane.dir > W.DESPAWN_AT) {
        this.scene.remove(v.root);
        this.vehicles.splice(i, 1);
        const qi = v.lane.queue.indexOf(v);
        if (qi >= 0) v.lane.queue.splice(qi, 1);
      }
    }

    // --- rain fall ---
    if (this.rain) {
      const arr = this.rain.geometry.attributes.position.array;
      for (let i = 1; i < arr.length; i += 3) {
        arr[i] -= 16 * dt;
        if (arr[i] < 0) arr[i] += 26;
      }
      this.rain.geometry.attributes.position.needsUpdate = true;
    }

    this._updatePops(dt);
  }
}

// Helper attached to vehicle objects (kept out of the class for readability).
Simulation.prototype._speedTo = function (v, maxCoord, lane) {
  const dist = (maxCoord - v.root.position[lane.axis === 'z' ? 'z' : 'x']) * -lane.dir;
  return dist <= 0 ? 0 : Math.min(v.maxSpeed * (v.boost > 0 ? HONK_BOOST : 1), Math.sqrt(2 * 6.5 * Math.max(dist, 0)));
};

// Per-vehicle max-speed accessor (boost-aware) used by the update loop.
Object.defineProperty(Simulation.prototype, 'noop', { value: null });
