const DEFAULT_PARTY = [
  { name: 'Angeline', role: 'Leader',  hp: 50, maxHp: 50, mp: 20, maxMp: 20 },
  { name: 'Bathena',  role: 'Warrior', hp: 60, maxHp: 60, mp: 10, maxMp: 10 },
  { name: 'Bedalia',  role: 'Mage',    hp: 35, maxHp: 35, mp: 40, maxMp: 40 },
  { name: 'Banabelle',role: 'Healer',  hp: 40, maxHp: 40, mp: 35, maxMp: 35 },
  { name: 'Bedava',   role: 'Ranger',  hp: 45, maxHp: 45, mp: 15, maxMp: 15 },
];

const player = {
  x: 28,
  y: 26,
  gold: 100,
  items: [],
  party: JSON.parse(JSON.stringify(DEFAULT_PARTY)),
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
    if (nx < 0 || ny < 0 || nx >= MAP_COLS || ny >= MAP_ROWS) return;
    const tile = getTile(nx, ny);
    if (tile === TILE.WATER || tile === TILE.BRIDGE) {
      player.x = nx;
      player.y = ny;
      ship.x = nx;
      ship.y = ny;
    }
  } else {
    if (isWalkable(nx, ny)) {
      player.x = nx;
      player.y = ny;
    }
  }
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
