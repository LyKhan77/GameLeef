// ============================================================
// config.js — shared constants, lane topology, bet definitions
// ============================================================

export const PALETTE = {
  asphalt: 0x2f3542,
  grass:   0x2ed573,
  yellow:  0xffa502,
  sky:     0x70a1ff,
  curb:    0xf1f2f6,
  roi:     0x00d2d3,
  dark:    0x1e272e,
  white:   0xe8ecf2,
};

export const PHASES = Object.freeze({
  BETTING: 'BETTING',
  EXECUTION: 'EXECUTION',
  SETTLEMENT: 'SETTLEMENT',
});

export const TIMING = Object.freeze({
  BETTING: 6.0,
  EXECUTION: 15.0,
  SETTLEMENT: 5.0,
  // Within EXECUTION: N-S green 0 → NS_GREEN_END, yellow, E-W green until end.
  NS_GREEN_END: 9.2,
  EW_GREEN_START: 9.8,
  // Slow-motion during the last 1.5 s of SETTLEMENT.
  SLOWMO_AT: 3.5,
  SLOWMO_SCALE: 0.3,
});

// Lane topology for the 4-way crossroad.
// axis  : travel axis ('z' = N-S road, 'x' = E-W road)
// dir   : +1 / -1 along the axis
// cross : lane-center coordinate on the perpendicular axis
// side  : which signal phase controls this lane ('NS' | 'EW')
export const LANES = Object.freeze([
  { axis: 'z', dir: -1, cross:  1, side: 'NS' }, // N-bound, lane x=+1
  { axis: 'z', dir: -1, cross:  3, side: 'NS' }, // N-bound, lane x=+3
  { axis: 'z', dir: +1, cross: -1, side: 'NS' }, // S-bound, lane x=-1
  { axis: 'z', dir: +1, cross: -3, side: 'NS' }, // S-bound, lane x=-3
  { axis: 'x', dir: +1, cross:  1, side: 'EW' }, // E-bound, lane z=+1
  { axis: 'x', dir: +1, cross:  3, side: 'EW' }, // E-bound, lane z=+3
  { axis: 'x', dir: -1, cross: -1, side: 'EW' }, // W-bound, lane z=-1
  { axis: 'x', dir: -1, cross: -3, side: 'EW' }, // W-bound, lane z=-3
]);

export const WORLD = Object.freeze({
  ROAD_HALF: 4,          // road half-width (2 lanes × 2u each side)
  INTER: 4,              // intersection half-size
  STOP_GAP: 0.6,         // stop-line distance in front of the intersection
  SPAWN_AT: 26,          // spawn / despawn coordinate
  DESPAWN_AT: 27,
  ROI_Z: -7.2,           // ROI line position (z), N-bound exit
  ROI_X0: 0.1,           // ROI line x-span
  ROI_X1: 3.9,
  SAFE_GAP: 1.5,         // required stopping gap
});

export const CATS = Object.freeze({
  car:     { len: 2.2, speed: 3.5, weight: 40, label: 'Cars',   icon: '🚗', colorA: 0xe84118, colorB: 0x0652dd },
  bike:    { len: 1.2, speed: 5.0, weight: 25, label: 'Bikes',  icon: '🏍️', colorA: 0x00cec9, colorB: 0xffa502 },
  truck:   { len: 4.5, speed: 2.0, weight: 15, label: 'Trucks', icon: '🚚', colorA: 0xf2994a, colorB: 0xf1f2f6 },
  cycle:   { len: 1.0, speed: 2.2, weight: 20, label: 'Cycles', icon: '🚲', colorA: 0x2ed573, colorB: 0x10ac84 },
});

// Bet market. `win(counts, total)` is pure — used by both settlement and live odds.
export const BETS = Object.freeze({
  odd:    { label: 'ODD',        odds: 1.95, win: (c) => c.total % 2 === 1 },
  even:   { label: 'EVEN',       odds: 1.95, win: (c) => c.total > 0 && c.total % 2 === 0 },
  truck0: { label: 'Truck = 0',  odds: 2.40, win: (c) => c.truck === 0 },
  cars4:  { label: 'Cars > 4',   odds: 2.10, win: (c) => c.car > 4 },
  bikes3: { label: 'Bikes ≥ 3',  odds: 3.20, win: (c) => c.bike >= 3 },
});

export const START_BALANCE = 1000;
export const HONK_COST = 20;
export const HONK_BOOST = 1.4;
export const HONK_DURATION = 4.0;
export const MIN_BET = 10;

// Micro-events picked randomly each round.
export const EVENTS = Object.freeze({
  clear: {
    key: 'clear',
    label: '☀️ CLEAR WEATHER',
    css: '',
    spawnScale: { car: 1, bike: 1, truck: 1, cycle: 1 },
    lightTint: 1.0,
  },
  rain: {
    key: 'rain',
    label: '🌧️ HEAVY RAIN',
    css: 'rain',
    spawnScale: { car: 1, bike: 0.2, truck: 1, cycle: 0.2 },
    lightTint: 0.55,
  },
  rush: {
    key: 'rush',
    label: '⚡ RUSH HOUR ALERT',
    css: 'rush',
    spawnScale: { car: 2, bike: 2, truck: 2, cycle: 2 },
    lightTint: 1.0,
  },
});
