const DEFAULT_PARTY = [
  {
    name: 'Angeline', role: 'Leader',
    hp: 50, maxHp: 50, mp: 20, maxMp: 20,
    attack: 12, defense: 8, xp: 0, level: 1,
    spells: [{ name: 'Smite', damage: 20, cost: 8 }]
  },
  {
    name: 'Bathena', role: 'Warrior',
    hp: 60, maxHp: 60, mp: 10, maxMp: 10,
    attack: 16, defense: 10, xp: 0, level: 1,
    spells: []
  },
  {
    name: 'Bedalia', role: 'Mage',
    hp: 35, maxHp: 35, mp: 40, maxMp: 40,
    attack: 6, defense: 5, xp: 0, level: 1,
    spells: [{ name: 'Fireball', damage: 30, cost: 12 }, { name: 'Ice Storm', damage: 25, cost: 10 }]
  },
  {
    name: 'Banabelle', role: 'Healer',
    hp: 40, maxHp: 40, mp: 35, maxMp: 35,
    attack: 8, defense: 7, xp: 0, level: 1,
    spells: [{ name: 'Holy Light', damage: 18, cost: 6 }]
  },
  {
    name: 'Bedava', role: 'Ranger',
    hp: 45, maxHp: 45, mp: 15, maxMp: 15,
    attack: 14, defense: 6, xp: 0, level: 1,
    spells: [{ name: 'Poison Arrow', damage: 22, cost: 8 }]
  },
];

const player = {
  x: 28,
  y: 26,
  gold: 100,
  items: [],
  party: [JSON.parse(JSON.stringify(DEFAULT_PARTY[0]))],
  direction: 'down',
};

const ship = {
  x: SHIP_SPAWN.x,
  y: SHIP_SPAWN.y,
  boarded: false
};

function movePlayer(dx, dy) {
  const nx = player.x + dx;
  const ny = player.y + dy;
  if (dx === -1) player.direction = 'left';
  if (dx === 1) player.direction = 'right';
  if (dy === -1) player.direction = 'up';
  if (dy === 1) player.direction = 'down';
  if (ship.boarded) {
    // Sailing: allow movement onto WATER and BRIDGE tiles only
    if (nx < 0 || ny < 0 || nx >= MAP_COLS || ny >= MAP_ROWS) return false;
    const tile = getTile(nx, ny);
    if (tile === TILE.WATER || tile === TILE.BRIDGE) {
      player.x = nx;
      player.y = ny;
      ship.x = nx;
      ship.y = ny;
      return true;
    }
  } else {
    if (isWalkable(nx, ny)) {
      player.x = nx;
      player.y = ny;
      return true;
    }
  }
  return false; // blocked
}

function getPlayerState() {
  return {
    x: player.x, y: player.y, gold: player.gold, items: player.items,
    party: player.party, direction: player.direction,
    ship: { x: ship.x, y: ship.y, boarded: ship.boarded }
  };
}

function loadPlayerState(state) {
  player.x = state.x;
  player.y = state.y;
  player.gold = state.gold;
  player.items = state.items;
  player.party = state.party;
  player.direction = state.direction || 'down';
  if (state.ship) {
    ship.x = state.ship.x;
    ship.y = state.ship.y;
    ship.boarded = state.ship.boarded;
  }
}
