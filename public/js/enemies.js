// Enemy definitions for random encounters
// Each enemy has stats balanced against the starting party (leader: 50 HP, attacks ~8-15)

const ENEMY_TYPES = [
  {
    name: 'Slime',
    hp: 15, maxHp: 15,
    attack: 6, defense: 2,
    xpReward: 5, goldReward: 3,
    spells: [],
    color: '#44cc88',
    shape: 'blob'
  },
  {
    name: 'Goblin',
    hp: 22, maxHp: 22,
    attack: 9, defense: 3,
    xpReward: 8, goldReward: 6,
    spells: [],
    color: '#66aa44',
    shape: 'humanoid'
  },
  {
    name: 'Shadow Bat',
    hp: 18, maxHp: 18,
    attack: 8, defense: 2,
    xpReward: 7, goldReward: 4,
    spells: [],
    color: '#6644aa',
    shape: 'bat'
  },
  {
    name: 'Wolf',
    hp: 28, maxHp: 28,
    attack: 11, defense: 4,
    xpReward: 12, goldReward: 5,
    spells: [],
    color: '#888899',
    shape: 'beast'
  },
  {
    name: 'Skeleton',
    hp: 30, maxHp: 30,
    attack: 10, defense: 6,
    xpReward: 14, goldReward: 10,
    spells: [],
    color: '#ddddcc',
    shape: 'humanoid'
  },
  {
    name: 'Dark Sprite',
    hp: 20, maxHp: 20,
    attack: 7, defense: 3,
    xpReward: 10, goldReward: 8,
    spells: [{ name: 'Shadow Bolt', damage: 14 }],
    color: '#aa44cc',
    shape: 'fairy'
  },
  {
    name: 'Troll',
    hp: 45, maxHp: 45,
    attack: 13, defense: 7,
    xpReward: 20, goldReward: 15,
    spells: [],
    color: '#558844',
    shape: 'large'
  },
  {
    name: 'Evil Sorcerer',
    hp: 35, maxHp: 35,
    attack: 8, defense: 5,
    xpReward: 25, goldReward: 20,
    spells: [
      { name: 'Dark Fire', damage: 18 },
      { name: 'Curse', damage: 12 }
    ],
    color: '#993366',
    shape: 'wizard'
  }
];

// Returns a deep copy of a random enemy
function getRandomEnemy() {
  const idx = Math.floor(Math.random() * ENEMY_TYPES.length);
  return JSON.parse(JSON.stringify(ENEMY_TYPES[idx]));
}
