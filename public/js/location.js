// Active map globals — used by getTile/isWalkable when inside town/building
let ACTIVE_MAP = null;
let ACTIVE_COLS = 0;
let ACTIVE_ROWS = 0;
let ACTIVE_NPCS = [];

// Location tracking
const Location = {
  area: 'overworld',  // 'overworld' | 'town' | 'building'
  townId: null,
  buildingId: null,
  savedOverworldPos: null,  // {x, y, direction}
  savedTownPos: null,       // {x, y, direction}
};

// Map from overworld town center coords to town ID
const TOWN_COORDS = {};

function initTownCoords() {
  if (typeof TOWNS === 'undefined') return;
  for (const town of TOWNS) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        TOWN_COORDS[(town.overworldX + dx) + ',' + (town.overworldY + dy)] = town.id;
      }
    }
  }
}

function enterTown(townId) {
  const town = TOWNS.find(t => t.id === townId);
  if (!town) return;

  // Save overworld position
  Location.savedOverworldPos = { x: player.x, y: player.y, direction: player.direction };
  Location.area = 'town';
  Location.townId = townId;
  Location.buildingId = null;

  // Load town map
  ACTIVE_MAP = town.tiles;
  ACTIVE_COLS = town.cols;
  ACTIVE_ROWS = town.rows;
  ACTIVE_NPCS = town.npcs.map(n => Object.assign({}, n));

  // Place player at town entry
  player.x = town.entryX;
  player.y = town.entryY;
  player.direction = 'up';
}

function exitTown() {
  if (!Location.savedOverworldPos) return;

  // Restore overworld position
  player.x = Location.savedOverworldPos.x;
  player.y = Location.savedOverworldPos.y;
  player.direction = Location.savedOverworldPos.direction;

  Location.area = 'overworld';
  Location.townId = null;
  Location.buildingId = null;
  Location.savedOverworldPos = null;
  Location.savedTownPos = null;

  ACTIVE_MAP = null;
  ACTIVE_COLS = 0;
  ACTIVE_ROWS = 0;
  ACTIVE_NPCS = [];
}

function enterBuilding(buildingDef) {
  const town = TOWNS.find(t => t.id === Location.townId);
  if (!town) return;

  // Save town position
  Location.savedTownPos = { x: player.x, y: player.y, direction: player.direction };
  Location.area = 'building';
  Location.buildingId = buildingDef.id;

  // Load building map
  ACTIVE_MAP = buildingDef.tiles;
  ACTIVE_COLS = buildingDef.cols;
  ACTIVE_ROWS = buildingDef.rows;
  ACTIVE_NPCS = buildingDef.npcs ? buildingDef.npcs.map(n => Object.assign({}, n)) : [];

  player.x = buildingDef.entryX;
  player.y = buildingDef.entryY;
  player.direction = 'up';
}

function exitBuilding() {
  const town = TOWNS.find(t => t.id === Location.townId);
  if (!town || !Location.savedTownPos) return;

  // Restore town position
  player.x = Location.savedTownPos.x;
  player.y = Location.savedTownPos.y;
  player.direction = Location.savedTownPos.direction;

  Location.area = 'town';
  Location.buildingId = null;

  // Reload town map
  ACTIVE_MAP = town.tiles;
  ACTIVE_COLS = town.cols;
  ACTIVE_ROWS = town.rows;
  ACTIVE_NPCS = town.npcs.map(n => Object.assign({}, n));
  Location.savedTownPos = null;
}

// Find which building a door belongs to in the current town
function findBuildingAtDoor(x, y) {
  const town = TOWNS.find(t => t.id === Location.townId);
  if (!town || !town.buildings) return null;
  return town.buildings.find(b => b.doorX === x && b.doorY === y) || null;
}

function getLocationState() {
  return {
    area: Location.area,
    townId: Location.townId,
    buildingId: Location.buildingId,
    savedOverworldPos: Location.savedOverworldPos,
    savedTownPos: Location.savedTownPos,
  };
}

function loadLocationState(state) {
  if (!state) return;
  Location.area = state.area || 'overworld';
  Location.townId = state.townId || null;
  Location.buildingId = state.buildingId || null;
  Location.savedOverworldPos = state.savedOverworldPos || null;
  Location.savedTownPos = state.savedTownPos || null;

  // Restore active map based on location
  if (Location.area === 'town' && Location.townId) {
    const town = TOWNS.find(t => t.id === Location.townId);
    if (town) {
      ACTIVE_MAP = town.tiles;
      ACTIVE_COLS = town.cols;
      ACTIVE_ROWS = town.rows;
      ACTIVE_NPCS = town.npcs.map(n => Object.assign({}, n));
    }
  } else if (Location.area === 'building' && Location.townId && Location.buildingId) {
    const town = TOWNS.find(t => t.id === Location.townId);
    if (town) {
      const building = town.buildings.find(b => b.id === Location.buildingId);
      if (building) {
        ACTIVE_MAP = building.tiles;
        ACTIVE_COLS = building.cols;
        ACTIVE_ROWS = building.rows;
        ACTIVE_NPCS = building.npcs ? building.npcs.map(n => Object.assign({}, n)) : [];
      }
    }
  } else {
    ACTIVE_MAP = null;
    ACTIVE_COLS = 0;
    ACTIVE_ROWS = 0;
    ACTIVE_NPCS = [];
  }
}
