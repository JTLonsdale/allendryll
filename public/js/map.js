// Tile types
const TILE = {
  GRASS: 0, WATER: 1, MOUNTAIN: 2, TOWN: 3,
  DENSE_FOREST: 4, TREES: 5, PATH: 6, SAND: 7,
  BRIDGE: 8, FLOWERS: 9,
  // Town interior tiles (10-31)
  COBBLE: 10, WOOD_FLOOR: 11, WALL: 12, WALL_TOP: 13,
  COUNTER: 14, DOOR: 15, CARPET: 16, TOWN_TREE: 17,
  TOWN_EXIT: 18, STREAM: 19, TOWN_BRIDGE: 20, FOUNTAIN: 21,
  WELL: 22, FENCE: 23, GARDEN: 24, SIGN: 25,
  ROOF: 26, INN_BED: 27, BOOKSHELF: 28, TOWN_FLOWERS: 29,
  DOCK: 30, STONE_CIRCLE: 31
};
const TILE_SIZE = 32;

const WALKABLE = {
  [TILE.GRASS]: true, [TILE.WATER]: false, [TILE.MOUNTAIN]: false,
  [TILE.TOWN]: true, [TILE.DENSE_FOREST]: false, [TILE.TREES]: true,
  [TILE.PATH]: true, [TILE.SAND]: true, [TILE.BRIDGE]: true,
  [TILE.FLOWERS]: true,
  // Town interior walkability
  [TILE.COBBLE]: true, [TILE.WOOD_FLOOR]: true, [TILE.WALL]: false,
  [TILE.WALL_TOP]: false, [TILE.COUNTER]: false, [TILE.DOOR]: true,
  [TILE.CARPET]: true, [TILE.TOWN_TREE]: false, [TILE.TOWN_EXIT]: true,
  [TILE.STREAM]: false, [TILE.TOWN_BRIDGE]: true, [TILE.FOUNTAIN]: false,
  [TILE.WELL]: false, [TILE.FENCE]: false, [TILE.GARDEN]: false,
  [TILE.SIGN]: false, [TILE.ROOF]: false, [TILE.INN_BED]: false,
  [TILE.BOOKSHELF]: false, [TILE.TOWN_FLOWERS]: true, [TILE.DOCK]: true,
  [TILE.STONE_CIRCLE]: false
};

// Seeded hash for deterministic randomness
function tileHash(x, y) {
  let h = x * 374761393 + y * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  h = h ^ (h >> 16);
  return (h & 0x7fffffff) / 0x7fffffff;
}

// Smooth value noise
function valNoise(x, y, scale) {
  const sx = x / scale, sy = y / scale;
  const ix = Math.floor(sx), iy = Math.floor(sy);
  const fx = sx - ix, fy = sy - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = tileHash(ix, iy), b = tileHash(ix + 1, iy);
  const c = tileHash(ix, iy + 1), d = tileHash(ix + 1, iy + 1);
  return a * (1 - ux) * (1 - uy) + b * ux * (1 - uy) + c * (1 - ux) * uy + d * ux * uy;
}

function generateMap() {
  const W = 60, H = 50;
  const map = [];

  // All water
  for (let y = 0; y < H; y++) {
    map[y] = new Array(W).fill(TILE.WATER);
  }

  // Continent shape — ellipse with noise (generous size to fit all features)
  const cx = W / 2, cy = H / 2;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const dx = (x - cx) / (W * 0.48);
      const dy = (y - cy) / (H * 0.48);
      const dist = Math.sqrt(dx * dx + dy * dy);
      const n = valNoise(x, y, 8) * 0.2 + valNoise(x, y, 4) * 0.1;
      if (dist + n < 0.88) {
        map[y][x] = TILE.GRASS;
      }
    }
  }

  // Southern peninsula extension
  for (let y = 38; y < 47; y++) {
    for (let x = 22; x < 38; x++) {
      const dx = (x - 30) / 9;
      const dy = (y - 38) / 10;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist + valNoise(x, y, 5) * 0.15 < 0.85) {
        map[y][x] = TILE.GRASS;
      }
    }
  }

  // Small islands in the south
  const islands = [
    { x: 15, y: 44, r: 2.5 }, { x: 45, y: 43, r: 2 },
    { x: 50, y: 40, r: 1.8 }, { x: 8, y: 42, r: 1.5 }
  ];
  for (const isl of islands) {
    for (let y = Math.floor(isl.y - isl.r - 1); y <= Math.ceil(isl.y + isl.r + 1); y++) {
      for (let x = Math.floor(isl.x - isl.r - 1); x <= Math.ceil(isl.x + isl.r + 1); x++) {
        if (y >= 0 && y < H && x >= 0 && x < W) {
          const d = Math.sqrt((x - isl.x) ** 2 + (y - isl.y) ** 2);
          if (d < isl.r + valNoise(x, y, 3) * 0.5) {
            map[y][x] = TILE.GRASS;
          }
        }
      }
    }
  }

  // === Northern mountain range ===
  for (let x = 6; x < 55; x++) {
    const baseY = 7 + Math.sin(x * 0.12) * 2.5 + Math.sin(x * 0.3) * 1;
    for (let dy = -2; dy <= 2; dy++) {
      const y = Math.round(baseY + dy);
      if (y >= 0 && y < H && map[y][x] === TILE.GRASS) {
        const edgeFade = Math.max(0, 1 - Math.abs(dy) / 2.5);
        if (tileHash(x, y + 1000) < edgeFade * 0.8) {
          map[y][x] = TILE.MOUNTAIN;
        }
      }
    }
  }

  // Mountain pass in the middle
  for (let y = 3; y < 13; y++) {
    for (let x = 27; x < 33; x++) {
      if (map[y][x] === TILE.MOUNTAIN) map[y][x] = TILE.GRASS;
    }
  }

  // Central-west mountain cluster
  for (let y = 20; y < 28; y++) {
    for (let x = 7; x < 16; x++) {
      if (map[y][x] === TILE.GRASS) {
        const dx = (x - 11.5) / 5, dy2 = (y - 24) / 4.5;
        if (dx * dx + dy2 * dy2 < 0.7 && tileHash(x + 100, y) > 0.45) {
          map[y][x] = TILE.MOUNTAIN;
        }
      }
    }
  }

  // Eastern ridge
  for (let y = 14; y < 22; y++) {
    for (let x = 46; x < 52; x++) {
      if (map[y][x] === TILE.GRASS) {
        const dx = (x - 49) / 3.5, dy2 = (y - 18) / 4.5;
        if (dx * dx + dy2 * dy2 < 0.8 && tileHash(x + 200, y) > 0.5) {
          map[y][x] = TILE.MOUNTAIN;
        }
      }
    }
  }

  // === Lake in the east ===
  const lakeX = 44, lakeY = 28;
  for (let y = lakeY - 5; y <= lakeY + 5; y++) {
    for (let x = lakeX - 4; x <= lakeX + 4; x++) {
      if (y >= 0 && y < H && x >= 0 && x < W) {
        const dx = (x - lakeX) / 4.5, dy2 = (y - lakeY) / 5.5;
        if (dx * dx + dy2 * dy2 < 1 + tileHash(x + 400, y) * 0.15) {
          map[y][x] = TILE.WATER;
        }
      }
    }
  }

  // === River from northern mountains south ===
  let rx = 30;
  for (let y = 10; y < 44; y++) {
    rx += Math.round(tileHash(rx * 7, y + 500) * 2.5 - 1.2);
    rx = Math.max(22, Math.min(38, rx));
    for (let dx = 0; dx <= 1; dx++) {
      const wx = rx + dx;
      if (wx >= 0 && wx < W) map[y][wx] = TILE.WATER;
    }
  }

  // === Forest areas ===
  const forests = [
    { x: 4, y: 13, w: 11, h: 7, dense: 0.35 },
    { x: 36, y: 32, w: 9, h: 7, dense: 0.30 },
    { x: 18, y: 34, w: 7, h: 5, dense: 0.40 },
    { x: 35, y: 10, w: 6, h: 5, dense: 0.25 },
    { x: 10, y: 30, w: 5, h: 4, dense: 0.30 },
  ];
  for (const f of forests) {
    for (let y = f.y; y < f.y + f.h && y < H; y++) {
      for (let x = f.x; x < f.x + f.w && x < W; x++) {
        if (map[y][x] === TILE.GRASS) {
          const h = tileHash(x + 200, y + 200);
          if (h < f.dense * 0.5) map[y][x] = TILE.DENSE_FOREST;
          else if (h < f.dense) map[y][x] = TILE.TREES;
        }
      }
    }
  }

  // Scattered trees
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (map[y][x] === TILE.GRASS && tileHash(x + 300, y + 300) > 0.93) {
        map[y][x] = TILE.TREES;
      }
    }
  }

  // === 5 Towns (one per princess) ===
  const towns = [
    { x: 15, y: 11 }, // NW — near forest
    { x: 48, y: 11 }, // NE — eastern
    { x: 28, y: 24 }, // Center — capital
    { x: 13, y: 38 }, // SW — southern
    { x: 46, y: 36 }, // SE — by the lake
  ];
  for (const t of towns) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const tx = t.x + dx, ty = t.y + dy;
        if (ty >= 0 && ty < H && tx >= 0 && tx < W) {
          map[ty][tx] = TILE.TOWN;
        }
      }
    }
  }

  // === Paths connecting towns ===
  function drawPathBetween(x0, y0, x1, y1) {
    let x = x0, y = y0;
    while (x !== x1 || y !== y1) {
      if (map[y][x] === TILE.GRASS || map[y][x] === TILE.TREES ||
          map[y][x] === TILE.FLOWERS || map[y][x] === TILE.SAND) {
        map[y][x] = TILE.PATH;
      } else if (map[y][x] === TILE.WATER) {
        map[y][x] = TILE.BRIDGE;
      } else if (map[y][x] === TILE.MOUNTAIN) {
        map[y][x] = TILE.PATH; // carve through mountains
      }
      // Move toward target — prefer horizontal movement first
      if (x !== x1) x += x < x1 ? 1 : -1;
      else if (y !== y1) y += y < y1 ? 1 : -1;
    }
  }

  // Connect: North↔Capital, East↔Capital, Capital↔SW, Capital↔SE, North↔East
  drawPathBetween(15, 11, 28, 24);
  drawPathBetween(48, 11, 28, 24);
  drawPathBetween(28, 24, 13, 38);
  drawPathBetween(28, 24, 46, 36);
  drawPathBetween(15, 11, 48, 11);
  // SW to SE via south
  drawPathBetween(13, 38, 46, 36);

  // === Sand at land/water borders ===
  const sandMap = [];
  for (let y = 0; y < H; y++) {
    sandMap[y] = new Array(W).fill(false);
  }
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      if (map[y][x] === TILE.GRASS) {
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (map[y + dy][x + dx] === TILE.WATER) {
              sandMap[y][x] = true;
            }
          }
        }
      }
    }
  }
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (sandMap[y][x]) map[y][x] = TILE.SAND;
    }
  }

  // === Flower meadows ===
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (map[y][x] === TILE.GRASS && tileHash(x + 600, y + 600) > 0.94) {
        map[y][x] = TILE.FLOWERS;
      }
    }
  }

  return map;
}

const MAP_DATA = generateMap();
const MAP_COLS = MAP_DATA[0].length;
const MAP_ROWS = MAP_DATA.length;

function getTile(x, y) {
  // Use active map when inside a town or building
  if (typeof ACTIVE_MAP !== 'undefined' && ACTIVE_MAP) {
    if (x < 0 || y < 0 || x >= ACTIVE_COLS || y >= ACTIVE_ROWS) return TILE.WALL;
    return ACTIVE_MAP[y][x];
  }
  if (x < 0 || y < 0 || x >= MAP_COLS || y >= MAP_ROWS) return TILE.WATER;
  return MAP_DATA[y][x];
}

function isWalkable(x, y) {
  if (WALKABLE[getTile(x, y)] !== true) return false;
  // Check NPC collision
  if (typeof ACTIVE_NPCS !== 'undefined' && ACTIVE_NPCS) {
    for (const npc of ACTIVE_NPCS) {
      if (npc.x === x && npc.y === y) return false;
    }
  }
  return true;
}

// Find a SAND tile adjacent to WATER near the target coordinate
function findShipSpawn(targetX, targetY, radius) {
  for (let r = 0; r <= radius; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
        const x = targetX + dx, y = targetY + dy;
        if (x < 0 || y < 0 || x >= MAP_COLS || y >= MAP_ROWS) continue;
        if (MAP_DATA[y][x] !== TILE.SAND) continue;
        const neighbors = [[x-1,y],[x+1,y],[x,y-1],[x,y+1]];
        for (const [nx, ny] of neighbors) {
          if (nx >= 0 && ny >= 0 && nx < MAP_COLS && ny < MAP_ROWS && MAP_DATA[ny][nx] === TILE.WATER) {
            return { x, y };
          }
        }
      }
    }
  }
  return { x: targetX, y: targetY };
}

const SHIP_SPAWN = findShipSpawn(30, 45, 5);

// Town-to-princess recruitment mapping (excludes capital at 28,24 — that's Angeline's home)
const TOWN_RECRUITMENT = {
  '15,11': {
    name: 'Bathena', role: 'Warrior',
    hp: 60, maxHp: 60, mp: 10, maxMp: 10,
    attack: 16, defense: 10, xp: 0, level: 1,
    spells: []
  },
  '48,11': {
    name: 'Bedalia', role: 'Mage',
    hp: 35, maxHp: 35, mp: 40, maxMp: 40,
    attack: 6, defense: 5, xp: 0, level: 1,
    spells: [{ name: 'Fireball', damage: 30, cost: 12 }, { name: 'Ice Storm', damage: 25, cost: 10 }]
  },
  '13,38': {
    name: 'Banabelle', role: 'Healer',
    hp: 40, maxHp: 40, mp: 35, maxMp: 35,
    attack: 8, defense: 7, xp: 0, level: 1,
    spells: [{ name: 'Holy Light', damage: 18, cost: 6 }]
  },
  '46,36': {
    name: 'Bedava', role: 'Ranger',
    hp: 45, maxHp: 45, mp: 15, maxMp: 15,
    attack: 14, defense: 6, xp: 0, level: 1,
    spells: [{ name: 'Poison Arrow', damage: 22, cost: 8 }]
  },
};

function getTownAt(x, y) {
  for (const key of Object.keys(TOWN_RECRUITMENT)) {
    const [tx, ty] = key.split(',').map(Number);
    if (Math.abs(x - tx) <= 1 && Math.abs(y - ty) <= 1) {
      return key;
    }
  }
  return null;
}
